'use client'

import { useState } from 'react'

export default function Store() {
  const [tab, setTab] = useState<'all' | 'installed'>('all')

  return <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:px-6">
    <div className="flex justify-between gap-2 flex-wrap items-center">
      <h1 className="text-xl font-semibold md:text-2xl">
        Agent Store
      </h1>
    </div>
  </main>
}
