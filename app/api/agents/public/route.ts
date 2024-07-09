import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = async () => {
  const data = await prisma.agent.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      logoUrl: true,
    },
    where: {
      isPublic: true,
      verifiedAt: {
        not: null
      },
    },
    orderBy: {
      name: 'asc'
    }
  })

  return NextResponse.json(data)
}
