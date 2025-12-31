import type { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium tracking-wide
    transition-all duration-200 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]
    disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
  `

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
  }

  const variantStyles = {
    primary: `
      bg-[var(--color-accent)] text-[var(--color-bg)]
      hover:bg-[var(--color-accent-hover)] hover:shadow-lg hover:shadow-[var(--color-accent)]/20
      active:scale-[0.98]
    `,
    secondary: `
      bg-[var(--color-bg-card)] text-[var(--color-text-primary)] border border-[var(--color-border)]
      hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-text-muted)]
      active:scale-[0.98]
    `,
    ghost: `
      bg-transparent text-[var(--color-text-secondary)]
      hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]
      active:scale-[0.98]
    `,
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
