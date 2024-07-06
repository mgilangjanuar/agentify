import { authorization, ReqWithUser } from '@/app/api/_middlewares/authorization'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = authorization(async (req: ReqWithUser) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id
    }
  })
  if (!user) {
    return NextResponse.json({
      error: 'User not found'
    }, {
      status: 404
    })
  }

  return NextResponse.json({
    user: {
      ...user,
      configs: Object.keys(user.configs || {}).reduce((acc, key) => {
        acc[key] = (user.configs as Record<string, undefined>)?.[key]
          ? '******************' : null
        return acc
      }, {} as Record<string, string | null>)
    }
  })
})
