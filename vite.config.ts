import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@jsquash/avif'],
  },
  worker: {
    format: 'es',
  },
});
