import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Optional legacy path — does NOT pass Safaricom mobile-network auth (always 401 from laptop).
      // The app calls identity.safaricom.com directly from the browser instead.
      '/safaricom': {
        target: 'https://identity.safaricom.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/safaricom/, ''),
      },
    },
  },
})
