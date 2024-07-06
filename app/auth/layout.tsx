'use client'

import { useUser } from '@/components/use-user'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = useUser()
  const r = useRouter()

  useEffect(() => {
    if (user) {
      r.replace('/app')
    }
  }, [user, r])

  return user === null ? <Suspense>
    <div className="container mx-auto py-6 min-h-svh flex items-center relative">
      {children}
    </div>
  </Suspense> : <></>
}
