import client from './client'

export interface TrashMarker {
  id: number
  latitude: number
  longitude: number
  category: string
}

export interface TrashDetail extends TrashMarker {
  collectedAt: string
  imageUrl?: string
}

export async function getTrashesInViewport(
  minLat: number, maxLat: number, minLng: number, maxLng: number
): Promise<TrashMarker[]> {
  const res = await client.get('/trashes', { params: { minLat, maxLat, minLng, maxLng } })
  return res.data.result
}

export async function getTrashDetail(trashId: number): Promise<TrashDetail> {
  const res = await client.get(`/trashes/${trashId}`)
  return res.data.result
}
