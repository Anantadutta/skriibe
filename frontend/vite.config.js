import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        '..',
        'C:/Users/dutta/.gemini/antigravity/brain/18820653-50d7-4b1e-9c85-9c1fabb537c2'
      ]
    }
  }
})
