'use client'

import Avatar from '@/components/ui/Avatar'
import type { GroupMemberWithProfile } from '@/lib/types/database'
import type { AvatarStyle } from '@/lib/utils/avatar'

interface GroupMembersProps {
  members: GroupMemberWithProfile[]
}

export default function GroupMembers({ members }: GroupMembersProps) {
  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        아직 참여한 멤버가 없습니다.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold text-gray-800 mb-4">
        참여 멤버 ({members.length}명)
      </h3>
      <div className="flex flex-wrap gap-4">
        {members.map((member) => {
          const profile = member.profiles
          return (
            <div key={member.id} className="flex flex-col items-center">
              <Avatar
                src={profile.avatar_url}
                name={profile.name}
                style={profile.avatar_style as AvatarStyle}
                size="lg"
              />
              <span className="text-sm text-gray-600 mt-1">{profile.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
