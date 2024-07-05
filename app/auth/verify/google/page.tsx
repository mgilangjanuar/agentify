'use client'

import { hit } from '@/lib/hit'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function VerifyGoogle() {
  const r = useRouter()
  const q = useSearchParams()

  useEffect(() => {
    hit('/api/auth/token', {
      method: 'POST',
      body: JSON.stringify({
        code: q.get('code')
      })
    }).then(res => res.json()).then(console.log)
  }, [q])
  return <></>
}
