import { getStore } from '@netlify/blobs'

export default async () => {
  const store = getStore('hawaii-attorney-database')

  try {
    const blob = await store.get('processed-member-records')

    if (blob) {
      const content = blob.toString()

      return new Response(content, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=processed-member-records.csv'
        },
        status: 200
      })
    }

    return Response.json({ error: 'Blob not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching blob data:', error)

    return Response.json({ error: 'Failed to fetch blob content' }, { status: 500 })
  }
}
