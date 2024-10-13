import { getStore } from '@netlify/blobs'

export default async () => {
  const store = getStore('hawaii-attorney-database')

  try {
    const blob = await store.getWithMetadata('processed-member-records')

    const { data, metadata } = blob ?? {}

    return Response.json({ data, metadata })
  } catch (error) {
    console.error('Error fetching blob:', error)

    return Response.json({ error: 'Failed to fetch blob content' }, { status: 500 })
  }
}
