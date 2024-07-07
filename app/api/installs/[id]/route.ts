import { authorization } from '@/app/api/_middlewares/authorization'
import { cryptr } from '@/lib/crypto'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = authorization(async (req, { params }: { params: { id: string } }) => {
  const data = await prisma.installedAgent.findUnique({
    where: {
      id: params.id,
      userId: req.user.id
    },
    include: {
      agent: true
    }
  })

  if (!data) {
    return NextResponse.json({
      error: 'Installed agent not found'
    }, {
      status: 404
    })
  }

  return NextResponse.json({
    ...data,
    configs: Object.keys(data.configs || {}).reduce((acc, key) => {
      acc[key] = '******************'
      return acc
    }, {} as Record<string, string>)
  })
})

export const PATCH = authorization(async (req, { params }: { params: { id: string } }) => {
  const body = await req.json() as {
    configs?: Record<string, string>
  }

  await prisma.installedAgent.update({
    where: {
      id: params.id,
      userId: req.user.id
    },
    data: {
      configs: Object.keys(body.configs || {}).reduce((acc, key) => {
        acc[key] = cryptr.encrypt(body.configs![key])
        return acc
      }, {} as Record<string, string>)
    }
  })

  return NextResponse.json({})
})

export const DELETE = authorization(async (req, { params }: { params: { id: string } }) => {
  await prisma.installedAgent.delete({
    where: {
      id: params.id,
      userId: req.user.id
    }
  })

  return NextResponse.json({})
})
