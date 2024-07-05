import { authorization } from '@/app/api/_middlewares/authorization'
import { cryptr } from '@/lib/crypto'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const PATCH = authorization(async (req) => {
  const body = await req.json() as {
    'ANTHROPIC_API_KEY': string
  }

  if (body.ANTHROPIC_API_KEY) {
    await prisma.user.update({
      where: {
        id: req.user.id
      },
      data: {
        configs: {
          'ANTHROPIC_API_KEY': cryptr.encrypt(body.ANTHROPIC_API_KEY)
        }
      }
    })
  }

  return NextResponse.json({})
})
