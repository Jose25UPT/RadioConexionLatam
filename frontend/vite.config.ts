import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react', 'react-router-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          editor: ['@ckeditor/ckeditor5-build-classic', '@ckeditor/ckeditor5-react'],
          icons: ['lucide-react'],
          routing: ['react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    // Proxy de desarrollo: redirige llamadas al backend FastAPI
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
