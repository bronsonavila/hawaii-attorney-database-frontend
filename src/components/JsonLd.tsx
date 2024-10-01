import { FC } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'

export const JsonLd: FC = () => {
  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    author: { '@type': 'Person', name: 'Bronson Avila' },
    dateModified: new Date().toISOString(),
    description: 'A searchable and filterable database of attorneys licensed in Hawaii.',
    name: 'Hawaii Attorney Database',
    url: window.location.href
  }

  return (
    <HelmetProvider>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
    </HelmetProvider>
  )
}
