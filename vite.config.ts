import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/performance-camerite/', // 👈 ESSENCIAL PARA FUNCIONAR NO GITHUB PAGES
  plugins: [react()],
})