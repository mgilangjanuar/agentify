'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/components/use-user'
import { hit } from '@/lib/hit'
import { Agent, InstalledAgent } from '@prisma/client'
import { LucideBot, LucideChevronRight, LucideEdit3, LucidePlus, LucideTrash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function MyAgents() {
  const { user } = useUser()
  const r = useRouter()
  const [installedAgents, setInstalledAgents] = useState<(InstalledAgent & { agent: Agent })[]>()
  const [agents, setAgents] = useState<(Agent & { installedAgents?: { id: string }[] })[]>()

  const fetchAgents = useCallback(async () => {
    if (user) {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setAgents(data)
    }
  }, [user])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const fetchInstalledAgents = useCallback(async () => {
    if (user) {
      const response = await fetch('/api/installs')
      const data = await response.json()
      setInstalledAgents(data)
    }
  }, [user])

  useEffect(() => {
    fetchInstalledAgents()
  }, [fetchInstalledAgents])

  return <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:px-6">
    <div className="flex justify-between gap-2 flex-wrap items-center">
      <h1 className="text-xl font-semibold md:text-2xl">
        My Agents
      </h1>
    </div>

    <ScrollArea className="md:!h-[calc(100svh-150px)]">
      <div className="space-y-10">
        {installedAgents &&  !installedAgents?.length ? <div className="grid gap-4">
          <div className="grid gap-2 xl:grid-cols-3 grid-cols-2">
            <Card className="hover:cursor-pointer w-full" onClick={() => r.push('/app/settings')}>
              <CardHeader>
                <CardTitle>
                  Configure API Keys
                </CardTitle>
                <CardDescription>
                  Add the Anthropic API key to manage your agents.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:cursor-pointer w-full" onClick={() => r.push('/app/chat')}>
              <CardHeader>
                <CardTitle>
                  Playground
                </CardTitle>
                <CardDescription>
                  Test your API key by chatting with the blank agent.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground">
            You have not installed any agents yet. <Link className="underline" href="/app/studio">Create</Link> or <Link className="underline" href="/app/store">install</Link> an agent to get started.
          </p>
        </div> : <div className="flex flex-col gap-2">
          <div className="grid gap-4 xl:grid-cols-6 lg:grid-cols-4 sm:grid-cols-3 grid-cols-2">
            {(installedAgents || [])?.map(({ agent, id }) => (
              <div key={id} className="p-4 flex flex-col items-center gap-2 hover:cursor-pointer" onClick={() => r.push(`/app/chat/${id}`)}>
                {agent.logoUrl ? <Image src={agent.logoUrl} width={50} height={50} className="rounded-lg !size-20" alt={agent.name} /> : <div className="!w-20 !h-20 flex items-center justify-center rounded-lg bg-gray-200">
                  <LucideBot className="h-12 w-12" />
                </div>}
                <p className="w-full text-center text-sm font-medium">
                  {agent.name}
                </p>
              </div>
            ))}
          </div>
        </div>}

        <div className="flex flex-col gap-2">
          <h3 className="text-md font-medium flex flex-nowrap items-center gap-2 text-muted-foreground">
            <LucideChevronRight className="h-4 w-4" />
            <span>Creator Space</span>
            <Separator className="grow flex-1" />
          </h3>
          <div className="grid gap-2 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {(agents || [])?.map(agent => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex gap-4 flex-nowrap">
                    {agent.logoUrl ? <Image src={agent.logoUrl} width={50} height={50} className="rounded-lg !size-12" alt={agent.name} /> : <div className="!w-12 !h-12 flex items-center justify-center rounded-lg bg-gray-200">
                      <LucideBot className="h-6 w-6" />
                    </div>}
                    <div className="flex flex-col space-y-1.5 flex-1">
                      <CardTitle>{agent.name}</CardTitle>
                      <CardDescription className="line-clamp-2 min-h-[40px]">{agent.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="flex gap-3 items-center justify-end">
                  <Button variant="ghost" asChild size="icon">
                    <Link href={`/app/studio/${agent.id}`}>
                      <LucideEdit3 className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <LucideTrash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Are you sure you want to delete this agent?</p>
                        <div className="flex justify-end">
                          <Button variant="destructive" onClick={async () => {
                            await fetch(`/api/agents/${agent.id}`, { method: 'DELETE' })
                            fetchAgents()
                          }}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {agent.installedAgents?.length ? <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="secondary" className="text-red-500">
                        Uninstall
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Are you sure you want to uninstall this agent?</p>
                        <div className="flex justify-end">
                          <Button variant="destructive" onClick={async () => {
                            await fetch(`/api/installs/${agent.installedAgents![0].id}`, { method: 'DELETE' })
                            fetchInstalledAgents()
                            fetchAgents()
                          }}>
                            Uninstall
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover> : <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="default">
                        Install
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader className="!text-left">
                        <DialogTitle>
                          {agent.name}
                        </DialogTitle>
                        <DialogDescription>
                          {agent.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex items-center flex-wrap gap-2">
                          <Label>Available Tools:</Label>
                          <div className="flex gap-2 flex-wrap">
                            {(agent.tools as any[])?.map(tool => (
                              <Badge variant="secondary" key={tool.name}>{tool.name}</Badge>
                            ))}
                          </div>
                        </div>
                        <form className="grid gap-4" onSubmit={async e => {
                          e.preventDefault()
                          const data = Object.fromEntries(new FormData(e.currentTarget).entries())
                          await hit('/api/installs', {
                            method: 'POST',
                            body: JSON.stringify({ agentId: agent.id, configs: data }),
                          })
                          await fetchInstalledAgents()
                        }}>
                          {(agent.configs as any[])?.map(config => (
                            <div key={config.id} className="space-y-2">
                              <Label className="text-sm font-medium">{config.name}</Label>
                              <Input name={config.name} />
                              <p className="text-muted-foreground text-xs">
                                {config.description}
                              </p>
                            </div>
                          ))}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="submit">Install</Button>
                            </DialogClose>
                          </DialogFooter>
                        </form>
                      </div>
                    </DialogContent>
                  </Dialog>}
                </CardFooter>
              </Card>
            ))}
            <Card className="hover:cursor-pointer" onClick={() => r.push('/app/studio')}>
              <CardHeader>
                <CardTitle className="flex items-center flex-row gap-2">
                  <LucidePlus className="h-4 w-4" />
                  New Agent
                </CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                  Create a new agent using the Studio.
                </CardDescription>
              </CardHeader>
              <CardFooter className="min-h-[60px]"></CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  </main>
}
