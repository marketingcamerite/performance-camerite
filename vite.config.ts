import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/performance-camerite/',
  // ADICIONE ESTE BLOCO:
  build: {
    outDir: 'docs',
  },
})