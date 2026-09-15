import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { fonts } from 'tailwind-vite-font-kit'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({
      compressPublicAssets: { gzip: true, brotli: true },
      // Identity responses also vary: shared caches must negotiate each representation.
      routeRules: { '/assets/**': { headers: { vary: 'Accept-Encoding' } } },
      rollupConfig: { external: [/^@sentry\//] },
    }),
    fonts(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
