import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ⚠️ IMPORTANTE para hosting estático:
  // - Si desplegarás en la raíz del dominio: base: '/'
  // - Si desplegarás en subcarpeta: base: '/nombre-carpeta/'
  base: './', // Rutas relativas - funciona en cualquier ubicación
})
