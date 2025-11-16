import { type FeatureExtractionPipeline } from '@huggingface/transformers';
import { cosSimForNormedVec, parseEmbedding, type Emb } from '../util/emb';

const TOKENIZER_RE = /(#\w*|:\w*|[()|&]|[^#:\(\)\|&]+)/g;

type Token = { type: 'and' | 'or' | 'lpar' | 'rpar' } | { type: 'id'; text: string };

function isIden(token: string): boolean {
  return token.startsWith('#') || token.startsWith(':');
}
function normalizeTokens(tokens: string[]): Token[] {
  const tokArr: Token[] = [];
  let prev: 'none' | 'id' | 'op' | 'lpar' | 'rpar' = 'none';
  for (let i = 0, l = tokens.length; i < l; ++i) {
    let token = tokens[i];

    if (isIden(token)) {
      if (prev === 'id' || prev === 'rpar') tokArr.push({ type: 'and' });
      tokArr.push({ type: 'id', text: token });
      prev = 'id';
    } else if (token === '&' || token === '|') {
      let numAnd = 0,
        numOr = 0;
      while (i < l && (token === '&' || token === '|')) {
        if (token === '&') numAnd++;
        else numOr++;
        token = tokens[++i];
      }

      if (prev === 'id' || prev === 'rpar') {
        if (numAnd > 0) tokArr.push({ type: 'and' });
        else if (numOr > 0) tokArr.push({ type: 'or' });
        else tokArr.push({ type: 'and' }); // should not happen
        prev = 'op';
      }
      --i; // back up
    } else if (token === '(') {
      if (prev === 'id' || prev === 'rpar') tokArr.push({ type: 'and' });
      tokArr.push({ type: 'lpar' });
      prev = 'lpar';
    } else if (token === ')') {
      tokArr.push({ type: 'rpar' });
      prev = 'rpar';
    } else {
      // should not happen
    }
  }

  return tokArr;
}

class Parser {
  private pos = 0;

  constructor(
    private tokens: Token[],
    private valuesOf: (iden: string) => Set<string> | null,
  ) {}

  solve(): Set<string> | null {
    let result = this.parseExpr();
    while (this.pos < this.tokens.length) {
      if (this.tokens[this.pos].type === 'rpar') ++this.pos;
      else if (this.tokens[this.pos].type === 'and' || this.tokens[this.pos].type === 'or') ++this.pos;
      else {
        const extra = this.parseTerm();
        if (result && extra) result = result.intersection(extra);
        else if (result || extra) result = result ?? extra;
      }
    }
    return result;
  }

  private skipRpars() {
    while (this.pos < this.tokens.length && this.tokens[this.pos].type == 'rpar') ++this.pos;
  }

  private parseExpr(): Set<string> | null {
    this.skipRpars();

    let v = this.parseTerm();
    while (this.pos < this.tokens.length && this.tokens[this.pos].type === 'or') {
      const curPos = this.pos;
      ++this.pos;
      if (!this.canStartFactor()) {
        this.pos = curPos;
        break;
      }
      const rhs = this.parseTerm();
      if (v && rhs) v = v.union(rhs);
      else if (v || rhs) v = v ?? rhs;
    }
    return v;
  }

  private parseTerm(): Set<string> | null {
    this.skipRpars();
    if (!this.canStartFactor()) return null;

    let v = this.parseFactor();
    while (this.pos < this.tokens.length && this.tokens[this.pos].type === 'and') {
      const curPos = this.pos;
      ++this.pos;
      if (!this.canStartFactor()) {
        this.pos = curPos;
        break;
      }
      const rhs = this.parseFactor();
      if (v && rhs) v = v.intersection(rhs);
      else if (v || rhs) v = v ?? rhs;
    }
    return v;
  }

  private canStartFactor(): boolean {
    if (this.pos >= this.tokens.length) return false;

    const tokenType = this.tokens[this.pos].type;
    return tokenType === 'id' || tokenType === 'lpar';
  }
  private parseFactor(): Set<string> | null {
    if (this.pos >= this.tokens.length) return null;

    const cur = this.tokens[this.pos];
    if (cur.type === 'id') {
      ++this.pos;
      return this.valuesOf(cur.text);
    } else if (cur.type === 'lpar') {
      ++this.pos;
      const v = this.parseExpr();
      if (this.pos < this.tokens.length && this.tokens[this.pos].type !== 'rpar') ++this.pos;
      return v;
    } else {
      if (cur.type === 'rpar') ++this.pos;
      return null;
    }
  }
}

export class Searcher {
  private semModel?: { model: FeatureExtractionPipeline; emb: Emb };

  constructor(
    private tagsMap: Record<string, string[]> | undefined,
    private catsMap: Record<string, string[]> | undefined,
    private semanticEnabled: boolean,
  ) {}

  async doSearch(query: string): Promise<string[]> {
    const [normalText, tokens] = this.tokenize(query);
    const result = new Parser(normalizeTokens(tokens), iden => {
      const type = iden.charAt(0);
      iden = iden.slice(1).toLowerCase();
      if (!iden) return null; // return null if empty string

      const ids = type === '#' ? this.tagsMap?.[iden] : this.catsMap?.[iden];
      return ids ? new Set(ids) : new Set();
    }).solve();

    if (this.semanticEnabled && normalText) {
      return await this.semanticSort(result && Array.from(result), normalText);
    }
    return result ? Array.from(result) : [];
  }

  private tokenize(query: string): [normalText: string, tokens: string[]] {
    const tokens = query.match(TOKENIZER_RE) || [];

    const normalTexts = [],
      filteredTokens = [];
    for (const token of tokens) {
      if (isIden(token) || token === '&' || token === '|' || token === '(' || token === ')') filteredTokens.push(token);
      else if (this.semanticEnabled) normalTexts.push(token); // no need for normal text if we are not doing semantic search
    }

    return [normalTexts.join(' ').trim().replace(/\s+/g, ' '), filteredTokens];
  }

  private async semanticSort(ids: string[] | null, normalText: string): Promise<string[]> {
    if (!this.semModel) {
      const { pipeline } = await import('@huggingface/transformers');
      const modelPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'); // we don't await this here as it will load in parallel with the embedding
      const emb = parseEmbedding(
        new DataView(await (await fetch(`${import.meta.env.BASE_URL}/content.emb`)).arrayBuffer()),
        384,
      );
      this.semModel = { model: await modelPromise, emb };
    }

    const curEmb = await this.semModel.model(normalText, { pooling: 'mean', normalize: true });

    if (!ids) ids = Object.keys(this.semModel.emb);
    const similarities = ids.map(id => ({
      id,
      sim: cosSimForNormedVec(curEmb.data as Float32Array, this.semModel!.emb[id]),
    }));

    const mean = similarities.reduce((a, b) => a + b.sim, 0) / similarities.length;
    return similarities
      .filter(({ sim }) => sim > mean)
      .sort((a, b) => b.sim - a.sim)
      .map(({ id }) => id);
  }
}
