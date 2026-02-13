'use client'

import { useState, useMemo, useRef } from 'react'
import { useWeeklyLogs } from '@/lib/hooks/useWeeklyLogs'
import { useMembers } from '@/lib/hooks/useMembers'
import { useAuth } from '@/components/auth/AuthProvider'
import Avatar from '@/components/ui/Avatar'
import StarRating from '@/components/ui/StarRating'
import TaskModal from './TaskModal'
import Loading from '@/components/ui/Loading'
import {
  formatDateString,
  formatDateKoreanFull,
  parseDateString,
} from '@/lib/utils/date'
import type { WeeklyLogWithAuthor } from '@/lib/types/database'
import type { AvatarStyle } from '@/lib/utils/avatar'

export default function DailyAchievement() {
  const { user, profile } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedLog, setSelectedLog] = useState<{
    date: Date
    log?: WeeklyLogWithAuthor
  } | null>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const { members, loading: membersLoading } = useMembers()
  const { logs, loading: logsLoading, upsertLog } = useWeeklyLogs(selectedDate, selectedDate)

  const loading = membersLoading || logsLoading

  // Map user_id -> log for the selected date
  const logsByUserId = useMemo(() => {
    const map: Record<string, WeeklyLogWithAuthor> = {}
    logs.forEach((log) => {
      map[log.user_id] = log
    })
    return map
  }, [logs])

  const todayStr = formatDateString(new Date())
  const selectedStr = formatDateString(selectedDate)
  const isToday = todayStr === selectedStr

  // Members who submitted logs come first
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const aHasLog = !!logsByUserId[a.id]
      const bHasLog = !!logsByUserId[b.id]
      if (aHasLog && !bHasLog) return -1
      if (!aHasLog && bHasLog) return 1
      return 0
    })
  }, [members, logsByUserId])

  const handleMemberClick = (memberId: string) => {
    const log = logsByUserId[memberId]

    if (log) {
      // Has a log - view it (read-only if not own)
      setSelectedLog({ date: selectedDate, log })
    } else if (memberId === user?.id) {
      // Own profile without log - open write modal
      setSelectedLog({ date: selectedDate })
    }
    // Other members without logs - do nothing
  }

  const handleWriteClick = () => {
    if (!user) return
    const existingLog = logsByUserId[user.id]
    setSelectedLog({ date: selectedDate, log: existingLog })
  }

  const handleCloseModal = () => {
    setSelectedLog(null)
  }

  const handleSaveLog = async (
    content: { items: { category: string; content: string }[] },
    rating: number | null
  ) => {
    if (!user || !selectedLog) return
    await upsertLog(user.id, selectedLog.date, content, rating)
    setSelectedLog(null)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(parseDateString(e.target.value))
    }
  }

  const handleCalendarClick = () => {
    dateInputRef.current?.showPicker()
  }

  const handleGoToToday = () => {
    setSelectedDate(new Date())
  }

  const submittedCount = logs.length
  const totalCount = members.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {formatDateKoreanFull(selectedDate)}
            </h2>
            {!isToday && (
              <button
                onClick={handleGoToToday}
                className="text-sm text-primary hover:underline"
              >
                오늘로 돌아가기
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={handleCalendarClick}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-xl"
                title="날짜 선택"
              >
                📅
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedStr}
                onChange={handleDateChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                tabIndex={-1}
              />
            </div>
            {user && (
              <button onClick={handleWriteClick} className="btn-primary text-sm">
                성과 작성
              </button>
            )}
          </div>
        </div>

        {/* Submission count */}
        {!loading && (
          <div className="mt-2 text-sm text-gray-500">
            {totalCount}명 중 {submittedCount}명 작성 완료
          </div>
        )}
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loading text="성과 로딩 중..." />
        </div>
      ) : (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {sortedMembers.map((member) => {
              const log = logsByUserId[member.id]
              const hasLog = !!log
              const isOwn = member.id === user?.id
              const isClickable = hasLog || (isOwn && !hasLog)

              return (
                <button
                  key={member.id}
                  onClick={() => handleMemberClick(member.id)}
                  disabled={!isClickable}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    isClickable
                      ? 'hover:bg-gray-50 cursor-pointer'
                      : 'cursor-default'
                  } ${!hasLog ? 'opacity-40 grayscale' : ''}`}
                >
                  <div
                    className={`rounded-full ${
                      hasLog
                        ? 'ring-2 ring-primary ring-offset-1'
                        : ''
                    }`}
                  >
                    <Avatar
                      src={member.avatar_url}
                      name={member.name}
                      style={member.avatar_style as AvatarStyle}
                      size="lg"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 truncate w-full text-center">
                    {member.name}
                  </span>
                  {hasLog && log.rating !== null && (
                    <StarRating value={log.rating} readonly size="sm" />
                  )}
                </button>
              )
            })}
          </div>

          {members.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              멤버가 없습니다
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      {selectedLog && (
        <TaskModal
          isOpen={true}
          onClose={handleCloseModal}
          date={selectedLog.date}
          existingLog={selectedLog.log}
          onSave={handleSaveLog}
          isOwnLog={selectedLog.log?.user_id === user?.id || !selectedLog.log}
        />
      )}
    </div>
  )
}
