'use client'

import { useState } from 'react'
import { useGroups } from '@/lib/hooks/useGroups'
import GroupCard from './GroupCard'
import GroupDetail from './GroupDetail'
import Loading from '@/components/ui/Loading'
import type { Group } from '@/lib/types/database'

export default function GroupList() {
  const { groups, loading } = useGroups()
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loading text="그룹 로딩 중..." />
      </div>
    )
  }

  if (selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">스터디 그룹</h2>
        <p className="text-gray-500 mt-1">관심 있는 그룹에 참여해보세요</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onClick={() => setSelectedGroup(group)}
          />
        ))}
      </div>
    </div>
  )
}
