import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11', 'iOS >= 11'],
      modernPolyfills: true,
    })
    
  ],
  build: {
    target: 'es2015',
    minify: 'terser', // Asegúrate de usar Terser para mejor compatibilidad
    chunkSizeWarningLimit: 1600, // Evita warnings de chunks grandes
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2015',
    },
  },
})
