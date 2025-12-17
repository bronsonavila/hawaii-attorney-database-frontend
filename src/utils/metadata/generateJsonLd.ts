import { METADATA } from '../../constants/siteMetadata'

export const generateJsonLd = () => {
  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'WebSite',
    alternativeHeadline: METADATA.alternativeHeadline,
    audience: { '@type': 'Audience', audienceType: METADATA.audience },
    author: { '@type': 'Person', name: METADATA.author.name, url: METADATA.author.url },
    citation: { '@type': 'CreativeWork', name: METADATA.citation.name, url: METADATA.citation.url },
    creativeWorkStatus: 'Published',
    dateModified: new Date().toISOString(),
    description: METADATA.description,
    educationalUse: 'Research, Market Analysis, Compliance',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    keywords: METADATA.keywords,
    maintainer: { '@type': 'Person', name: METADATA.author.name, url: METADATA.author.url },
    name: METADATA.title,
    url: METADATA.url
  }

  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
}
