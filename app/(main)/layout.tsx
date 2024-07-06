import Header from '@/components/header'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div>
    <div className="min-h-[calc(100svh-69px)]">
      <Header />
      {children}
    </div>
  </div>
}
