import { authorization, ReqWithUser } from '@/app/api/_middlewares/authorization'
import { NextResponse } from 'next/server'

export const GET = authorization(async (req: ReqWithUser) => {
  return NextResponse.json(req.user)
})
