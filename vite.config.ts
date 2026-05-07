import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { transform } from 'esbuild'

/** impact-ui deep-imports ship JSX in `.js` and `.jsx`; Rollup cannot parse them without this pass */
function impactUiJsxPlugin(): Plugin {
  return {
    name: 'impact-ui-jsx',
    enforce: 'pre',
    async transform(code, id) {
      const isImpactUi = id.includes(`${path.sep}node_modules${path.sep}impact-ui${path.sep}`)
      if (!isImpactUi || (!id.endsWith('.js') && !id.endsWith('.jsx'))) {
        return null
      }
      const result = await transform(code, {
        loader: 'jsx',
        jsx: 'automatic',
        sourcefile: id,
        sourcemap: false,
      })
      return { code: result.code }
    },
  }
}

export default defineConfig({
  plugins: [impactUiJsxPlugin(), react(), tailwindcss()],
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
})
