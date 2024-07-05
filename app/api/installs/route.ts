import { authorization } from '@/app/api/_middlewares/authorization'
import { cryptr } from '@/lib/crypto'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = authorization(async (req) => {
  const data = await prisma.installedAgent.findMany({
    where: {
      userId: req.user.id
    }
  })

  return NextResponse.json(data.map(datum => ({
    ...datum,
    configs: Object.keys(datum.configs || {}).reduce((acc, key) => {
      acc[key] = '******************'
      return acc
    }, {} as Record<string, string>)
  })))
})

export const POST = authorization(async (req) => {
  const body = await req.json() as {
    agentId: string,
    configs?: Record<string, string>
  }

  await prisma.installedAgent.create({
    data: {
      agentId: body.agentId,
      userId: req.user.id,
      configs: Object.keys(body.configs || {}).reduce((acc, key) => {
        acc[key] = cryptr.encrypt(body.configs![key])
        return acc
      }, {} as Record<string, string>)
    }
  })

  return NextResponse.json({})
})
