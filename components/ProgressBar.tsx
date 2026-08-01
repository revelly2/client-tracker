'use client'

import { useEffect, useRef } from 'react'

interface ProgressBarProps {
  value: number // 0–100
  animated?: boolean
}

function getColorClasses(value: number): string {
  if (value >= 100) return 'from-emerald-400 to-green-500'
  if (value >= 75)  return 'from-green-400 to-emerald-500'
  if (value >= 40)  return 'from-amber-400 to-yellow-500'
  return 'from-rose-400 to-red-500'
}

function getGlowColor(value: number): string {
  if (value >= 75) return 'shadow-green-500/40'
  if (value >= 40) return 'shadow-amber-500/40'
  return 'shadow-rose-500/40'
}

export default function ProgressBar({ value, animated = true }: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null)
  const clamped = Math.min(100, Math.max(0, value))

  useEffect(() => {
    if (!fillRef.current || !animated) return
    // Trigger animation
    fillRef.current.style.width = '0%'
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        if (fillRef.current) fillRef.current.style.width = `${clamped}%`
      }, 50)
    })
    return () => cancelAnimationFrame(raf)
  }, [clamped, animated])

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">Progress</span>
        <span className="text-xs font-bold text-slate-200">{clamped}%</span>
      </div>
      <div className="relative h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
        {/* Background shimmer track */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        {/* Animated fill */}
        <div
          ref={fillRef}
          className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${getColorClasses(clamped)} shadow-lg ${getGlowColor(clamped)} transition-[width] duration-700 ease-out`}
          style={{ width: animated ? '0%' : `${clamped}%` }}
        />
        {/* Shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none" />
      </div>
    </div>
  )
}
