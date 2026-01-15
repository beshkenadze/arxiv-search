import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const R2_DATA_URL = process.env.VITE_R2_DATA_URL || ''

export default defineConfig({
  plugins: [react()],
  define: {
    __R2_DATA_URL__: JSON.stringify(R2_DATA_URL),
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
})
