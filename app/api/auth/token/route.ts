import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  const { code } = await req.json() as {
    code: string
  }

  if (!code) {
    return NextResponse.json({
      error: 'Code is required'
    }, {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code'
    }).toString()
  })

  const data = await resp.json() as any

  if (!resp.ok) {
    return NextResponse.json(data, {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  try {
    const profile = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${data.id_token}`)
    if (!profile.ok) {
      return NextResponse.json({
        error: 'Invalid token'
      }, {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    const json = await profile.json() as any
    if (!await prisma.user.findFirst({
      where: {
        email: json.email
      }
    })) {
      await prisma.user.create({
        data: {
          email: json.email,
          name: json.name,
          credits: 0,
        }
      })
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Invalid token'
    }, {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  const result = NextResponse.json(data)
  result.cookies.set({
    name: 'access_token',
    value: data.id_token,
    maxAge: 20 * 24 * 60 * 60,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  })

  return result
}
