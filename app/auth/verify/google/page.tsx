'use client'

import { useUser } from '@/components/use-user'
import { hit } from '@/lib/hit'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function VerifyGoogle() {
  const { fetchUser } = useUser()
  const q = useSearchParams()

  useEffect(() => {
    if (q.get('code')) {
      hit('/api/auth/token', {
        method: 'POST',
        body: JSON.stringify({
          code: q.get('code')
        })
      }).then(res => res.json()).then(data => {
        if (window && data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token)
        }
        fetchUser()
      })
    }
  }, [q, fetchUser])
  return <div className="w-full space-y-8 text-center">Please wait...</div>
}
