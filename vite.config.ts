import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // The three.js chunk is large by nature; it is lazy-loaded after the HTML is usable.
    chunkSizeWarningLimit: 1500,
  },
});
