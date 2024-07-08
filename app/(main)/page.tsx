'use client'

import DotPattern from '@/components/magicui/dot-pattern'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function Home() {
  return <div>
    <div className="relative flex h-[60svh] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background container mx-auto max-w-3xl text-center">
      <div className="space-y-4 z-20">
        <Badge>
          Introducing Agent Studio ✨
        </Badge>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
          Build &amp; Install LLM Agents with <span className="underline underline-offset-4">No Code</span>
        </h1>
      </div>
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
        )}
      />
    </div>
  </div>
}
