import { authorization, ReqWithUser } from '@/app/api/_middlewares/authorization'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = authorization(async (req: ReqWithUser) => {
  const data = await prisma.history.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json(data)
})

export const POST = authorization(async (req: ReqWithUser) => {
  const body = await req.json() as {
    title: string,
    installedAgentId?: string,
    messages?: any[]
  }
  const data = await prisma.history.create({
    data: {
      title: body.title,
      messages: body.messages || [],
      installedAgentId: body.installedAgentId,
      userId: req.user.id,
    },
  })

  return NextResponse.json(data, {
    status: 201,
  })
})
