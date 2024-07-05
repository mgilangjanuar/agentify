'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hit } from '@/lib/hit'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Auth() {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    hit('/api/auth/url')
      .then((res) => res.json())
      .then((data) => setUrl(data.url))
  }, [])

  return <div className="w-full space-y-8">
    <Link className="flex w-fit mx-auto gap-3 items-center justify-center" href="/">
      <Image src="/logo.png" alt="logo" width={416} height={416} className="size-6 md:size-8" />
      <h1 className="text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]">
        Agentify
      </h1>
    </Link>
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          Login
        </CardTitle>
        <CardDescription>
          Please login to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="border-t pt-6 w-full text-center">
        <Button asChild>
          <a href={url || ''} className="flex items-center gap-2.5" rel="noreferrer noopener">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z" stroke-width="0" fill="currentColor" />
            </svg>
            Sign in with Google
          </a>
        </Button>
      </CardContent>
    </Card>
  </div>
}
