import { authorization } from '@/app/api/_middlewares/authorization'
import { NextResponse } from 'next/server'

export const DELETE = authorization(async (req) => {
  const result = NextResponse.json({})
  result.cookies.set({
    name: 'access_token',
    value: '',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  })

  return result
})
