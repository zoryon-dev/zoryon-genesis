import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '{{PROJECT_NAME}}',
  description: 'Generated with Next.js Starter',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
