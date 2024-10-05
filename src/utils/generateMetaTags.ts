import { SITE_METADATA } from '../constants/siteMetadata'

export const generateMetaTags = () =>
  `
    <link rel="canonical" href="${SITE_METADATA.url}" />
    <meta name="author" content="${SITE_METADATA.author.name}" />
    <meta name="description" content="${SITE_METADATA.description}" />
    <meta name="keywords" content="${SITE_METADATA.keywords}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:description" content="${SITE_METADATA.description}" />
    <meta name="twitter:image" content="${SITE_METADATA.twitterImage}" />
    <meta name="twitter:title" content="${SITE_METADATA.title}" />
    <meta property="og:description" content="${SITE_METADATA.description}" />
    <meta property="og:image" content="${SITE_METADATA.ogImage}" />
    <meta property="og:title" content="${SITE_METADATA.title}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${SITE_METADATA.url}" />
    <title>${SITE_METADATA.title}</title>
  `
