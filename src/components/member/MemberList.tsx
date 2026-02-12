'use client'

import { useMembers } from '@/lib/hooks/useMembers'
import MemberCard from './MemberCard'
import Loading from '@/components/ui/Loading'

export default function MemberList() {
  const { members, loading } = useMembers()

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loading text="멤버 로딩 중..." />
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-4xl mb-4">👥</p>
        <p>아직 멤버가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  )
}
