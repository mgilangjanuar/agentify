import { authorization } from '@/app/api/_middlewares/authorization'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = authorization(async (req) => {
  const params = new URL(req.url).searchParams
  const data = await prisma.agent.findMany({
    where: {
      isPublic: true,
      verifiedAt: {
        not: null
      },
      ...params.get('installed') === 'true' ? {
        installedAgents: {
          some: {
            userId: req.user.id
          }
        }
      } : {}
    },
    include: {
      installedAgents: {
        select: {
          id: true
        },
        where: {
          userId: req.user.id
        }
      },
      user: {
        select: {
          name: true
        }
      }
    }
  })

  return NextResponse.json(data)
})
