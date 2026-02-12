'use client'

import Avatar from '@/components/ui/Avatar'
import StarRating from '@/components/ui/StarRating'
import type { WeeklyLogWithAuthor } from '@/lib/types/database'
import type { AvatarStyle } from '@/lib/utils/avatar'

interface SubmitterCardProps {
  log: WeeklyLogWithAuthor
  onClick: () => void
  isCurrentUser?: boolean
}

export default function SubmitterCard({
  log,
  onClick,
  isCurrentUser,
}: SubmitterCardProps) {
  const profile = log.profiles

  return (
    <div
      onClick={onClick}
      className={`submitter-card ${isCurrentUser ? 'border-primary bg-red-50' : ''}`}
    >
      <Avatar
        src={profile.avatar_url}
        name={profile.name}
        style={profile.avatar_style as AvatarStyle}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-medium text-sm truncate">{profile.name}</span>
          {isCurrentUser && (
            <span className="text-xs text-primary">(나)</span>
          )}
        </div>
        {log.rating !== null && (
          <StarRating value={log.rating} readonly size="sm" />
        )}
      </div>
    </div>
  )
}
