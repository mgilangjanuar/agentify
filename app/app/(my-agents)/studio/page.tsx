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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { LucideSparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const useCaseSchema = z.object({
  useCase: z.string({ required_error: '' }),
})

export default function Studio() {
  const [loading, setLoading] = useState(false)
  const useCaseForm = useForm<z.infer<typeof useCaseSchema>>({
    resolver: zodResolver(useCaseSchema),
  })

  const generate = async (data: z.infer<typeof useCaseSchema>) => {
    console.log(data)
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

    <div className="grid gap-6 lg:grid-cols-2">

      <Form {...useCaseForm}>
        <form onSubmit={useCaseForm.handleSubmit(generate)} className="space-y-4">
          <FormField
            control={useCaseForm.control}
            name="useCase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Use Case</FormLabel>
                <Textarea {...field} placeholder="Write your use case in detail..." />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <LucideSparkles className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </form>
      </Form>

      <Card className="relative">
        <CardHeader>
          <CardTitle>
            Studio
          </CardTitle>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>
    </div>
  </main>
}
