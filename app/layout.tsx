import { cn } from '@/lib/utils'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PsyCodeTest',
  description: 'Test your code skills and know your psychological profile.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn(GeistSans, 'min-h-screen bg-background font-sans antialiased')}>
        {children}
      </body>
    </html>
  )
}
