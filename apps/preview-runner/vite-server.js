import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export async function createViteDevServer() {
  const vite = await createServer({
    configFile: false,
    root: fileURLToPath(new URL('./src', import.meta.url)),
    server: {
      middlewareMode: true,
      hmr: {
        port: 24678, // Use a different port for HMR
      },
    },
    plugins: [
      react()
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify('development'),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  });
  
  return vite;
}