import { getStore } from '@netlify/blobs'

export default async () => {
  const store = getStore('hawaii-attorney-database')

  try {
    const metadata = await store.getMetadata('processed-member-records')

    if (metadata) {
      return Response.json({ metadata })
    }

    return Response.json({ error: 'Metadata not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching blob metadata:', error)
    return Response.json({ error: 'Failed to fetch blob metadata' }, { status: 500 })
  }
}
