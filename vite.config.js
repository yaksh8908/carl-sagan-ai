import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // O navegador conversa só com o Vite; as chamadas /api vão para o servidor Node nativo.
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: false },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          ui: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
        },
      },
    },
  },
});
