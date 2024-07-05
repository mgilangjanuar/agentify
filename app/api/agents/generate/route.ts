import { authorization } from '@/app/api/_middlewares/authorization'
import { NextResponse } from 'next/server'

export const POST = authorization(async (req) => {
  const body = await req.json() as {
    useCase: string,
  }

  if (!body.useCase) {
    return NextResponse.json({
      error: 'Missing useCase'
    }, {
      status: 400
    })
  }
  // TODO: Implement agent generation logic

  return NextResponse.json({})
})
