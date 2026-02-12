'use client'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function Loading({ size = 'md', text }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`spinner ${sizeClasses[size]}`}
        role="status"
        aria-label="로딩 중"
      />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  )
}
