import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // O base deve ser o nome exato do repositório entre barras
  base: '/Projeto-Franqueado/',
  build: {
    // Força o build a gerar a pasta 'docs' em vez de 'dist'
    outDir: 'docs',
  }
})