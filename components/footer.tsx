import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { LucideGithub, LucideGlobe } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return <div className="mt-[20svh] bg-muted">
    <Separator />
    <footer className="container mx-auto py-12 max-w-screen-lg">
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <div className="space-y-4">
            <div>
              <Image src="/logo.png" alt="Agentify" width={728} height={728} className="w-16 h-16" />
            </div>
            <p className="leading-7 text-muted-foreground">
              Create and install AI agents to automate your tasks.
            </p>
            <div className="flex flex-col gap-4 text-muted-foreground">
              <div className="flex gap-1.5 items-center">
                <LucideGithub className="size-4" />
                <a href="https://github.com/mgilangjanuar" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  @mgilangjanuar
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <Label>
              COMPANY
            </Label>
            <div>
              <p className="leading-7 text-muted-foreground font-medium">
                Appledore Dev
              </p>
              <p className="leading-7 text-muted-foreground">
                Jakarta, Indonesia
              </p>
            </div>
            <div className="flex flex-col gap-2.5 text-muted-foreground">
              <div className="flex gap-1.5 items-center">
                <LucideGlobe className="size-4" />
                <a href="https://appledore.dev" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  appledore.dev
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <Label>
              NAVIGATION
            </Label>
            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <div className="flex flex-col gap-4">
                <Link href="/" className="underline underline-offset-4">
                  Home
                </Link>
                <Link href="/app" className="underline underline-offset-4">
                  Dashboard
                </Link>
                <Link href="/pricing" className="underline underline-offset-4">
                  Pricing
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/terms" className="underline underline-offset-4">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="underline underline-offset-4">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="leading-7 text-muted-foreground text-center mt-16">
        © 2024 Agentify. All rights reserved.
      </p>
      {/* <p className="leading-7 text-muted-foreground text-center flex w-full justify-center mt-4">
        <a href="https://vercel.com?utm_source=appledore-dev&utm_campaign=oss" target="_blank" rel="noopener noreferrer" className="flex justify-center">
          <Image src="https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg" alt="Powered by Vercel" width={212} height={44} className="h-auto w-[75%]" />
        </a>
      </p> */}
    </footer>
  </div>
}
