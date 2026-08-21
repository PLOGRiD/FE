import client from './client'

export interface ChatMessage {
  chatLogId: number
  chatRole: 'USER' | 'BOT'
  message: string
  imageUrl?: string
  messageType: string
  createdAt: string
}

export interface ChatSession {
  chatSessionId: number
  sessionTitle: string
  lastMessageAt: string
}

export interface ChatResponse {
  chatSessionId: number
  chatLogId: number
  message: string
  messageType: string
  createdAt: string
}

export async function sendChat(message: string, chatSessionId?: number, image?: File): Promise<ChatResponse> {
  const formData = new FormData()
  if (chatSessionId !== undefined) formData.append('chatSessionId', String(chatSessionId))
  formData.append('message', message)
  if (image) formData.append('image', image)

  const res = await client.post('/chats', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.result
}

export async function getSessions(): Promise<ChatSession[]> {
  const res = await client.get('/chats')
  return res.data.result
}

export async function getSessionMessages(chatSessionId: number): Promise<ChatMessage[]> {
  const res = await client.get(`/chats/${chatSessionId}/messages`)
  return res.data.result
}

export async function deleteSessions(chatSessionIds: number[]): Promise<void> {
  await client.delete('/chats', { data: { chatSessionIds } })
}
