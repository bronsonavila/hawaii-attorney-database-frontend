import { SITE_METADATA } from '../constants/siteMetadata'

export const generateJsonLd = () => {
  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'WebSite',
    alternativeHeadline: SITE_METADATA.alternativeHeadline,
    audience: { '@type': 'Audience', audienceType: SITE_METADATA.audience },
    author: { '@type': 'Person', name: SITE_METADATA.author.name, url: SITE_METADATA.author.url },
    citation: { '@type': 'CreativeWork', name: SITE_METADATA.citation.name, url: SITE_METADATA.citation.url },
    creativeWorkStatus: 'Published',
    dateModified: new Date().toISOString(),
    description: SITE_METADATA.description,
    educationalUse: 'Research, Market Analysis, Compliance',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    keywords: SITE_METADATA.keywords,
    maintainer: { '@type': 'Person', name: SITE_METADATA.author.name, url: SITE_METADATA.author.url },
    name: SITE_METADATA.title,
    url: SITE_METADATA.url
  }

  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
}
