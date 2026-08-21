import client from './client'

export interface MyProfile {
  memberId: number
  nickName: string
  email: string
}

export interface MyContribution {
  ploggingCount: number
  totalDistanceMeters: number
  totalDurationSeconds: number
  totalTrashCount: number
  contributionScore: number
  trashCategory: {
    vinylCount: number
    glassCount: number
    paperCount: number
    canCount: number
    petCount: number
    plasticCount: number
    cigaretteButtCount: number
    etcCount: number
  }
}

export interface RankItem {
  rank: number
  memberId: number
  nickName: string
  contributionScore: number
}

export interface RankingResult {
  topRankings: RankItem[]
  myRanking: RankItem
}

export async function getMyProfile(): Promise<MyProfile> {
  const res = await client.get('/members/me')
  return res.data.result
}

export async function getMyContribution(): Promise<MyContribution> {
  const res = await client.get('/members/me/contribution')
  return res.data.result
}

export async function getRanking(): Promise<RankingResult> {
  const res = await client.get('/members/ranking')
  return res.data.result
}

export async function withdraw(): Promise<void> {
  await client.delete('/members/me')
}
