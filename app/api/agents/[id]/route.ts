import { authorization } from '@/app/api/_middlewares/authorization'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = authorization(async (req, { params }: { params: { id: string } }) => {
  const data = await prisma.agent.findUnique({
    where: {
      id: params.id,
      userId: req.user.id
    }
  })

  if (!data) {
    return NextResponse.json({
      error: 'Agent not found'
    }, {
      status: 404
    })
  }

  return NextResponse.json(data)
})

export const PATCH = authorization(async (req, { params }: { params: { id: string } }) => {
  const body = await req.json() as {
    name?: string,
    description?: string,
    system?: string,
    isPublic?: boolean,
    isUsingBrowsing?: boolean,
  }

  const data = await prisma.agent.update({
    where: {
      id: params.id,
      userId: req.user.id
    },
    data: body
  })

  return NextResponse.json(data)
})

export const DELETE = authorization(async (req, { params }: { params: { id: string } }) => {
  const data = await prisma.agent.delete({
    where: {
      id: params.id,
      userId: req.user.id
    }
  })
  if (!data) {
    return NextResponse.json({
      error: 'Agent not found'
    }, {
      status: 404
    })
  }

  return NextResponse.json(data)
})
