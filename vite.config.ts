import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // O nome do repositório entre barras é OBRIGATÓRIO para funcionar o CSS e JS
  base: '/performance-camerite/', 
  build: {
    // Isso força o Vite a criar a pasta "docs" em vez de "dist"
    outDir: 'docs',
  },
})