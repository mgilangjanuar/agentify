import { authorization } from '@/app/api/_middlewares/authorization'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = authorization(async (req) => {
  const data = await prisma.agent.findMany({
    where: {
      userId: req.user.id
    }
  })

  return NextResponse.json(data)
})


export const POST = authorization(async (req) => {
  const body = await req.json() as {
    name: string,
    description: string,
    system?: string,
    isPublic?: boolean,
    isUsingBrowsing?: boolean,
  }

  const data = await prisma.agent.create({
    data: {
      ...body,
      userId: req.user.id
    }
  })

  return NextResponse.json(data)
})
