import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // 🚀 Base dinámica según el entorno:
  // - Desarrollo (npm run dev): base: '/' → funciona en localhost:5173
  // - Producción (npm run build): base: '/bienestar/' → funciona en /bienestar
  base: mode === 'production' ? '/bienestar/' : '/',
}))
