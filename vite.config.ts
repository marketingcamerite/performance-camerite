import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/performance-camerite/', // Nome exato do repositório entre barras
  build: {
    outDir: 'docs', // Força o build para a pasta 'docs'
  }
})