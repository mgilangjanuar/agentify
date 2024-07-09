'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useUser } from '@/components/use-user'
import { hit } from '@/lib/hit'
import { cn } from '@/lib/utils'
import { CircleUser, LucideBot, LucideGithub, LucideMoonStar, LucideShoppingBag, LucideSun, LucideTriangleAlert, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, fetchUser } = useUser()
  const { setTheme } = useTheme()
  const r = useRouter()
  const p = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (user === null) {
      r.replace('/auth')
    }
  }, [user, r])

  return <Suspense>
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="gap-2 items-center hidden md:flex">
              <Image src="/logo.png" alt="Agentify" width={728} height={728} className="w-6 h-6" />
              <h1 className="text-lg font-bold leading-tight lg:leading-[1.1]">
                Agentify
              </h1>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/app"
                className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary', p === '/app' || p.startsWith('/app/studio') || p.startsWith('/app/chat') ? 'bg-muted' : 'text-muted-foreground')}
              >
                <LucideBot className="size-4" />
                My Agents
              </Link>
              <Link
                href="/app/store"
                className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary', p.startsWith('/app/store') ? 'bg-muted' : 'text-muted-foreground')}
              >
                <LucideShoppingBag className="size-4" />
                Store
              </Link>
            </nav>
          </div>
          <div className="mt-auto py-2 px-2.5 lg:px-4 space-y-2">
            <Alert>
              <div className="flex gap-2 items-center mb-2">
                <LucideTriangleAlert className="h-4 w-4" />
                <AlertTitle className="!mb-0">
                  Warning!
                </AlertTitle>
              </div>
              <AlertDescription>
                Please expect the service to be unstable and data lost as we are in the Alpha phase.
              </AlertDescription>
            </Alert>
            <div className="flex gap-1 items-center justify-between">
              <div className="flex gap-1 items-center">
                <Button size="icon" variant="ghost" onClick={() => setTheme('dark')} className="dark:hidden flex">
                  <LucideMoonStar className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setTheme('light')} className="hidden dark:flex">
                  <LucideSun className="size-4" />
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <a href="https://github.com/mgilangjanuar/agentify" target="_blank" rel="noopener noreferrer">
                    <LucideGithub className="size-4" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                v0-alpha
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetHeader>
                <SheetTitle asChild className="!text-left text-lg px-2">
                  <Link className="flex items-center gap-3" href="/app" onClick={() => setOpen(false)}>
                    <Image src="/logo.png" alt="Agentify" width={728} height={728} className="w-6 h-6" />
                    <span className="font-bold">Agentify</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 text-md font-medium">
                <Link
                  onClick={() => setOpen(false)}
                  href="/app"
                  className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary', p === '/app' || p.startsWith('/app/studio') || p.startsWith('/app/chat') ? 'bg-muted' : 'text-muted-foreground')}
                >
                  <LucideBot className="size-4" />
                  My Agents
                </Link>
                <Link
                  onClick={() => setOpen(false)}
                  href="/app/store"
                  className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary', p.startsWith('/app/store') ? 'bg-muted' : 'text-muted-foreground')}
                >
                  <LucideShoppingBag className="size-4" />
                  Store
                </Link>
              </nav>
              <div className="mt-auto px-0.5 space-y-4">
                <Alert>
                  <div className="flex gap-2 items-center mb-2">
                    <LucideTriangleAlert className="h-4 w-4" />
                    <AlertTitle className="!mb-0">
                      Warning!
                    </AlertTitle>
                  </div>
                  <AlertDescription>
                    Please expect the service to be unstable and data lost as we are in the Alpha phase.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-1 items-center justify-between">
                  <div className="flex gap-1 items-center">
                    <Button size="icon" variant="ghost" onClick={() => setTheme('dark')} className="dark:hidden flex">
                      <LucideMoonStar className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setTheme('light')} className="hidden dark:flex">
                      <LucideSun className="size-4" />
                    </Button>
                    <Button asChild variant="ghost" size="icon">
                      <a href="https://github.com/mgilangjanuar/agentify" target="_blank" rel="noopener noreferrer">
                        <LucideGithub className="size-4" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    v0-alpha
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {user?.profile.picture ? <Image src={user.profile.picture} alt={user?.name!} width={96} height={96} className="h-7 w-7 rounded-full" /> : <CircleUser className="h-5 w-5" />}
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:cursor-pointer" asChild>
                <Link href="/app/settings">Settings</Link>
              </DropdownMenuItem>
              {user?.isSuperAdmin ? <DropdownMenuItem className="hover:cursor-pointer" asChild>
                <Link href="/app/admin">Admin Panel</Link>
              </DropdownMenuItem> : <></>}
              <DropdownMenuItem className="hover:cursor-pointer !text-red-500" onClick={async () => {
                await hit('/api/auth/destroy', {
                  method: 'DELETE',
                })
                if (window) {
                  localStorage.removeItem('refresh_token')
                }
                fetchUser()
              }}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        {children}
      </div>
    </div>
  </Suspense>
}
