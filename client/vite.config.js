import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import process from 'node:process'

// Enable React support and fast refresh while developing.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
