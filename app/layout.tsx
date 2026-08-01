import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Client Project Tracker',
  description: 'Track and share client project progress with a clean, professional dashboard.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
