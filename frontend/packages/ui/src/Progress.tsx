import type { HTMLAttributes } from "react"

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  variant?: "default" | "accent"
}

export function Progress({
  value,
  max = 100,
  showLabel = false,
  variant = "default",
  className = "",
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const barColors = {
    default: "bg-[var(--color-text-secondary)]",
    accent: "bg-gradient-to-r from-[var(--color-accent-muted)] to-[var(--color-accent)]",
  }

  return (
    <div className={`w-full ${className}`} {...props}>
      <div className='relative h-1.5 bg-[var(--color-bg-hover)] rounded-full overflow-hidden'>
        {/* Animated background shimmer */}
        <div
          className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent'
          style={{
            animation: percentage < 100 ? "shimmer 2s infinite" : "none",
            backgroundSize: "200% 100%",
          }}
        />
        {/* Progress bar */}
        <div
          className={`absolute h-full rounded-full transition-all duration-500 ease-out ${barColors[variant]}`}
          style={{ width: `${percentage}%` }}
        >
          {/* Glow effect at the end */}
          <div
            className='absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--color-accent)] blur-sm opacity-80'
            style={{ display: percentage > 5 && percentage < 100 ? "block" : "none" }}
          />
        </div>
      </div>
      {showLabel && (
        <div className='mt-2 flex justify-between items-center text-xs'>
          <span className='text-[var(--color-text-muted)] font-mono'>
            {Math.round(percentage)}%
          </span>
          {percentage < 100 && <span className='text-[var(--color-text-muted)]'>処理中...</span>}
        </div>
      )}
    </div>
  )
}
