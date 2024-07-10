'use client'

import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ClaudeCompletionPayload, ClaudeContent, ClaudeStreamResponse } from '@/lib/claude'
import { ClaudeReceiver } from '@/lib/claude-receiver'
import { hit } from '@/lib/hit'
import { zodResolver } from '@hookform/resolvers/zod'
import { CaretSortIcon, ReloadIcon } from '@radix-ui/react-icons'
import { jsonrepair } from 'jsonrepair'
import { LucideBot, LucideChevronRight, LucideSave, LucideSparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const useCaseSchema = z.object({
  useCase: z.string({ required_error: '' }),
})

const agentSchema = z.object({
  name: z.string({ required_error: '' }),
  description: z.string({ required_error: '' }),
  system: z.string().optional(),
  logoUrl: z.string().optional(),
  isUsingBrowsing: z.boolean().optional(),
  isPublic: z.boolean().optional(),
})

export default function Studio() {
  const [loading, setLoading] = useState(false)
  const [resultSchema, setResultSchema] = useState<any>()
  const [useBlank, setUseBlank] = useState(false)
  const [messages, setMessages] = useState<ClaudeCompletionPayload['messages']>([])
  const useCaseForm = useForm<z.infer<typeof useCaseSchema>>({
    resolver: zodResolver(useCaseSchema),
  })
  const agentForm = useForm<z.infer<typeof agentSchema>>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      description: '',
      system: '',
      logoUrl: '',
      isUsingBrowsing: false,
      isPublic: false,
    }
  })

  const generate = async (data: z.infer<typeof useCaseSchema>, payload?: ClaudeCompletionPayload['messages']) => {
    setLoading(true)
    if (!payload) {
      setResultSchema(undefined)
    }

    const resp = await hit('/api/engines/generate-stream', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        messages: payload || messages,
      }),
    })
    if (!resp.ok) {
      const result = await resp.json()
      if (!resp.ok) {
        toast('Error', {
          description: result.error?.message || result.error || 'Something went wrong',
        })
        return
      }
    }

    let json: ClaudeCompletionPayload['messages'] = [...(payload || messages), {
      role: 'assistant',
      content: []
    }]

    let finished = false
    const generateTools = (result: any) => {
      agentForm.reset({
        name: result.agent_name,
        description: result.description,
        system: '',
        logoUrl: '',
        isUsingBrowsing: false,
        isPublic: false,
      })
      setUseBlank(false)
      setResultSchema(result)
      setMessages([])
      finished = true
    }

    let text = ''
    await ClaudeReceiver.consumeAsData(resp, data => {
      const resp = data as ClaudeStreamResponse
      if (resp.content_block) {
        text = ''
      }

      if (resp.message?.role === 'user') {
        json = [
          ...(payload || messages),
          resp.message as {
            role: 'user' | 'assistant',
            content: string | ClaudeContent[]
          },
          {
            role: 'assistant',
            content: []
          }
        ]
        setMessages(json)
      }

      const last = json[json.length - 1]
      text += resp.delta?.text || resp.delta?.partial_json || ''
      if (resp.content_block || text) {
        try {
          json = [...json.slice(0, -1), {
            role: 'assistant',
            content: resp.content_block ? [
              ...last.content as ClaudeContent[] || [],
              resp.content_block
            ] : [
              ...(last.content as ClaudeContent[] || []).slice(0, -1),
              {
                ...(last.content as ClaudeContent[] || [])[last.content.length - 1],
                ...resp.delta?.text ? {
                  text: text
                } : resp.delta?.partial_json ? {
                  input: JSON.parse(
                    jsonrepair(text)
                  )
                } : {}
              }
            ]
          }]
          setMessages(json)

          if ((json.at(-1)?.content?.at(-1) as ClaudeContent).name === 'generate_tools') {
            const result = (json.at(-1)?.content?.at(-1) as ClaudeContent)?.input as any
            generateTools(result)
          }
        } catch (error) {
          // ignore
        }
      }
    })

    if ((json.at(-1)?.content?.at(-1) as ClaudeContent).name === 'generate_tools') {
      const result = (json.at(-1)?.content?.at(-1) as ClaudeContent)?.input as any
      generateTools(result)
      setLoading(false)
    }

    if (!finished) {
      await generate(data, json)
    }
  }

  const save = async (data: z.infer<typeof agentSchema>) => {
    setLoading(true)
    const resp = await hit('/api/agents', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        configs: resultSchema?.configs || [],
        tools: resultSchema?.tools || [],
        raw: {
          ...resultSchema || {},
          useCase: useCaseForm.getValues()?.useCase || '',
        },
      }),
    })
    const json = await resp.json()
    if (resp.ok) {
      toast('Success', {
        description: 'Agent has been updated.',
      })
    } else {
      toast('Error', {
        description: json.error || 'Something went wrong.'
      })
    }
    setLoading(false)
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
          <BreadcrumbPage>Studio</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

      <Form {...useCaseForm}>
        <form onSubmit={useCaseForm.handleSubmit(data => generate(data))}>
          <Card className="relative">
            <CardHeader>
              <CardTitle>
                Agent Studio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={useCaseForm.control}
                name="useCase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scenario</FormLabel>
                    <Textarea {...field} placeholder="Write your use case in detail..." />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between w-full">
              <div className="flex items-center space-x-2">
                <Checkbox id="useBlank" onCheckedChange={b => setUseBlank(!!b)} />
                <label
                  htmlFor="useBlank"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use Blank Form
                </label>
              </div>
              <Button type="submit" disabled={loading}>
              {loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : <LucideSparkles className="w-4 h-4 mr-2" />}
                Generate
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {useBlank || resultSchema ? <Form {...agentForm}>
        <form onSubmit={agentForm.handleSubmit(save)} className="xl:col-span-2">
          <Card className="relative xl:col-span-2">
            <CardHeader>
              <CardTitle>
                Create Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full truncate">
                <ScrollBar orientation="vertical" />
                <div className="space-y-4 lg:!max-h-[calc(100svh-290px)] md:!max-h-[calc(100svh-324px)] px-2.5">
                  <FormField
                    control={agentForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <Input {...field} placeholder="Agent name" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={agentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <Textarea {...field} placeholder="Agent description" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={agentForm.control}
                    name="system"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System</FormLabel>
                        <Textarea {...field} placeholder="Add your additional instructions here..." />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={agentForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <Input {...field} placeholder="Should be a valid URL with http:// or https://" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={agentForm.control}
                    name="isUsingBrowsing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md pt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Is Using Browsing
                          </FormLabel>
                          <FormDescription className="whitespace-pre-line">
                            Enable this option if the agent uses a headless browser to perform its tasks.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={agentForm.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md pt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Is Public
                          </FormLabel>
                          <FormDescription className="whitespace-pre-line">
                            Submit this agent to the Store.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  {resultSchema ? <div className="space-y-4 p-4 bg-secondary rounded-xl !mt-8">
                    <h3 className="text-md font-semibold flex items-center gap-2">
                      <LucideSparkles className="w-4 h-4" />
                      Generated by Studio
                    </h3>
                    {resultSchema.configs ? <div className="space-y-4">
                      <div className="flex gap-2 items-center">
                        <Label>Configs</Label>
                        <Separator className="w-full flex-1" />
                      </div>
                      {resultSchema.configs?.map((config: any, index: number) => (
                        <div key={index} className="flex flex-nowrap gap-2">
                          <div>
                            <LucideChevronRight className="w-3 h-3 mt-1.5" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <FormLabel className="font-mono text-sm">{config.name}</FormLabel>
                            <FormDescription className="whitespace-pre-line">{config.description}</FormDescription>
                          </div>
                        </div>
                      ))}
                    </div> : <></>}
                    {resultSchema.tools ? <div className="space-y-4">
                      <div className="flex gap-2 items-center">
                        <Label>Tools</Label>
                        <Separator className="w-full flex-1" />
                      </div>
                      {resultSchema.tools?.map((tool: any, index: number) => (
                        <div key={index} className="flex flex-nowrap gap-2">
                          <div>
                            <LucideChevronRight className="w-3 h-3 mt-0.5" />
                          </div>
                          <div className="space-y-1 grid grid-cols-1 w-full">
                            <FormLabel className="font-mono">{tool.name}</FormLabel>
                            <FormDescription className="whitespace-pre-line">{tool.description}</FormDescription>
                            <Collapsible>
                              <CollapsibleTrigger>
                                <Badge variant="outline">
                                  Input Schema
                                  <CaretSortIcon className="w-3 h-3 ml-1" />
                                </Badge>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <pre className="w-full text-sm overflow-x-auto no-scrollbar font-mono p-4 bg-muted border rounded-lg mt-2">
                                  {(() => {
                                    try {
                                      return JSON.stringify(JSON.parse(jsonrepair(tool.input_schema)), null, 2)
                                    } catch (error) {
                                      return ''
                                    }
                                  })()}
                                </pre>
                              </CollapsibleContent>
                            </Collapsible>
                            <Collapsible>
                              <CollapsibleTrigger>
                                <Badge variant="outline">
                                  Execute Fn
                                  <CaretSortIcon className="w-3 h-3 ml-1" />
                                </Badge>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <pre className="w-full text-sm overflow-x-auto no-scrollbar font-mono p-4 bg-muted border rounded-lg mt-2">
                                  {tool.execute}
                                </pre>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        </div>
                      ))}
                    </div> : <></>}
                  </div> : <></>}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between w-full items-center flex-wrap gap-3 lg:flex-row flex-col">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" className="flex items-center gap-2">
                    Edit in Advanced Mode ✨
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Soon
                </TooltipContent>
              </Tooltip>
              <Button type="submit" disabled={loading}>
                {loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : <LucideSave className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form> : <>
        {messages?.length ? <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>
              Processing...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full truncate">
              <ScrollBar orientation="vertical" />
              <div className="space-y-4 md:!max-h-[calc(100svh-290px)] px-2.5">
                {messages?.map((message, i) => (
                  <>
                    {(message.content as ClaudeContent[] || []).map((content, ii) => (
                      <div key={`${i}:${ii}`} className="flex flex-nowrap gap-2 items-start">
                        <LucideBot className="w-4 h-4 mt-1.5" />
                        {content.name && content.type === 'tool_use' ? <p className="flex-1">
                          processing: {content.name}...
                        </p> : <div className="flex-1 grid grid-cols-1">
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <p className="underline underline-offset-4 hover:cursor-pointer">
                                return: {content.type} ({(content.content as ClaudeContent[] || []).map(c => c.type).join(', ')})
                              </p>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              {(content.content as ClaudeContent[] || []).map((content, iii) => (
                                <pre key={iii} className="w-full text-sm overflow-x-auto no-scrollbar font-mono p-4 bg-muted border rounded-lg mt-2">
                                  {(() => {
                                    try {
                                      return JSON.stringify(JSON.parse(jsonrepair(content.text!)), null, 2)
                                    } catch (error) {
                                      return content.text || '[done]'
                                    }
                                  })()}
                                </pre>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        </div>}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card> : <></>}
      </>}
    </div>
  </main>
}
