'use client'

import DotPattern from '@/components/magicui/dot-pattern'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { LucideArrowRight, LucideGithub, LucideVideo } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [tab, setTab] = useState<'setup' | 'github'>('setup')

  return <div className="py-6">
    <div className="relative flex h-[65svh] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background container mx-auto max-w-3xl text-center">
      <div className="space-y-3 z-20">
        <Badge>
          Introducing Agent Studio ✨
        </Badge>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
          Build &amp; Install LLM Agents with <span className="underline underline-offset-8">No Code</span>
        </h1>
        <p className="leading-7 !mt-6 text-muted-foreground lg:text-xl">
          Create, publish, and install AI agents. Powered by <strong>Claude 3.5 Sonnet</strong> model.
        </p>
        <div className="!mt-8 flex gap-1 items-center justify-center">
          <Button asChild size="lg" variant="outline">
            <a href="https://github.com/mgilangjanuar/agentify" target="_blank" rel="noopener noreferrer">
              <LucideGithub className="w-5 h-5" />
            </a>
          </Button>
          <Button asChild size="lg">
            <Link href="/auth">
              Get Started
              <LucideArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
        <Dialog>
          <DialogTrigger className="!mt-5 underline underline-offset-4 lg:text-lg flex gap-2 items-center justify-center w-full">
            Watch Demo
            <LucideVideo className="w-5 h-5" />
          </DialogTrigger>
          <DialogContent className="max-w-screen-lg">
            <DialogHeader>
              <DialogTitle>
                Demo
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2 flex-nowrap">
                <Badge variant={tab === 'setup' ? 'default' : 'outline'} onClick={() => setTab('setup')} className="hover:cursor-pointer">Setup</Badge>
                <Badge variant={tab === 'github' ? 'default' : 'outline'} onClick={() => setTab('github')} className="hover:cursor-pointer">Advance Case</Badge>
              </div>
              {tab === 'setup' ? <iframe className="w-full !h-auto !aspect-video" width="560" height="315" src="https://www.youtube-nocookie.com/embed/a3-HmMfRPBE?si=hn8CAYCFXCaYACQv&amp;controls=1" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe> : <></>}
              {tab === 'github' ? <iframe className="w-full !h-auto !aspect-video" width="560" height="315" src="https://www.youtube-nocookie.com/embed/v9AZzp9M9H8?si=vJ7N8y62RT5TvyTl&amp;controls=1" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe> : <></>}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
        )}
      />
    </div>
    <div className="container mx-auto max-w-screen-xl px-16 pt-20">
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <Dialog>
              <DialogTrigger>
                <Image src="/img1.png?v=1.1" width={2858} height={2032} className="w-full rounded-lg" alt="screenshot" />
              </DialogTrigger>
              <DialogContent className="max-w-screen-lg">
                <div className="pt-6">
                  <Image src="/img1.png?v=1.1" width={2858} height={2032} className="w-full rounded-lg" alt="screenshot" />
                </div>
              </DialogContent>
            </Dialog>
          </CarouselItem>
          <CarouselItem>
            <Dialog>
              <DialogTrigger>
                <Image src="/img2.png?v=1.1" width={2858} height={2032} className="w-full rounded-lg" alt="screenshot" />
              </DialogTrigger>
              <DialogContent className="max-w-screen-lg">
                <div className="pt-6">
                  <Image src="/img2.png?v=1.1" width={2858} height={2032} className="w-full rounded-lg" alt="screenshot" />
                </div>
              </DialogContent>
            </Dialog>
          </CarouselItem>
          <CarouselItem>
            <Dialog>
              <DialogTrigger>
                <Image src="/img3.png?v=1.1" width={2858} height={2032} className="w-full rounded-lg" alt="screenshot" />
              </DialogTrigger>
              <DialogContent className="max-w-screen-lg">
                <div className="pt-6">
                  <Image src="/img3.png?v=1.1" width={2858} height={2032} className="w-full rounded-lg" alt="screenshot" />
                </div>
              </DialogContent>
            </Dialog>
          </CarouselItem>
          <CarouselItem>
            <Dialog>
              <DialogTrigger>
                <Image src="/img4.png?v=1.1" width={2858} height={2032} className="w-full rounded-lg" alt="screenshot" />
              </DialogTrigger>
              <DialogContent className="max-w-screen-lg">
                <div className="pt-6">
                  <Image src="/img4.png?v=1.1" width={2858} height={2032} className="w-full rounded-lg" alt="screenshot" />
                </div>
              </DialogContent>
            </Dialog>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  </div>
}
