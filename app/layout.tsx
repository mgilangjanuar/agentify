import { Toaster } from '@/components/ui/sonner'
import { UserProvider } from '@/components/use-user'
import { cn } from '@/lib/utils'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agentify',
  description: 'Create and install agents to automate your tasks with Anthropic models',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={
          cn(GeistSans, 'min-h-screen bg-background font-sans antialiased')
        }>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <UserProvider>
              {children}
            </UserProvider>
          </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
