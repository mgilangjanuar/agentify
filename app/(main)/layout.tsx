import Footer from '@/components/footer'
import Header from '@/components/header'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div>
    <div className="min-h-svh">
      <Header />
      {children}
      <Footer />
    </div>
  </div>
}
