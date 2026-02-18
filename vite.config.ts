import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // process.cwd() works because we run this in Node environment during build
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Fix for Google GenAI SDK which relies on process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || ''),
      // Prevent crashes in libraries that expect process.env.NODE_ENV
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    }
  }
})