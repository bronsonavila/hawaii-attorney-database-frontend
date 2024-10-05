import { defineConfig } from 'vite'
import { generateJsonLd } from './src/utils/generateJsonLd'
import { generateMetaTags } from './src/utils/generateMetaTags'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'

const injectMetadata = () => ({
  name: 'inject-metadata',
  transformIndexHtml(html: string) {
    const metaTags = generateMetaTags()

    return html.replace('</head>', `${metaTags}\n</head>`)
  }
})

const injectJsonLd = () => ({
  name: 'inject-json-ld',
  transformIndexHtml(html: string) {
    const jsonLdScript = generateJsonLd()

    return html.replace('</head>', `${jsonLdScript}\n</head>`)
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  build: { sourcemap: true },
  plugins: [
    react(),
    injectMetadata(),
    injectJsonLd(),
    sentryVitePlugin({ org: 'bronson-avila', project: 'hawaii-attorney-database' })
  ]
})
