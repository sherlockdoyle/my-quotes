import { useQuery } from '@tanstack/react-query';
import { Dices, EqualApproximately, Loader } from 'lucide-react';
import type { FC } from 'react';
import { useLocation } from 'wouter';
import { cosSimForNormedVec, parseEmbedding, type Emb } from '../util/emb';

function findSimilar(emb: Emb, qId: string): string {
  const keys = Object.keys(emb),
    n = keys.length - 1;

  const ids: string[] = [];
  const sims: number[] = [];
  let maxSim = -Infinity;
  const qEmb = emb[qId];
  for (let k = 0; k <= n; ++k) {
    const id = keys[k];
    if (id === qId) continue;

    ids.push(id);
    const sim = cosSimForNormedVec(qEmb, emb[id]);
    sims.push(sim);

    if (sim > maxSim) maxSim = sim;
  }

  const weights = new Float32Array(n);
  let total = 0;
  for (let i = 0; i < n; ++i) {
    const w = Math.exp(sims[i] - maxSim);
    weights[i] = w;
    total += w;
  }

  let r = Math.random() * total;
  for (let i = 0; i < n; ++i) {
    r -= weights[i];
    if (r <= 0) return ids[i];
  }

  return ids[n - 1];
}

const RandomSimilar: FC<{ id: string }> = ({ id }) => {
  const categoryEmb = useQuery({
    queryKey: ['categoryEmb'],
    queryFn: async () =>
      parseEmbedding(new DataView(await (await fetch(`${import.meta.env.BASE_URL}/categories.emb`)).arrayBuffer()), 3),
  });

  const [, navigate] = useLocation();

  if (categoryEmb.isError) return null;

  return (
    <button
      className='border-border bg-card hover:bg-muted inline-flex cursor-pointer items-center rounded-lg border p-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'
      title='Random similar quote'
      disabled={categoryEmb.isPending}
      onClick={() => {
        if (categoryEmb.data) navigate(`/quote/${findSimilar(categoryEmb.data, id)}`);
      }}
    >
      {categoryEmb.isPending ? (
        <Loader className='h-4 w-4 animate-spin' />
      ) : (
        <>
          <Dices className='h-5 w-5' />
          <EqualApproximately className='h-5 w-5' />
        </>
      )}
    </button>
  );
};
export default RandomSimilar;
