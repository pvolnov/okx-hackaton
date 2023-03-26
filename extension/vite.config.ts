import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import nodePolyfills from 'rollup-plugin-polyfill-node'

//@ts-ignore
import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        build: {
          rollupOptions: {
            plugins: [nodePolyfills()],
          },
          commonjsOptions: {
            transformMixedEsModules: true,
          },
        },
        input: {
          web: 'src/web/web.ts',
        },
        output: {
          entryFileNames: 'web.js',
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },

    plugins: [crx({ manifest }), react()],
  }
})
