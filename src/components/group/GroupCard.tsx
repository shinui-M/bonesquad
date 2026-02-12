'use client'

import type { Group } from '@/lib/types/database'

interface GroupCardProps {
  group: Group
  onClick: () => void
}

export default function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <div
      onClick={onClick}
      className="group-card flex items-center gap-4"
    >
      <span className="text-4xl">{group.emoji || '📚'}</span>
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-gray-800">{group.name}</h3>
        {group.description && (
          <p className="text-sm text-gray-500 mt-1">{group.description}</p>
        )}
      </div>
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  )
}
