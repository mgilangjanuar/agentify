import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = async () => {
  const data = await prisma.agent.findMany({
    where: {
      isPublic: true
    }
  })

  return NextResponse.json(data)
}
