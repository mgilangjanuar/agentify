import { NextResponse } from 'next/server'

export const GET = async (req: Request) => {
  const params = new URL(req.url).searchParams
  return NextResponse.json({
    url: `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
      state: params.get('state') || '',
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    })}`
  })
}
