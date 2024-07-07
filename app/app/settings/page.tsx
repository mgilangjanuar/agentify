'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { hit } from '@/lib/hit'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReloadIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const configsSchema = z.object({
  ANTHROPIC_API_KEY: z.string({ required_error: '' })
    .refine(value => !value || value.startsWith('sk-ant-api'), {
      message: 'Invalid API Key',
    }),
})

export default function Settings() {
  const [loading, setLoading] = useState<boolean>(false)
  const form = useForm<z.infer<typeof configsSchema>>({
    resolver: zodResolver(configsSchema),
    defaultValues: async () => {
      try {
        const data = await hit('/api/users/me')
        if (!data.ok) throw new Error()

        const { user } = await data.json()
        return {
          ANTHROPIC_API_KEY: user.configs?.ANTHROPIC_API_KEY,
        }
      } catch (error) {
        return {
          ANTHROPIC_API_KEY: '',
        }
      }
    }
  })

  const submit = async (data: z.infer<typeof configsSchema>) => {
    setLoading(true)
    await hit('/api/users/me/configs', {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
    toast('Success', {
      description: 'Configs updated',
    })
    setLoading(false)
  }

  return <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:px-6 max-w-3xl">
    <div className="flex justify-between gap-2 flex-wrap items-center">
      <h1 className="text-xl font-semibold md:text-2xl">Settings</h1>
    </div>

    <div className="grid gap-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configs</CardTitle>
              <CardDescription>
                Configure your settings here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="ANTHROPIC_API_KEY"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ANTHROPIC_API_KEY</FormLabel>
                    <Input {...field} type="password" placeholder="risky but cool..." />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-end">
              <Button disabled={loading}>
                {loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : <></>}
                Set Configs
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  </main>
}
