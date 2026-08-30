import client from './client'

export interface PloggingResult {
  ploggingId: number
  distanceMeters: number
  durationSeconds: number
  contributionScore: number
  trashSummary: {
    totalCount: number
    vinylPercentage: number
    paperPercentage: number
    glassPercentage: number
    canPercentage: number
    petBottlePercentage: number
    plasticPercentage: number
    cigarettePercentage: number
    styrofoamPercentage: number
  }
  trashes: { trashId: number; category: string; imageUrl: string }[]
}

export interface RecentPlogging {
  ploggingId: number
  distanceMeters: number
  durationSeconds: number
  trashCount: number
  createdAt: string
}

export async function startPlogging(): Promise<number> {
  const res = await client.post('/ploggings')
  return res.data.result.ploggingId
}

export async function updateLocation(latitude: number, longitude: number): Promise<void> {
  await client.post('/ploggings/location', { latitude, longitude })
}

export async function endPlogging(): Promise<PloggingResult> {
  const res = await client.patch('/ploggings/active')
  return res.data.result
}

export async function getRecentPlogging(): Promise<RecentPlogging | null> {
  try {
    const res = await client.get('/ploggings/recent')
    return res.data.result
  } catch {
    return null
  }
}

export async function linkDevice(deviceId: number): Promise<void> {
  await client.post('/devices/link', { deviceId })
}

export const BASE_URL = 'https://plogrid.p-e.kr/api/v1'
