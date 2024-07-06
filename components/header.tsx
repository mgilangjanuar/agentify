'use client'

import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useUser } from '@/components/use-user'
import { cn } from '@/lib/utils'
import { LucideMenu, LucideMoonStar, LucideSun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const MENUS: {
  label: string
  href?: string
  items?: { label: string, href?: string, description?: string }[]
}[] = [
  {
    label: 'Pricing',
    href: '/pricing',
  },
  {
    label: 'Terms',
    href: '/terms',
  },
  {
    label: 'Privacy',
    href: '/privacy',
  },
]

export default function Header() {
  const { user } = useUser()
  const { setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const p = usePathname()

  return <div className="container mx-auto sticky top-2 z-50 max-w-screen-lg">
    <header className="mx-auto h-[56px] w-full border rounded-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">

        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden flex">
              <Button size="icon" variant="ghost">
                <LucideMenu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle asChild className="!text-left text-lg">
                  <Link className="flex items-center gap-2.5" href="/" onClick={() => setOpen(false)}>
                    <Image src="/logo.png" alt="Agentify" width={728} height={728} className="w-7 h-7" />
                    <span className="font-bold">Agentify</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 py-4 pl-10">
                {MENUS.filter(m => !m.items?.length).map((menu, i) => (
                  <Link key={i} className={cn(p.startsWith(menu.href || '') ? 'text-foreground/80' : 'text-foreground/60 hover:text-foreground/80', 'font-normal')} href={menu.href || ''} onClick={() => setOpen(false)}>
                    {menu.label}
                  </Link>
                ))}
                {MENUS.filter(m => m.items?.length).map((menu, i) => (
                  <div key={i} className="flex flex-col gap-3 pt-3">
                    <h4 className="font-medium">{menu.label}</h4>
                    {menu.items!.map((item, ii) => (
                      <Link key={ii} href={item.href || ''} className="text-foreground/60 hover:text-foreground/80 font-normal" onClick={() => setOpen(false)}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="gap-2.5 items-center hidden md:flex">
            <Image src="/logo.png" alt="Agentify" width={728} height={728} className="w-7 h-7" />
            <h1 className="text-lg font-bold leading-tight lg:leading-[1.1]">
              Agentify
            </h1>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {MENUS.map((menu, i) => (
                menu.items?.length ? (
                  <NavigationMenuItem key={i}>
                    <NavigationMenuTrigger className="!bg-background/0 text-foreground/60 hover:text-foreground/80 font-normal">
                      {menu.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {menu.items.map((item, ii) => (
                          <li key={ii}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.href || ''}
                                className={cn(
                                  'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                                  ''
                                )}
                              >
                                <div className="text-sm font-medium leading-none">{item.label}</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {item.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={i}>
                    <Link href={menu.href || ''} legacyBehavior passHref>
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), p.startsWith(menu.href || '') ? 'text-foreground/80' : 'text-foreground/60 hover:text-foreground/80', '!bg-background/0 font-normal')}>
                        {menu.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex gap-2 items-center">
          {user !== undefined ? <Button asChild>
            {user ? <Link href="/app">
              My Agents
            </Link> : <Link href="/auth">
              Login
            </Link>}
          </Button> : <></>}
          <Button size="icon" variant="ghost" onClick={() => setTheme('dark')} className="dark:hidden flex">
            <LucideMoonStar className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setTheme('light')} className="hidden dark:flex">
            <LucideSun className="size-4" />
          </Button>
        </div>

      </div>
    </header>
  </div>
}
