import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import { generateJsonLd } from './src/utils/generateJsonLd'
import react from '@vitejs/plugin-react'

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
  plugins: [react(), injectJsonLd(), sentryVitePlugin({ org: 'bronson-avila', project: 'hawaii-attorney-database' })]
})
