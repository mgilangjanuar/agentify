import { authorization, ReqWithUser } from '@/app/api/_middlewares/authorization'

export const GET = authorization(async (req: ReqWithUser) => {
  return new Response(JSON.stringify({ user: req.user }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
    },
  })
})
