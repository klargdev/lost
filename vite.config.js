import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    loader: 'jsx',  // Ensure this is set for JSX
  },
});
