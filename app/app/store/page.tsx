'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { hit } from '@/lib/hit'
import { Agent } from '@prisma/client'
import { LucideBot } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function Store() {
  const r = useRouter()
  const [tab, setTab] = useState<'all' | 'installed'>('all')
  const [agents, setAgents] = useState<(Agent & { installedAgents?: { id: string }[], user: { name: string } })[]>()

  const fetchAgents = useCallback(async () => {
    const resp = await hit(tab === 'installed' ? '/api/agents/store?installed=true' : '/api/agents/store')
    const json = await resp.json()
    setAgents(json)
  }, [tab])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:px-6">
    <div className="flex justify-between gap-2 flex-wrap items-center">
      <h1 className="text-xl font-semibold md:text-2xl">
        Agent Store
      </h1>
    </div>

    <div className="flex gap-1.5 items-center flex-nowrap">
      <Badge
        variant={tab === 'all' ? 'default' : 'outline'}
        className="hover:cursor-pointer"
        onClick={() => setTab('all')}
      >
        All
      </Badge>
      <Badge
        variant={tab === 'installed' ? 'default' : 'outline'}
        className="hover:cursor-pointer"
        onClick={() => setTab('installed')}
      >
        Installed
      </Badge>
    </div>

    <div className="grid gap-2 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1">
      {(agents || [])?.map(agent => (
        <Card key={agent.id}>
          <CardHeader className={agent.installedAgents?.length ? 'hover:cursor-pointer' : ''} onClick={() => {
            if (agent.installedAgents?.length) {
              r.push(`/app/chat/${agent.installedAgents![0].id}`)
            }
          }}>
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
          <CardFooter className="flex gap-3 items-center justify-between flex-nowrap">
            <p className="text-muted-foreground truncate text-xs">
              By <span className="font-medium">{agent.user.name}</span>
            </p>
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
                      {agent.isUsingBrowsing ? <Badge variant="secondary">browsing</Badge> : <></>}
                    </div>
                  </div>
                  <form className="grid gap-4" onSubmit={async e => {
                    e.preventDefault()
                    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
                    await hit('/api/installs', {
                      method: 'POST',
                      body: JSON.stringify({ agentId: agent.id, configs: data }),
                    })
                    await fetchAgents()
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
    </div>
  </main>
}
