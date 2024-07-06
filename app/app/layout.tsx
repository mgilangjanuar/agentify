export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div>
    <div className="min-h-svh">
      {children}
    </div>
  </div>
}
