import { defineConfig } from 'vite'
import { generateJsonLd } from './src/utils/metadata/generateJsonLd'
import { generateMetaTags } from './src/utils/metadata/generateMetaTags'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'

const injectJsonLd = () => ({
  name: 'inject-json-ld',
  transformIndexHtml: (html: string) => html.replace('</head>', `${generateJsonLd()}\n</head>`)
})

const injectMetaTags = () => ({
  name: 'inject-meta-tags',
  transformIndexHtml: (html: string) => html.replace('</head>', `${generateMetaTags()}\n</head>`)
})

// https://vitejs.dev/config/
export default defineConfig({
  build: { sourcemap: true },
  plugins: [
    react(),
    injectMetaTags(),
    injectJsonLd(),
    sentryVitePlugin({ org: 'bronson-avila', project: 'hawaii-attorney-database' })
  ]
})
