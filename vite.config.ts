import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // O base deve ser o nome do repositório entre barras
  base: '/performance-camerite/',
  build: {
    // Define a pasta de saída como 'docs' para facilitar o deploy no GitHub Pages
    outDir: 'docs',
  }
})