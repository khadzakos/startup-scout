import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    headers: {
      'Content-Security-Policy': "frame-ancestors 'self' https://oauth.telegram.org https://telegram.org; frame-src 'self' https://oauth.telegram.org https://telegram.org;"
    }
  },
});
