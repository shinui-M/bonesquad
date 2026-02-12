'use client'

import Avatar from '@/components/ui/Avatar'
import type { Profile } from '@/lib/types/database'
import type { AvatarStyle } from '@/lib/utils/avatar'

interface MemberCardProps {
  member: Profile
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
      <Avatar
        src={member.avatar_url}
        name={member.name}
        style={member.avatar_style as AvatarStyle}
        size="xl"
      />
      <h3 className="mt-3 font-semibold text-gray-800">{member.name}</h3>
      {member.bio && (
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{member.bio}</p>
      )}
    </div>
  )
}
