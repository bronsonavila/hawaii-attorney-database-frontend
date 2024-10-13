import { getStore } from '@netlify/blobs'

export default async () => {
  const store = getStore('hawaii-attorney-database')

  try {
    const blob = await store.getWithMetadata('processed-member-records')

    if (blob) {
      const { data, etag, metadata } = blob

      return new Response(JSON.stringify({ data, metadata }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
          ETag: etag || ''
        }
      })
    }

    return Response.json({ error: 'Blob not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching blob:', error)

    return Response.json({ error: 'Failed to fetch blob content' }, { status: 500 })
  }
}
