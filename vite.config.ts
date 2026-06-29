import { defineConfig } from 'vite'
import path from 'path'

// Vite config for the Rumble Pets prototype. Server binds to all
// interfaces to make it easy to open from other devices on the LAN.
export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    host: true
  },
  optimizeDeps: {
    include: ['phaser']
  },
  build: {
    outDir: 'dist'
  }
})
