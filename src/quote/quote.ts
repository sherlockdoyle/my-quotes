export interface Quote {
  d: string; // date
  t: string; // text
  c: string; // caption
  f: 'i' | 'g'; // image or gif
  m?: [
    s: number, // start
    e: number, // end
  ][]; // mentions
  l?: string[]; // categories
  h: string; // url
  p: string; // previous
  n: string; // next
}

export async function getQuote(id: string): Promise<Quote> {
  return await (await fetch(`${import.meta.env.BASE_URL}/quotes/${id}.json`)).json();
}
