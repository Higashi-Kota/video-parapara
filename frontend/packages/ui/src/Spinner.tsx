import type { HTMLAttributes } from "react"

interface SpinnerProps extends HTMLAttributes<HTMLOutputElement> {
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-8 h-8",
}

export function Spinner({ size = "md", className = "", ...props }: SpinnerProps) {
  return (
    <output className={`${sizeClasses[size]} block ${className}`} aria-label='Loading' {...props}>
      <svg
        aria-hidden='true'
        className='animate-spin'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <circle
          className='opacity-20'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          strokeWidth='3'
        />
        <path
          className='opacity-80'
          fill='currentColor'
          d='M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z'
        >
          <animate
            attributeName='opacity'
            values='0.8;0.4;0.8'
            dur='1.5s'
            repeatCount='indefinite'
          />
        </path>
      </svg>
    </output>
  )
}
