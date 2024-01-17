import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import generouted from '@generouted/react-router/plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    generouted({
      source: { routes: './app/src/pages/**/[\\w[-]*.{jsx,tsx}', modals: './app/src/pages/**/[+]*.{jsx,tsx}' },
      output: './app/src/router.ts',
    }),
  ],
  server: {
    open: '/',
    host: true,
  },
  esbuild: {
    logOverride: {
      'this-is-undefined-in-esm': 'silent',
    },
  },
  resolve: {
    alias: {
      '@root': '/app/src',
      '@libs': '/libs',
      '@components': '/app/src/components',
      '@layouts': '/app/src/layouts',
    },
  },
});
