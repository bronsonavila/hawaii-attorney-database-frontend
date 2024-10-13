import { getStore } from '@netlify/blobs'

export default async () => {
  const store = getStore('hawaii-attorney-database')

  try {
    const blob = await store.get('member-identifiers')
    const content = blob.toString()

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=member-identifiers.csv'
      }
    })
  } catch (error) {
    console.error('Error fetching blob:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch blob content' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
