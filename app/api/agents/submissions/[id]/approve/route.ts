import { authorization } from '@/app/api/_middlewares/authorization'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const PATCH = authorization(async (req, { params }: { params: { id: string } }) => {
  if (!req.user.isSuperAdmin) {
    return NextResponse.json({
      error: 'Forbidden'
    }, {
      status: 403
    })
  }

  await prisma.agent.update({
    where: {
      id: params.id
    },
    data: {
      verifiedAt: new Date()
    }
  })

  return NextResponse.json({})
})
