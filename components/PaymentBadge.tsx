import type { PaymentStatus } from '../lib/types'

interface PaymentBadgeProps {
  status: PaymentStatus
  cost: number
}

const config: Record<PaymentStatus, { label: string; classes: string; dot: string }> = {
  paid:    { label: 'Paid',             classes: 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50', dot: 'bg-emerald-400' },
  partial: { label: 'Partially Paid',   classes: 'bg-amber-950/60  text-amber-400  border-amber-700/50',    dot: 'bg-amber-400'   },
  none:    { label: 'No Downpayment',   classes: 'bg-rose-950/60   text-rose-400   border-rose-700/50',     dot: 'bg-rose-400'    },
}

export default function PaymentBadge({ status, cost }: PaymentBadgeProps) {
  const { label, classes, dot } = config[status]
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-lg font-bold text-slate-100">
        ₱{cost.toLocaleString('en-PH')}
      </span>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${classes}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
        {label}
      </span>
    </div>
  )
}
