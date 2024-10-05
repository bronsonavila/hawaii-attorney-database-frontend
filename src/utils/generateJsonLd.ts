export const generateJsonLd = () => {
  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'WebSite',
    alternativeHeadline:
      'Comprehensive Directory of Licensed Attorneys in Hawaii: Insights for Legal Professionals, Researchers, Businesses, Government, and the General Public',
    audience: {
      '@type': 'Audience',
      audienceType: 'Legal Professionals, Researchers, Businesses, Government, General Public'
    },
    author: { '@type': 'Person', name: 'Bronson Avila', url: 'https://www.bronsonavila.com/' },
    citation: { '@type': 'CreativeWork', name: 'Hawaii State Bar Association', url: 'https://hsba.org/' },
    creativeWorkStatus: 'Published',
    dateModified: new Date().toISOString(),
    description:
      'A comprehensive, searchable database of attorneys licensed to practice in Hawaii. Useful for research and analysis by legal professionals, businesses, journalists, government agencies, and the general public seeking information on attorneys in Hawaii.',
    educationalUse: 'Research, Market Analysis, Compliance',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    keywords:
      'Hawaii attorneys, legal database, lawyer directory, legal research, Hawaii bar, public directory, attorney information',
    maintainer: { '@type': 'Person', name: 'Bronson Avila', url: 'https://www.bronsonavila.com/' },
    name: 'Hawaii Attorney Database',
    url: 'https://www.hawaiiattorneydatabase.com/'
  }

  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
}
