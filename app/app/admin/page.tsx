'use client'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
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

    <div className="grid gap-2 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1">
      {(agents || [])?.map(agent => (
        <Card key={agent.id}>
          <Sheet>
            <SheetTrigger asChild>
              <CardHeader className="hover:cursor-pointer">
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
            </SheetTrigger>
            <SheetContent>
              <SheetHeader className="!text-left">
                <SheetTitle>{agent.name}</SheetTitle>
                <SheetDescription className="line-clamp-2">
                  {agent.description}
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <pre className="w-full text-sm overflow-auto no-scrollbar font-mono p-4 bg-muted rounded-lg max-h-[calc(100svh-150px)]">
                  {JSON.stringify(agent, null, 2)}
                </pre>
              </div>
            </SheetContent>
          </Sheet>
          <CardFooter className="flex gap-3 items-center justify-between flex-nowrap">
            <p className="text-muted-foreground truncate text-xs">
              By <span className="font-medium">{agent.user.name}</span>
            </p>
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
          </CardFooter>
        </Card>
      ))}
    </div>
  </main> : <></>
}
