import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Project Update — Client Project Tracker',
  description: 'View your project status and progress update.',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
