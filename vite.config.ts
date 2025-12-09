import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/performance-camerite/', // Nome exato do repositório entre barras
  build: {
    outDir: 'docs', // Define a pasta de saída para 'docs' para facilitar o deploy
  },
})