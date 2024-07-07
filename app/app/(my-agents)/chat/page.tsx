'use client'

import Markdown from '@/components/markdown'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { ClaudeCompletionPayload } from '@/lib/claude'
import { hit } from '@/lib/hit'
import { cn } from '@/lib/utils'
import { LucideCornerDownLeft } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'

export default function Chat() {
  const [messages, setMesages] = useState<ClaudeCompletionPayload['messages']>([])
  const ref = useRef<HTMLTextAreaElement>(null)
  const abort = useRef<AbortController>()
  const [loading, setLoading] = useState<boolean>(false)

  const sendMessage = async () => {
    const content = ref.current?.value
    if (!content?.trim()) return

    const payload: ClaudeCompletionPayload['messages'] = [
      ...messages,
      {
        role: 'user',
        content: content.trim()
      }
    ]
    setMesages(payload)

    setLoading(true)
    const resp = await hit('/api/engines/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: payload }),
    })
    setLoading(false)

    if (resp.ok) {
      const json = await resp.json()
      setMesages(json.messages)
      ref.current!.value = ''
    }
  }

  return <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:px-6">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/app">My Agents</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Chat</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <Card className="relative">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="pb-20">
        <ScrollArea className="!h-[calc(100svh-290px)]">
          <div className="space-y-4">
            {messages.map((message, index) => <>
              <div key={index} className={cn(message.role === 'user' ? 'bg-secondary float-right max-w-xl px-6' : '', 'py-4 rounded-lg')}>
                <Markdown content={typeof message.content === 'string' ? message.content : message.content.map(c => c.text).filter(Boolean).join('\n\n')} />
              </div>
              {message.role === 'user' ? <div className="clear-both" /> : <></>}
            </>)}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
      <CardFooter className="absolute bottom-0.5 right-0.5 left-0.5 bg-background">
        <div className="relative w-full pt-2">
          <Textarea
            ref={ref}
            autoFocus
            placeholder={loading ? 'Please wait...' : 'Type a message...'}
            required
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            rows={1}
            className="pr-10 min-h-0 h-auto resize-none no-scrollbar"
            readOnly={loading}
            onChange={({ target }) => {
              target.style.height = '0px'
              const scrollHeight = target.scrollHeight
              target.style.height = scrollHeight < 156 ? Math.max(scrollHeight, 38) + 'px' : '156px'
            }}
            onBlur={({ target }) => {
              target.style.height = '0px'
              const scrollHeight = target.scrollHeight
              target.style.height = scrollHeight < 156 ? Math.max(scrollHeight, 38) + 'px' : '156px'
            }}
            onKeyDown={(e) => {
              if (e.key.toLowerCase() === 'enter' && !e.shiftKey && !e.metaKey) {
                e.preventDefault()
                if (!ref.current?.value) return
                sendMessage()
              }
            }} />
          <Button disabled={loading} size="icon" className="absolute right-[3px] bottom-[3px] text-sm h-8 w-8 p-0" onClick={async () => {
            try {
              loading ? await abort.current?.abort() : await sendMessage()
            } catch (error) {
              // ignore
            }
          }}>
            {/* {loading ? <StopIcon fill="white" className="h-4 w-4" /> : <LucideCornerDownLeft className="h-4 w-4" />} */}
            <LucideCornerDownLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  </main>
}
