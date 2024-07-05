import { prisma } from '@/lib/db'

export type ReqWithUser = Request & {
  user: {
    id: string,
    email: string,
    name?: string | null,
    profile: {
      iss: string
      azp: string
      aud: string
      sub: string
      email: string
      email_verified: string
      at_hash: string
      name: string
      picture: string
      given_name: string
      family_name: string
      iat: string
      exp: string
      alg: string
      kid: string
      typ: string
    }
  }
}

export const authorization = (handler: (req: ReqWithUser) => void | Promise<void> | Response | Promise<Response>) => {
  return async (req: ReqWithUser) => {
    const cookies = req.headers.get('cookie')?.split(';').map(cookie => cookie.trim().split('='))
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || cookies?.find(cookie => cookie[0] === 'access_token')?.[1]
    console.log(token)
    if (!token)  {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    try {
      const profile = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
      if (!profile.ok) {
        return new Response(JSON.stringify({
          error: 'Unauthorized'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }

      const json = await profile.json() as ReqWithUser['user']['profile']
      const user = await prisma.user.findUnique({
        select: {
          id: true,
          email: true,
          name: true,
        },
        where: {
          email: json.email
        }
      })
      if (!user) {
        return new Response(JSON.stringify({
          error: 'Unauthorized'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }

      req.user = {
        ...user,
        profile: json
      }
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    return await handler(req)
  }
}
