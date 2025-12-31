import type { HTMLAttributes, ReactNode } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: "default" | "elevated" | "bordered"
}

export function Card({ children, variant = "default", className = "", ...props }: CardProps) {
  const baseStyles = "rounded-xl transition-all duration-200"

  const variantStyles = {
    default: "bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]",
    elevated: "bg-[var(--color-bg-elevated)] shadow-xl shadow-black/20",
    bordered: "bg-transparent border border-[var(--color-border)]",
  }

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardHeader({ children, className = "", ...props }: CardHeaderProps) {
  return (
    <div
      className={`px-5 py-4 border-b border-[var(--color-border-subtle)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

export function CardTitle({ children, className = "", ...props }: CardTitleProps) {
  return (
    <h3
      className={`text-base font-medium text-[var(--color-text-primary)] tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardContent({ children, className = "", ...props }: CardContentProps) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}
