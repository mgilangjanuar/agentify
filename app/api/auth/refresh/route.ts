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
    return new Response(JSON.stringify(data), {
      status: 400,
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
