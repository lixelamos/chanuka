import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dev-only proxy to avoid CORS when calling Safaricom Identity API from the browser.
      // In production, configure your hosting (nginx/vercel/railway) to proxy this path similarly.
      '/safaricom': {
        target: 'https://identity.safaricom.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/safaricom/, ''),
      },
    },
  },
})
