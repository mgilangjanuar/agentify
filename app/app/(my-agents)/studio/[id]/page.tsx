'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { hit } from '@/lib/hit'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReloadIcon } from '@radix-ui/react-icons'
import { LucideArrowLeft, LucideSave, LucideSparkles } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const agentSchema = z.object({
  name: z.string({ required_error: '' }),
  description: z.string({ required_error: '' }),
  system: z.string().optional(),
  logoUrl: z.string().optional(),
  isUsingBrowsing: z.boolean().optional(),
  isPublic: z.boolean().optional(),
})

export default function StudioAgent() {
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [resultSchema, setResultSchema] = useState<any>()
  const agentForm = useForm<z.infer<typeof agentSchema>>({
    resolver: zodResolver(agentSchema),
    defaultValues: async () => {
      const resp = await hit(`/api/agents/${id}`)
      const json = await resp.json()
      setResultSchema(json.raw)
      return json
    }
  })

  const save = async (data: z.infer<typeof agentSchema>) => {
    setLoading(true)
    await hit(`/api/agents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
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
        <BreadcrumbLink asChild>
          <Link href="/app/studio">Studio</Link>
        </BreadcrumbLink>
          <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Edit Agent</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">

      <Card className="relative !h-fit">
        <CardHeader className="!pt-3">
          <CardTitle className="flex gap-2 items-center flex-row">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/app/studio">
                <LucideArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            Studio
          </CardTitle>
          <CardDescription>
            Create a new agent in the Studio.
          </CardDescription>
        </CardHeader>
      </Card>

      <Form {...agentForm}>
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
                <div className="space-y-4 lg:!max-h-[calc(100svh-290px)]">
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
                    {resultSchema.configs ? <div className="space-y-2">
                      <FormLabel>Configs</FormLabel>
                      {resultSchema.configs?.map((config: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="space-y-1">
                            <FormLabel className="font-mono">{config.name}</FormLabel>
                            <FormDescription className="whitespace-pre-line">{config.description}</FormDescription>
                          </div>
                        </div>
                      ))}
                    </div> : <></>}
                    {resultSchema.tools ? <div className="space-y-2">
                      <FormLabel>Tools</FormLabel>
                      {resultSchema.tools?.map((tool: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="space-y-1">
                            <FormLabel className="font-mono">{tool.name}</FormLabel>
                            <FormDescription className="whitespace-pre-line">{tool.description}</FormDescription>
                          </div>
                        </div>
                      ))}
                    </div> : <></>}
                  </div> : <></>}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-end w-full">
              <Button type="submit" disabled={loading}>
                {loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : <LucideSave className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  </main>
}