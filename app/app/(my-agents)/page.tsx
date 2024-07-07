'use client'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Agent, InstalledAgent } from '@prisma/client'
import { LucideChevronRight, LucideEdit3, LucidePlus, LucideTrash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function MyAgents() {
  const r = useRouter()
  const [installedAgents, setInstalledAgents] = useState<(InstalledAgent & { agent: Agent })[]>()
  const [agents, setAgents] = useState<Agent[]>()

  const fetchAgents = useCallback(async () => {
    const response = await fetch('/api/agents')
    const data = await response.json()
    setAgents(data)
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const fetchInstalledAgents = useCallback(async () => {
    const response = await fetch('/api/installs')
    const data = await response.json()
    setInstalledAgents(data)
  }, [])

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
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-md font-medium md:text-lg flex items-center gap-2">
            <LucideChevronRight className="h-4 w-4" />
            Installed
          </h3>
          {installedAgents && !installedAgents.length && (
            <p className="text-sm text-muted-foreground">
              You have not installed any agents yet. <Link className="underline" href="/app/studio">Create</Link> or <Link className="underline" href="/app/store">install</Link> an agent to get started.
            </p>
            )}
          <div className="grid gap-2 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
            {installedAgents?.map(({ agent }) => (
              <Card key={agent.id} className="hover:cursor-pointer">
                <CardHeader>
                  <CardTitle>{agent.name}</CardTitle>
                  <CardDescription className="line-clamp-3">{agent.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-md font-medium md:text-lg flex items-center gap-2">
            <LucideChevronRight className="h-4 w-4" />
            Creator Space
          </h3>
          <div className="grid gap-2 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
            {agents?.map(agent => (
              <Card key={agent.id} className="hover:cursor-pointer">
                <CardHeader>
                  <CardTitle>{agent.name}</CardTitle>
                  <CardDescription className="line-clamp-3">{agent.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex gap-1.5 items-center">
                  <Button variant="secondary" className="grow" asChild>
                    <Link href={`/app/studio/${agent.id}`}>
                      <LucideEdit3 className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="secondary" className="grow">
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
                  <Button variant="default" className="grow" disabled={!!installedAgents?.find(installedAgent => installedAgent.agentId === agent.id)}>
                    Install
                  </Button>
                </CardFooter>
              </Card>
            ))}
            <Card className="hover:cursor-pointer" onClick={() => r.push('/app/studio')}>
              <CardHeader>
                <CardTitle className="flex items-center flex-row gap-2">
                  <LucidePlus className="h-4 w-4" />
                  New Agent
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  Create a new agent using the Studio.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  </main>
}
