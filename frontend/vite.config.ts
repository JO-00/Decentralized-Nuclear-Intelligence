import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    fs: {
      // Allow Vite to serve files from the parent folder (Nuclear\)
      // so we can import the Foundry artifact from hashgraph/out/...
      allow: [
        '.',                          // project root
        path.resolve(__dirname, '..') // one level up → C:\Users\NITRO\Downloads\Nuclear
      ],
    },
  },
  
})