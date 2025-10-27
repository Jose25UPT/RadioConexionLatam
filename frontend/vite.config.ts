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
    // Proxy de desarrollo: redirige llamadas al backend FastAPI
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Si tu backend ya sirve /api sin prefijo adicional, reescribe tal cual
        // rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      // Si las imágenes de noticias se sirven desde /media en el backend
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
