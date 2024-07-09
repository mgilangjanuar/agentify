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
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Claude, ClaudeCompletionPayload, ClaudeContent } from '@/lib/claude'
import { ClaudeReceiver } from '@/lib/claude-receiver'
import { hit } from '@/lib/hit'
import { cn } from '@/lib/utils'
import { History } from '@prisma/client'
import { CaretSortIcon } from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { jsonrepair } from 'jsonrepair'
import { LucideArrowLeft, LucideBot, LucideCornerDownLeft, LucidePlus, LucideTrash2 } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

dayjs.extend(relativeTime)

export default function Chat() {
  const [select, setSelect] = useState<string | null>()
  const [histories, setHistories] = useState<History[]>([])
  const [messages, setMesages] = useState<ClaudeCompletionPayload['messages']>([])
  const ref = useRef<HTMLTextAreaElement>(null)
  const abort = useRef<AbortController>()
  const [loading, setLoading] = useState<boolean>(false)

  const fetchHistories = useCallback(async () => {
    const resp = await hit('/api/histories?installedAgentId=null')
    if (resp.ok) {
      const json = await resp.json()
      setHistories(json)
    }
  }, [])

  useEffect(() => {
    fetchHistories()
  }, [fetchHistories])

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
    const resp = await hit('/api/engines/chat-exp', {
      method: 'POST',
      body: JSON.stringify({ messages: payload }),
    })
    setMesages([...payload, {
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: ''
        }
      ]
    }])
    setLoading(false)
    await ClaudeReceiver.consumeAsText(resp, async (text) => {
      if (text.startsWith('__meta: ')) return
      setMesages([...payload, {
        role: 'assistant',
        content: [
          {
            type: 'text',
            text
          }
        ]
      }])
    }, true)

    // const json = await resp.json()
    // if (!resp.ok) {
    //   toast('Error', {
    //     description: json.error?.message || json.error || 'Something went wrong',
    //   })
    //   return
    // }

    // setMesages(json.messages)
    // ref.current!.value = ''

    // const results = json.messages as ClaudeCompletionPayload['messages']
    // if (select) {
    //   await hit(`/api/histories/${select}`, {
    //     method: 'PATCH',
    //     body: JSON.stringify({ messages: results }),
    //   })
    // } else {
    //   const resp = await hit('/api/engines/chat', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //       messages: [
    //         {
    //           role: 'user',
    //           content: `Create a title for this chat in max 5 words without any quotes or apostrophes.\n\n<messages>\n${results.map(({ content, role }) => `<message role="${role}">${typeof content === 'string' ? content : content.map(c => c.text).join('\n')}</message>`).join('\n')}\n</messages>`
    //         }
    //       ]
    //     }),
    //   })

    //   const titleJson = await resp.json() as { messages: ClaudeCompletionPayload['messages'] }
    //   const history = await hit('/api/histories', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //       title: (titleJson.messages.at(-1)?.content as ClaudeContent[])?.find(c => c.text)?.text || 'Untitled',
    //       messages: results,
    //     }),
    //   })
    //   const historyJson = await history.json() as History
    //   setSelect(historyJson.id)
    // }

    // fetchHistories()
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

    <div className="grid gap-6 xl:grid-cols-4 lg:grid-cols-3">

      <div className={cn('flex gap-1 flex-col relative', select === undefined ? 'flex' : select !== undefined ? 'hidden lg:flex' : '')}>
        <Button variant="outline" onClick={() => {
          setSelect(null)
          setMesages([])
        }}>
          <LucidePlus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <ScrollArea className="!h-[calc(100svh-190px)] mt-2 w-full truncate">
          <div className="flex flex-col gap-1 min-w-0">
            {histories.map((history, index) => (
              <div
                key={index}
                className={cn(
                  "hover:cursor-pointer flex flex-col items-start gap-1.5 rounded-lg p-3 text-left text-sm transition-all",
                  select === history.id && "bg-muted"
                )}
                onClick={() => {
                  setSelect(history.id)
                  setMesages(history.messages as ClaudeCompletionPayload['messages'])
                }}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="font-medium truncate overflow-hidden whitespace-nowrap flex-1">{history.title}</div>
                  <div
                    className={cn(
                      "ml-auto text-xs whitespace-nowrap",
                      select === history.id ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {dayjs(history.createdAt).fromNow(true)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      <Card className={cn('relative xl:col-span-3 lg:col-span-2', select ? 'block' : select === undefined ? 'hidden lg:block' : '')}>
        <CardHeader className="flex items-center gap-3 justify-between flex-row !pt-3">
          <div className="flex items-center gap-3 truncate">
            <Button variant="ghost" size="icon" className="flex lg:hidden" onClick={() => {
              setSelect(undefined)
              setMesages([])
            }}>
              <LucideArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="!m-0 !h-9 truncate flex items-center">
              Chat
            </CardTitle>
          </div>
          {select ? <Button variant="ghost" className="!my-0" size="icon" onClick={async () => {
            await hit(`/api/histories/${select}`, { method: 'DELETE' })
            setSelect(undefined)
            setMesages([])
            fetchHistories()
          }}>
            <LucideTrash2 className="h-4 w-4 text-red-500" />
          </Button> : <></>}
        </CardHeader>
        <CardContent className="pb-20">
          <ScrollArea className="!h-[calc(100svh-290px)]">
            <div className="space-y-6 px-2.5">
              {messages.map((message, index) => message.role === 'user' ? <>
                {typeof message.content === 'string' ? <div className="flex w-full justify-end">
                  <div key={index} className="bg-secondary px-6 py-4 rounded-lg max-w-xl">
                    <Markdown content={message.content} />
                  </div>
                </div> : message.content.map((content, i) => <div key={i}>
                  {content.type === 'text' ? <div className="flex w-full justify-end">
                    <div className="bg-secondary px-6 py-4 rounded-lg max-w-xl">
                      <Markdown content={content.text!} />
                    </div>
                  </div> : <></>}
                </div>)}
              </> : <>
                {typeof message.content === 'string' ? <div>
                  <div key={index} className="py-4 rounded-lg">
                    <Markdown content={message.content} />
                  </div>
                </div> : message.content.map((content, i) => <div key={i}>
                  {content.type === 'text' ? <Markdown content={content.text!} /> : <></>}
                  {content.type === 'tool_use' ? <Collapsible className="space-y-2">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-2 hover:cursor-pointer">
                        <LucideBot className="h-3.5 w-3.5" />
                        <span>
                          Running: <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium">{content.name}</code>
                        </span>
                        <CaretSortIcon className="h-3.5 w-3.5" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {messages.find(m => m.role === 'user' && Array.isArray(m.content) && m.content.find(c => c.tool_use_id === content.id)) ? <pre className="w-full text-sm overflow-x-auto no-scrollbar font-mono p-4 bg-muted rounded-lg">
                        {(() => {
                          const message = messages.find(m => m.role === 'user' && Array.isArray(m.content) && m.content.find(c => c.tool_use_id === content.id))
                          const text = (
                            (message?.content as ClaudeContent[])
                            .find(c => Array.isArray(c.content))
                            ?.content as ClaudeContent[]
                          )?.find(c => c.text)?.text
                          if (!text) return '[done]'
                          try {
                            return JSON.stringify(JSON.parse(jsonrepair(text!)), null, 2)
                          } catch (error) {
                            return text
                          }
                        })()}
                      </pre> : <></>}
                    </CollapsibleContent>
                  </Collapsible> : <></>}
                </div>)}
              </>)}
              {loading ? <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div> : <></>}
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
    </div>
  </main>
}
