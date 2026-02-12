'use client'

import { getAvatarUrl } from '@/lib/utils/avatar'
import type { AvatarStyle } from '@/lib/utils/avatar'

interface AvatarProps {
  src?: string | null
  name: string
  style?: AvatarStyle
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function Avatar({
  src,
  name,
  style = 'notionists',
  size = 'md',
  className = '',
}: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }

  const avatarUrl = getAvatarUrl(src ?? null, name, style)

  return (
    <div
      className={`rounded-full bg-gray-100 overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <img
        src={avatarUrl}
        alt={`${name}의 아바타`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  )
}
