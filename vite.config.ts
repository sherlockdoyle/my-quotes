import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { glob, unlink } from 'node:fs/promises';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
    tailwindcss(),
    {
      name: 'delete-ort-wasm',
      closeBundle: async () => {
        // this file is not used and seems to be downloaded from CDN when the site loads
        for await (const file of glob('dist/assets/ort-wasm-simd-threaded.*.wasm')) {
          console.log('deleting', file);
          unlink(file);
        }
      },
    },
  ],
  base: '/my-quotes',
});
