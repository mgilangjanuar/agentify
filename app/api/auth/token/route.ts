import { prisma } from '@/lib/db'

export const POST = async (req: Request) => {
  const { code } = await req.json() as {
    code: string
  }

  if (!code) {
    return new Response(JSON.stringify({
      error: 'Code is required'
    }), {
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
    return new Response(JSON.stringify(data), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  try {
    const profile = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${data.id_token}`)
    if (!profile.ok) {
      return new Response(JSON.stringify({
        error: 'Invalid token'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    const json = await profile.json() as any
    console.log(json)
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
    return new Response(JSON.stringify({
      error: 'Invalid token'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
