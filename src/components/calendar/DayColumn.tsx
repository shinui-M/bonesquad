'use client'

import { formatDateKorean, isToday, isPast } from '@/lib/utils/date'
import SubmitterCard from './SubmitterCard'
import type { WeeklyLogWithAuthor } from '@/lib/types/database'

interface DayColumnProps {
  date: Date
  logs: WeeklyLogWithAuthor[]
  onDayClick: () => void
  onViewLog: (log: WeeklyLogWithAuthor) => void
  currentUserId?: string
}

export default function DayColumn({
  date,
  logs,
  onDayClick,
  onViewLog,
  currentUserId,
}: DayColumnProps) {
  const today = isToday(date)
  const past = isPast(date)
  const dayOfWeek = date.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  return (
    <div
      className={`day-column bg-white border rounded-lg min-h-[300px] flex flex-col transition-shadow ${
        today ? 'border-primary border-2' : 'border-gray-200'
      }`}
    >
      {/* Day Header */}
      <div
        className={`p-2 text-center border-b cursor-pointer hover:bg-gray-50 ${
          today ? 'bg-red-50' : isWeekend ? 'bg-gray-50' : ''
        }`}
        onClick={onDayClick}
      >
        <div
          className={`text-sm font-medium ${
            today
              ? 'text-primary'
              : isWeekend
              ? dayOfWeek === 0
                ? 'text-red-500'
                : 'text-blue-500'
              : 'text-gray-700'
          }`}
        >
          {formatDateKorean(date)}
        </div>
        {today && (
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
            오늘
          </span>
        )}
      </div>

      {/* Submitters List */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-4">
            {past || today ? '아직 기록이 없습니다' : ''}
          </div>
        ) : (
          logs.map((log) => (
            <SubmitterCard
              key={log.id}
              log={log}
              onClick={() => onViewLog(log)}
              isCurrentUser={log.user_id === currentUserId}
            />
          ))
        )}
      </div>

      {/* Add Button (visible on hover for logged-in users) */}
      {currentUserId && (today || !past) && (
        <button
          onClick={onDayClick}
          className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 transition-colors text-sm border-t"
        >
          + 기록 추가
        </button>
      )}
    </div>
  )
}
