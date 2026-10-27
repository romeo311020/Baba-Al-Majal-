import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' يجعل المشروع يعمل على أي استضافة ثابتة أو مجلد فرعي (GitHub Pages مثلًا).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    // أثناء التطوير: أي طلب /api يُحوَّل إلى الخادم الوسيط المحلي (server/index.js)
    proxy: {
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
