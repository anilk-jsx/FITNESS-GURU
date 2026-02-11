import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api.php': {
        target: 'https://api.fitnessguru.org.in',
        changeOrigin: true
      }
    }
  }
})
