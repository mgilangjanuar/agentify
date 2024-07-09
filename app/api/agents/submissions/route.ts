import { authorization } from '@/app/api/_middlewares/authorization'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = authorization(async (req) => {
  if (!req.user.isSuperAdmin) {
    return NextResponse.json({
      error: 'Forbidden'
    }, {
      status: 403
    })
  }

  const data = await prisma.agent.findMany({
    where: {
      isPublic: true
    },
    orderBy: {
      name: 'asc'
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  return NextResponse.json(data)
})
