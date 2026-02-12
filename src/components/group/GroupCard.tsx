'use client'

import type { Group } from '@/lib/types/database'

interface GroupCardProps {
  group: Group
  onClick: () => void
  onDelete?: () => void
}

export default function GroupCard({ group, onClick, onDelete }: GroupCardProps) {
  return (
    <div className="group-card flex items-center gap-4 relative">
      <div
        onClick={onClick}
        className="flex items-center gap-4 flex-1 cursor-pointer"
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

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="그룹 삭제"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
