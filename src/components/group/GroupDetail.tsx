'use client'

import { useGroupMembers } from '@/lib/hooks/useGroups'
import { useAuth } from '@/components/auth/AuthProvider'
import GroupMembers from './GroupMembers'
import GroupPostList from './GroupPostList'
import DietLogList from './DietLogList'
import Loading from '@/components/ui/Loading'
import type { Group } from '@/lib/types/database'

interface GroupDetailProps {
  group: Group
  onBack: () => void
}

export default function GroupDetail({ group, onBack }: GroupDetailProps) {
  const { user } = useAuth()
  const { members, loading, joinGroup, leaveGroup } = useGroupMembers(group.id)

  const isMember = members.some((m) => m.user_id === user?.id)
  const isDietGroup = group.name === '다이어트'

  const handleJoinLeave = async () => {
    if (!user) return

    if (isMember) {
      await leaveGroup(user.id)
    } else {
      await joinGroup(user.id)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loading text="그룹 정보 로딩 중..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로
          </button>

          {user && (
            <button
              onClick={handleJoinLeave}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isMember
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {isMember ? '탈퇴하기' : '참여하기'}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <span className="text-5xl">{group.emoji || '📚'}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
            {group.description && (
              <p className="text-gray-500 mt-1">{group.description}</p>
            )}
            <p className="text-sm text-gray-400 mt-2">
              멤버 {members.length}명
            </p>
          </div>
        </div>
      </div>

      {/* Members */}
      <GroupMembers members={members} />

      {/* Content based on group type */}
      {isDietGroup ? (
        <DietLogList groupId={group.id} isMember={isMember} />
      ) : (
        <GroupPostList groupId={group.id} isMember={isMember} />
      )}
    </div>
  )
}
