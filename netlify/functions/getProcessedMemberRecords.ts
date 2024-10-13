import { getStore } from '@netlify/blobs'

export default async (request: Request) => {
  const store = getStore('hawaii-attorney-database')

  try {
    const blob = await store.getWithMetadata('processed-member-records')

    if (blob) {
      const { data, etag, metadata } = blob

      const ifNoneMatch = request.headers.get('If-None-Match')

      if (ifNoneMatch === etag) return new Response(null, { status: 304 })

      return new Response(JSON.stringify({ data, metadata }), {
        headers: { 'Cache-Control': 'public, max-age=2592000', 'Content-Type': 'application/json', ETag: etag || '' }
      })
    }

    return Response.json({ error: 'Blob not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching blob:', error)

    return Response.json({ error: 'Failed to fetch blob content' }, { status: 500 })
  }
}
