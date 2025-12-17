import { METADATA } from '../../constants/siteMetadata'

export const generateMetaTags = () =>
  `
    <link rel="canonical" href="${METADATA.url}" />
    <meta name="author" content="${METADATA.author.name}" />
    <meta name="description" content="${METADATA.description}" />
    <meta name="keywords" content="${METADATA.keywords}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:description" content="${METADATA.description}" />
    <meta name="twitter:image" content="${METADATA.twitterImage}" />
    <meta name="twitter:title" content="${METADATA.title}" />
    <meta property="og:description" content="${METADATA.description}" />
    <meta property="og:image" content="${METADATA.ogImage}" />
    <meta property="og:title" content="${METADATA.title}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${METADATA.url}" />
    <title>${METADATA.title}</title>
  `
