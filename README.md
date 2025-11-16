# My Quotes

Once upon a long, long time ago, I used to write stories on [YourQuote](https://www.yourquote.in/). This started when I took part in a story-writing competition hosted by Eclectica, the literature club of my college. Since then, I've written many things-although nowadays I'm more interested in writing code rather than stories. This repository and the website are a collection of all the quotes I've written over the years, a backup of sorts.

On a side note, I would request that you support YourQuote-they have been open with their problems. In a world filled with short videos, the culture of reading short stories has been lost. Maybe with your help, we can bring that back!

## Technical Details

### Libraries and Frameworks

The user interface is built with [React](https://react.dev), styling is done with [TailwindCSS](https://tailwindcss.com), and the whole project is bundled with [Vite](https://vite.dev).

To handle data fetching, I used [Tanstack React Query](https://tanstack.com/query/latest/). For routing, I chose [Wouter](https://github.com/molefrog/wouter) because it's simple and lightweight. The semantic search feature is powered by the [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) model, which runs directly in the browser thanks to the [Transformers.js](https://huggingface.co/docs/transformers.js/index) library (using the [Xenova/all-MiniLM-L6-v2](https://huggingface.co/Xenova/all-MiniLM-L6-v2) version).

### Random Similar Quotes

At the bottom of each quote's page, you'll find a 'random similar' button. This button fetches a random quote that has similar themes to the one you are currently reading.

#### Offline Preparation: Creating Embeddings

The offline training process generates quote embeddings where each quote is associated with a set of categories. I wrote an offline script, which you can see at [create-cat-emb.py](./create-cat-emb.py), to handle this.

First, I converted each quote's list of categories into a 19-dimensional binary vector (where `1` means the quote has that category). I used [`TruncatedSVD`](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.TruncatedSVD.html) to reduce these vectors to just 3 dimensions. I decided to choose 3 because it was the smallest dimension that still had an explained variance of over 50%, which felt like a good enough trade-off.

After normalizing these new 3D vectors, I serialized them into a single binary file. This file stores each quote as its ID (as a null-terminated string), immediately followed by the three floating-point numbers that make up its embedding.

#### On the Fly: Weighted Random Sampling

When you click the 'random similar' button on the website, the runtime code in [RandomSimilar.tsx](./src/quote/RandomSimilar.tsx) gets to work.

First, it looks up the embedding for the current quote. Then, it calculates the cosine similarity between this embedding and every other quote's embedding. These similarity scores are passed through an exponential function, which gives a much higher weight to quotes with greater similarity. Finally, it performs a weighted random sampling to pick one quote.

#### The Gist

The main idea is that quotes with a similar set of categories will have embeddings that are close to each other in the vector space. The querying process finds quotes with high cosine similarity (meaning, they are 'close') and then uses a biased random sampling method to pick one. This ensures that while highly similar quotes are more likely to be selected, less similar quotes still have a chance, introducing a bit of variety in the results.

### Search

The search feature allows you to search by tags and categories, and you can even use binary operators like `AND` and `OR` or group terms with parentheses. To make this work, I wrote a basic and forgiving expression parser, which you can find in [search.ts](./src/search/search.ts). The parser tries its best to understand what you mean, even if you have an unmatched parenthesis or a repeated operator.

#### Semantic Search

You can also enable semantic search. Instead of just matching keywords, this feature tries to find quotes that match the *meaning* of your search query. When you type in the search box, it uses the `Transformers.js` library to generate an embedding for your query.

I had already pre-computed embeddings for all the quotes (using the quote's `text + ' ' + caption`) and stored them in the same format as the category embeddings. During a search, the site first filters the quotes based on your tag/category expression. Then, it sorts the remaining results by their embedding's cosine similarity with your query's embedding. Finally, to give you the most relevant results, it only takes the quotes whose similarity score is greater than the mean of all the scores. It's a simple way to search for and sort quotes that are similar to what you're looking for.