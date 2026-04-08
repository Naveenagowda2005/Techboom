import { jwtVerify } from 'jose'

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export async function verifyAccessTokenEdge(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, ACCESS_SECRET)
  return payload as unknown as JWTPayload
}

export async function verifyRefreshTokenEdge(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, REFRESH_SECRET)
  return payload as unknown as JWTPayload
}
