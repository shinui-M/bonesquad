'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  const displayValue = hoverValue !== null ? hoverValue : value

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      // If clicking the same value, allow half-star toggle
      if (Math.ceil(value) === rating && value % 1 !== 0.5) {
        onChange(rating - 0.5)
      } else {
        onChange(rating)
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (readonly) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const isLeftHalf = x < rect.width / 2

    setHoverValue(isLeftHalf ? index + 0.5 : index + 1)
  }

  const renderStar = (index: number) => {
    const filled = displayValue >= index + 1
    const halfFilled = displayValue >= index + 0.5 && displayValue < index + 1

    return (
      <span
        key={index}
        className={`star ${sizeClasses[size]} ${!readonly ? 'cursor-pointer' : ''}`}
        onClick={() => handleClick(index + 1)}
        onMouseMove={(e) => handleMouseMove(e, index)}
        onMouseLeave={() => setHoverValue(null)}
      >
        {filled ? (
          <span className="text-yellow-400">★</span>
        ) : halfFilled ? (
          <span className="star half">★</span>
        ) : (
          <span className="text-gray-300">★</span>
        )}
      </span>
    )
  }

  return (
    <div className="star-rating inline-flex">
      {[0, 1, 2, 3, 4].map(renderStar)}
      {!readonly && (
        <span className="ml-2 text-sm text-gray-500">
          {displayValue.toFixed(1)}
        </span>
      )}
    </div>
  )
}
