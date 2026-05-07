import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5183,
  },
  optimizeDeps: {
    include: ['react-dnd', 'react-dnd-html5-backend', '@minoru/react-dnd-treeview']
  }
})
