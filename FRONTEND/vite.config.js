import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve('src/'),
      "@pages": path.resolve('src/pages/'),
      "@components": path.resolve('src/components/'),
      "@tools": path.resolve('src/tools/'),
      "@assets": path.resolve('src/assets/'),
      "@routes": path.resolve('src/routes/'),
      "@hooks": path.resolve('src/hooks/'),
    },
  },
})
