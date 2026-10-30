import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // /kit shows Figma reference screenshots from ../docs/figma-refs
  server: { fs: { allow: ['..'] } },
})
