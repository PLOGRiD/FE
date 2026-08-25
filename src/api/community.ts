import client from './client'

export interface InfoPost {
  postId: number
  postTitle: string
  authorNickname: string
  authorProfileImageUrl?: string
  postContent: string
  createdAt: string
  imageUrls: string[]
  likeCount: number
  liked: boolean
}

export interface InfoListResult {
  listSize: number
  totalPage: number
  totalElements: number
  isFirst: boolean
  isLast: boolean
  infos: InfoPost[]
}

export interface Recruitment {
  recruitmentId: number
  title: string
  hostName: string
  thumbnailImageUrl?: string
  eventDateTime: string
  eventLocation: string
  currentParticipants: number
  maxParticipants: number
  eventStatus: string
}

export interface RecruitmentDetail {
  title: string
  hostName: string
  thumbnailImageUrl?: string
  description: string
  eventDateTime: string
  eventLocation: string
  currentParticipants: number
  maxParticipants: number
  eventStatus: string
  isParticipating: boolean
}

export async function getInfoList(page = 1, size = 10): Promise<InfoListResult> {
  const res = await client.get('/posts', { params: { page, size } })
  return res.data.result
}

export async function toggleLike(postId: number): Promise<{ isLiked: boolean; likeCount: number }> {
  const res = await client.post(`/posts/${postId}/like`)
  return res.data.result
}

export async function getRecruitmentList(page = 1, size = 10): Promise<Recruitment[]> {
  const res = await client.get('/recruitments', { params: { page, size } })
  return res.data.result.recruitments
}

export async function getRecruitmentDetail(recruitmentId: number): Promise<RecruitmentDetail> {
  const res = await client.get(`/recruitments/${recruitmentId}`)
  return res.data.result
}

export async function toggleParticipation(recruitmentId: number): Promise<{ isParticipating: boolean; currentParticipants: number; maxParticipants: number }> {
  const res = await client.post(`/recruitments/${recruitmentId}/participation`)
  return res.data.result
}
