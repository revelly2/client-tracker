import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard — Client Project Tracker',
  description: 'Manage all client projects, track progress, and share project links.',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
