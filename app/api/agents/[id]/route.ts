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
    configs?: any,
    tools?: any,
    isPublic?: boolean,
    isUsingBrowsing?: boolean,
    logoUrl?: string,
    raw?: any
  }

  await prisma.agent.update({
    where: {
      id: params.id,
      userId: req.user.id
    },
    data: {
      name: body.name,
      description: body.description,
      system: body.system,
      configs: body.configs,
      tools: body.tools,
      isPublic: body.isPublic,
      isUsingBrowsing: body.isUsingBrowsing,
      logoUrl: body.logoUrl,
      raw: body.raw
    }
  })

  return NextResponse.json({})
})

export const DELETE = authorization(async (req, { params }: { params: { id: string } }) => {
  await prisma.agent.delete({
    where: {
      id: params.id,
      userId: req.user.id
    }
  })

  return NextResponse.json({})
})
