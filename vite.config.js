import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: undefined, // evitar split demasiado agresivo
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2015'
    }
  }
})
