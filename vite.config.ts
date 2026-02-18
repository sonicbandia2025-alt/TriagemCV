import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Correctly map the VITE_API_KEY to process.env.API_KEY for the SDK
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || ''),
      // Safe fallback for other process.env usage without wiping the object
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }
  }
})