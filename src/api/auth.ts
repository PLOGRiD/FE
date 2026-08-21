import client from './client'

export interface SignUpRequest {
  username: string
  password: string
  passwordConfirm: string
  email: string
}

export interface SignInRequest {
  username: string
  password: string
}

export async function signUp(data: SignUpRequest): Promise<void> {
  await client.post('/members/auth/sign-up', data)
}

export async function signIn(data: SignInRequest): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await client.post('/members/auth/sign-in', data)
  return res.data.result
}

export async function signOut(): Promise<void> {
  await client.post('/members/auth/sign-out')
}
