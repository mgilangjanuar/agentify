import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  const { token } = await req.json() as { token: string }

  if (!token) {
    return new Response(JSON.stringify({
      error: 'Refresh token is required'
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
      refresh_token: token,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token'
    }).toString()
  })

  const data = await resp.json()

  if (!resp.ok) {
    return NextResponse.json(data, {
      status: 400,
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
