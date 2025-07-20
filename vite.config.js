import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      'chunk-DA4CLY3S',
      'chunk-H7Y3XI4O',
      'chunk-7D3GR2RP',
      'chunk-S7HV3UHF',
      'chunk-2FDFPQ4N',
      'chunk-M4DKIFKW',
      'chunk-S4GKKY27',
      'chunk-3FOLTSP2',
      'chunk-SMCFFUSO'
    ]
  },
  server: {
    proxy: {
      '/firestore.googleapis.com': {
        target: 'https://firestore.googleapis.com',
        changeOrigin: true,
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      },
      '/identitytoolkit.googleapis.com': {
        target: 'https://identitytoolkit.googleapis.com',
        changeOrigin: true,
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    },
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  }
});