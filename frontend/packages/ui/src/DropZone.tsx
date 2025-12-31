import {
  type DragEvent,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react"

interface DropZoneProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onDrop"> {
  onFileSelect: (file: File) => void
  accept?: string
  disabled?: boolean
  children?: ReactNode
}

export function DropZone({
  onFileSelect,
  accept = "video/*",
  disabled = false,
  children,
  className = "",
  ...props
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragging(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const files = e.dataTransfer.files
      if (files.length > 0 && files[0]) {
        onFileSelect(files[0])
      }
    },
    [disabled, onFileSelect],
  )

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0 && files[0]) {
        onFileSelect(files[0])
      }
      e.target.value = ""
    },
    [onFileSelect],
  )

  return (
    <button
      type='button'
      className={`
        relative w-full min-h-[200px] p-8
        rounded-xl
        border-2 border-dashed
        text-center cursor-pointer
        transition-all duration-300 ease-out
        group
        ${
          disabled
            ? "border-[var(--color-border-subtle)] bg-[var(--color-bg)]/50 cursor-not-allowed opacity-50"
            : isDragging
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 scale-[1.01]"
              : "border-[var(--color-border)] bg-[var(--color-bg-card)]/30 hover:border-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)]/50"
        }
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {/* Corner accents */}
      <div className='absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]/40 rounded-tl transition-colors group-hover:border-[var(--color-accent)]/70' />
      <div className='absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[var(--color-accent)]/40 rounded-tr transition-colors group-hover:border-[var(--color-accent)]/70' />
      <div className='absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[var(--color-accent)]/40 rounded-bl transition-colors group-hover:border-[var(--color-accent)]/70' />
      <div className='absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]/40 rounded-br transition-colors group-hover:border-[var(--color-accent)]/70' />

      <input
        ref={inputRef}
        type='file'
        accept={accept}
        onChange={handleInputChange}
        className='hidden'
        disabled={disabled}
      />
      {children}
    </button>
  )
}
