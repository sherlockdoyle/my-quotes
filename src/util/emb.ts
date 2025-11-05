export type Emb = Record<string, Float32Array>;

export function parseEmbedding(dataView: DataView, dims: number): Emb {
  const embeddings: Emb = {};

  let i = 0,
    c = 0;
  while (i < dataView.byteLength) {
    let id = '';
    while ((c = dataView.getUint8(i++)) !== 0) id += String.fromCharCode(c);

    const embedding = new Float32Array(dims);
    for (let j = 0; j < dims; j++, i += 4) embedding[j] = dataView.getFloat32(i, true);

    embeddings[id] = embedding;
  }

  return embeddings;
}

// essentially dot product
// we use this because we do not want to import the xenova library right now
export function cosSimForNormedVec(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0, l = a.length; i < l; ++i) dot += a[i] * b[i];
  return dot;
}
