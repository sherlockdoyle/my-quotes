# This code was AI generated. A few manual tweaks were also made.

import numpy as np
from sklearn.decomposition import TruncatedSVD
from scipy.spatial.distance import cosine, euclidean
import json
import struct

data = {
  "46736": [ "hor", "fds" ],
  ... # rest of the id to category mappings
}

class LabelEmbedder:
    """
    Creates low-dimensional embeddings from label sets and enables
    probabilistic similarity-based item lookup.
    """

    def __init__(self, n_components=8):
        """
        Args:
            n_components: Number of dimensions to reduce to (default 8)
        """
        self.n_components = n_components
        self.label_to_idx = {}
        self.embeddings = {}  # {id: embedding_vector}
        self.id_list = []
        self.svd = None
        self.raw_vectors = None

    def fit(self, items):
        """
        Fit embeddings from a list of {id, labels}.

        Args:
            items: List of dicts with 'id' and 'labels' (list of label strings)
        """
        # Build label vocabulary
        all_labels = set()
        for item in items:
            all_labels.update(item['labels'])

        self.label_to_idx = {label: idx for idx, label in enumerate(sorted(all_labels))}
        n_labels = len(self.label_to_idx)

        # Create binary vectors
        binary_vectors = []
        self.id_list = []

        for item in items:
            vec = np.zeros(n_labels, dtype=np.float32)
            for label in item['labels']:
                vec[self.label_to_idx[label]] = 1.0
            binary_vectors.append(vec)
            self.id_list.append(item['id'])

        self.raw_vectors = np.array(binary_vectors)

        # Apply SVD dimensionality reduction
        self.svd = TruncatedSVD(n_components=min(self.n_components, len(self.id_list) - 1))
        reduced_vectors = self.svd.fit_transform(self.raw_vectors)

        # Normalize for better distance metrics
        reduced_vectors = reduced_vectors / (np.linalg.norm(reduced_vectors, axis=1, keepdims=True) + 1e-8)

        # Store embeddings
        for idx, item_id in enumerate(self.id_list):
            self.embeddings[item_id] = reduced_vectors[idx]

        print(f"✓ Fitted {len(items)} items with {n_labels} labels → {self.n_components}D embeddings")
        print(f"  Label vocabulary: {list(self.label_to_idx.keys())}")
        print(f"  Explained variance: {sum(self.svd.explained_variance_ratio_):.2%}")
        return sum(self.svd.explained_variance_ratio_)

    def query(self, id_in, k=5, temperature=1.0):
        """
        Find related items probabilistically based on embedding distance.

        Args:
            id_in: Query item ID
            k: Number of candidates to return (default 5)
            temperature: Controls softmax sharpness. Higher = flatter distribution.
                        Lower = sharper (favor closer items more).

        Returns:
            List of (id_out, probability, distance) tuples, sorted by probability descending
        """
        if id_in not in self.embeddings:
            raise ValueError(f"ID '{id_in}' not found in embeddings")

        query_embedding = self.embeddings[id_in]

        # Calculate distances to all other items
        distances = []
        for other_id in self.id_list:
            if other_id == id_in:
                continue
            other_embedding = self.embeddings[other_id]
            # Use cosine distance (0 = identical, 1 = orthogonal)
            dist = cosine(query_embedding, other_embedding)
            distances.append((other_id, dist))

        # Convert distances to probabilities using inverse softmax
        # Closer items (smaller distance) → higher probability
        distances_array = np.array([d[1] for d in distances])

        # Invert distances: smaller distance → larger score
        scores = 1.0 - distances_array

        # Apply softmax with temperature
        exp_scores = np.exp(scores / temperature)
        probabilities = exp_scores / np.sum(exp_scores)

        # Combine and sort by probability
        results = [
            (distances[i][0], probabilities[i], distances[i][1])
            for i in range(len(distances))
        ]
        results.sort(key=lambda x: x[1], reverse=True)

        return results[:k]

    def sample(self, id_in, n_samples=3, temperature=1.0):
        """
        Probabilistically sample related items based on embedding similarity.

        Args:
            id_in: Query item ID
            n_samples: Number of items to sample
            temperature: Softmax temperature

        Returns:
            List of sampled (id_out, probability) tuples
        """
        if id_in not in self.embeddings:
            raise ValueError(f"ID '{id_in}' not found in embeddings")

        query_embedding = self.embeddings[id_in]

        # Calculate probabilities
        probs = {}
        total_score = 0.0

        for other_id in self.id_list:
            if other_id == id_in:
                continue
            other_embedding = self.embeddings[other_id]
            dist = cosine(query_embedding, other_embedding)
            score = 1.0 - dist
            exp_score = np.exp(score / temperature)
            probs[other_id] = exp_score
            total_score += exp_score

        # Normalize to probabilities
        for id_out in probs:
            probs[id_out] /= total_score

        # Sample without replacement
        ids = list(probs.keys())
        prob_values = np.array([probs[id_] for id_ in ids])

        sampled_indices = np.random.choice(
            len(ids), size=min(n_samples, len(ids)), replace=False, p=prob_values
        )

        sampled = [(ids[i], probs[ids[i]]) for i in sampled_indices]
        sampled.sort(key=lambda x: x[1], reverse=True)
        return sampled

items = [{"id": id, "labels": labels} for (id, labels) in data.items()]
embedder = LabelEmbedder(n_components=3)
embedder.fit(items) # Explained variance: 54.36%

output_filename = 'categories.emb'
with open(output_filename, 'wb') as f:
    for item_id, embedding in embedder.embeddings.items():
        # Write the ID as a null-terminated string
        f.write(item_id.encode('utf-8'))
        f.write(b'\0')

        # Write the embedding vector as float32 values
        for value in embedding:
            f.write(struct.pack('<f', value)) # Use '<f' for little-endian float32