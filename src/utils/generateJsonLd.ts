export const generateJsonLd = () => {
  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    author: { '@type': 'Person', name: 'Bronson Avila' },
    dateModified: new Date().toISOString(),
    description: 'A searchable and filterable database of attorneys licensed in Hawaii.',
    name: 'Hawaii Attorney Database',
    url: 'https://www.hawaiiattorneydatabase.com/'
  }

  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
}
