import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    },
    headers: {
      // Required for SharedArrayBuffer used by some WASM runtimes (Transformers.js)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  },
  optimizeDeps: {
    // Exclude transformers from pre-bundling — it ships its own ESM + WASM
    exclude: ['@huggingface/transformers'],
  },
  build: {
    rollupOptions: {
      output: {
        // Split @huggingface/transformers into its own chunk (Rolldown function form)
        manualChunks(id) {
          if (id.includes('@huggingface/transformers')) {
            return 'transformers';
          }
        },
      },
    },
  },
})
