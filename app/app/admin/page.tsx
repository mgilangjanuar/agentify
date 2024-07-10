'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useUser } from '@/components/use-user'
import { hit } from '@/lib/hit'
import { Agent } from '@prisma/client'
import { LucideBot } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function Submission() {
  const { user } = useUser()
  const r = useRouter()
  const [agents, setAgents] = useState<(Agent & { user: { name: string, email: string } })[]>()

  const fetchAgents = useCallback(async () => {
    const resp = await hit('/api/agents/submissions')
    const json = await resp.json()
    setAgents(json)
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      r.push('/app')
    }
  }, [user, r])

  return user?.isSuperAdmin ? <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:px-6">
    <div className="flex justify-between gap-2 flex-wrap items-center">
      <h1 className="text-xl font-semibold md:text-2xl">
        Submission
      </h1>
    </div>

    <ScrollArea className="md:!h-[calc(100svh-150px)]">
      <ScrollBar orientation="vertical" />
      <div className="grid gap-2 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {(agents || [])?.map(agent => (
          <Sheet key={agent.id}>
            <SheetTrigger asChild>
              <Card key={agent.id} className="hover:cursor-pointer">
                <CardHeader>
                  <div className="flex gap-4 flex-nowrap">
                    {agent.logoUrl ? <Image src={agent.logoUrl} width={50} height={50} className="rounded-lg !size-12" alt={agent.name} /> : <div className="!w-12 !h-12 flex items-center justify-center rounded-lg bg-muted">
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
                  {agent.verifiedAt ? <Button variant="ghost" className="!text-red-500">
                    Reject
                  </Button> : <Button variant="ghost">
                    Approve
                  </Button>}
                </CardFooter>
              </Card>
            </SheetTrigger>
            <SheetContent className="pr-0">
              <SheetHeader className="!text-left">
                <SheetTitle>{agent.name}</SheetTitle>
              </SheetHeader>
              <ScrollArea>
                <ScrollBar orientation="vertical" />
                <div className="py-4 content-start grid grid-cols-1 gap-4 max-h-[calc(100svh-120px)] pr-6">
                  {agent.logoUrl ? <Image src={agent.logoUrl} width={50} height={50} className="rounded-lg !size-12" alt={agent.name} /> : <div className="!w-12 !h-12 flex items-center justify-center rounded-lg bg-muted">
                    <LucideBot className="h-6 w-6" />
                  </div>}
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <p>{agent.description}</p>
                  </div>
                  <div className="space-y-1">
                    <Label>Creator</Label>
                    <p>{agent.user.name} (<a className="underline underline-offset-4" href={`mailto:${agent.user.email}`} target="_blank" rel="noopener noreferrer">{agent.user.email}</a>)</p>
                  </div>
                  <div className="space-y-1">
                    <Label>System</Label>
                    <p>{agent.system || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label>Using Browser</Label>
                    <p>
                      <Checkbox checked={agent.isUsingBrowsing} />
                    </p>
                  </div>
                  {(agent.configs as any[]).length ? <div className="space-y-1">
                    <Label>Configs</Label>
                    <Accordion type="multiple">
                      {(agent.configs as any[] || [])?.map((config, i) => (
                        <AccordionItem key={i} value={config.name}>
                          <AccordionTrigger className="font-mono !text-left">
                            {config.name}
                          </AccordionTrigger>
                          <AccordionContent>
                            {config.description}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div> : <></>}
                  {(agent.tools as any[]).length ? <div className="space-y-1">
                    <Label>Tools</Label>
                    <Accordion type="multiple">
                      {(agent.tools as any[] || [])?.map((tool, i) => (
                        <AccordionItem key={i} value={tool.name}>
                          <AccordionTrigger className="font-mono !text-left">
                            {tool.name}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="gap-2 grid grid-cols-1">
                              <p>
                                {tool.description}
                              </p>
                              <pre className="w-full text-sm overflow-x-auto no-scrollbar font-mono p-4 bg-muted rounded-lg">
                                {(() => {
                                  try {
                                    return JSON.stringify(JSON.parse(tool.input_schema), null, 2)
                                  } catch (error) {
                                    return tool.input_schema
                                  }
                                })()}
                              </pre>
                              <pre className="w-full text-sm overflow-x-auto no-scrollbar font-mono p-4 bg-muted rounded-lg">
                                {tool.execute}
                              </pre>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div> : <></>}
                </div>
              </ScrollArea>
              <SheetFooter className="pr-6 pt-4">
                {agent.verifiedAt ? <Button variant="secondary" className="text-red-500" onClick={async () => {
                  await hit(`/api/agents/submissions/${agent.id}/reject`, {
                    method: 'PATCH'
                  })
                  fetchAgents()
                }}>
                  Reject
                </Button> : <Button onClick={async () => {
                  await hit(`/api/agents/submissions/${agent.id}/approve`, {
                    method: 'PATCH'
                  })
                  fetchAgents()
                }}>
                  Approve
                </Button>}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </ScrollArea>
  </main> : <></>
}
