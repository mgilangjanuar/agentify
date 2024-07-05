import { authorization, ReqWithUser } from '@/app/api/_middlewares/authorization'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = authorization(async (req: ReqWithUser, { params }: { params: { id: string } }) => {
  const data = await prisma.history.findUnique({
    where: {
      id: params.id,
      userId: req.user.id,
    },
  })

  if (!data) {
    return NextResponse.json({
      error: 'Not found',
    }, {
      status: 404,
    })
  }

  return NextResponse.json(data)
})

export const PATCH = authorization(async (req: ReqWithUser, { params }: { params: { id: string } }) => {
  const body = await req.json() as {
    title?: string,
    messages?: any[]
  }
  await prisma.history.update({
    where: {
      id: params.id,
      userId: req.user.id,
    },
    data: {
      title: body.title,
      messages: body.messages || []
    },
  })

  return NextResponse.json({})
})

export const DELETE = authorization(async (req: ReqWithUser, { params }: { params: { id: string } }) => {
  await prisma.history.delete({
    where: {
      id: params.id,
      userId: req.user.id,
    },
  })

  return NextResponse.json({})
})
