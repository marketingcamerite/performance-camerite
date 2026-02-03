import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Caminho base exato do seu repositório no GitHub
  base: '/performance-camerite/',
  build: {
    // Gera o build na pasta 'docs' em vez de 'dist'
    outDir: 'docs',
  },
})