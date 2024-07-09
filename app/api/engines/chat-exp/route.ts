import { authorization, ReqWithUser } from '@/app/api/_middlewares/authorization'
import { Claude, ClaudeCompletionPayload, getAnthropicKey } from '@/lib/claude'
import { NextResponse } from 'next/server'

export const POST = authorization(async (req: ReqWithUser) => {
  const body = await req.json() as {
    messages: ClaudeCompletionPayload['messages'],
  }

  if (!body.messages?.length) {
    return NextResponse.json({
      error: 'Messages are required'
    }, {
      status: 400
    })
  }

  let apiKey = undefined
  try {
    apiKey = await getAnthropicKey(req.user.id, 1)
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, {
      status: 400
    })
  }

  const resp = await new Claude(apiKey ? { apiKey } : undefined).completion({
    model: 'claude-3-5-sonnet-20240620',
    messages: body.messages,
  }).stream()

  return new Response(resp, {
    headers: {
      'Content-Type': 'text/plain'
    }
  })
})
