import { defineConfig } from 'vite'
import Uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [Uni.default ? Uni.default() : (Uni as any)()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
