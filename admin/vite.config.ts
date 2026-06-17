import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Relative base so the built site works when served from a GitHub Pages subpath.
export default defineConfig({
  base: './',
  plugins: [react()],
})
