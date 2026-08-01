import type { ProjectStatus } from '../lib/types'

interface StatusBadgeProps {
  status: ProjectStatus
}

const config: Record<ProjectStatus, { classes: string; dot: string }> = {
  'Active':     { classes: 'bg-blue-950/60    text-blue-400    border-blue-700/50',    dot: 'bg-blue-400'    },
  'On Hold':    { classes: 'bg-orange-950/60  text-orange-400  border-orange-700/50',  dot: 'bg-orange-400'  },
  'Completed':  { classes: 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50', dot: 'bg-emerald-400' },
  'Reviewing':  { classes: 'bg-purple-950/60  text-purple-400  border-purple-700/50',  dot: 'bg-purple-400'  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { classes, dot } = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  )
}
