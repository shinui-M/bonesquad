'use client'

import { useState, useMemo } from 'react'
import { useWeeklyLogs } from '@/lib/hooks/useWeeklyLogs'
import { useAuth } from '@/components/auth/AuthProvider'
import DayColumn from './DayColumn'
import TaskModal from './TaskModal'
import Loading from '@/components/ui/Loading'
import {
  getCurrentWeekDates,
  getWeekDatesForDate,
  navigateWeek,
  getWeekRangeText,
  formatDateString,
} from '@/lib/utils/date'
import type { WeeklyLogWithAuthor } from '@/lib/types/database'

export default function WeeklyCalendar() {
  const { user, profile } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedLog, setSelectedLog] = useState<{
    date: Date
    log?: WeeklyLogWithAuthor
  } | null>(null)

  const weekDates = useMemo(() => getWeekDatesForDate(currentDate), [currentDate])
  const startDate = weekDates[0]
  const endDate = weekDates[6]

  const { logs, loading, upsertLog } = useWeeklyLogs(startDate, endDate)

  // Group logs by date
  const logsByDate = useMemo(() => {
    const map: Record<string, WeeklyLogWithAuthor[]> = {}
    logs.forEach((log) => {
      const key = log.date
      if (!map[key]) map[key] = []
      map[key].push(log)
    })
    return map
  }, [logs])

  const handlePrevWeek = () => {
    setCurrentDate(navigateWeek(currentDate, -1))
  }

  const handleNextWeek = () => {
    setCurrentDate(navigateWeek(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date: Date) => {
    if (!user || !profile) return

    const dateStr = formatDateString(date)
    const existingLog = logs.find(
      (log) => log.date === dateStr && log.user_id === user.id
    )

    setSelectedLog({ date, log: existingLog })
  }

  const handleViewLog = (log: WeeklyLogWithAuthor, date: Date) => {
    setSelectedLog({ date, log })
  }

  const handleCloseModal = () => {
    setSelectedLog(null)
  }

  const handleSaveLog = async (content: { items: { category: string; content: string }[] }, rating: number | null) => {
    if (!user || !selectedLog) return

    await upsertLog(user.id, selectedLog.date, content, rating)
    setSelectedLog(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loading text="주간 기록 로딩 중..." />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
        <button
          onClick={handlePrevWeek}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="이전 주"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {getWeekRangeText(weekDates)}
          </h2>
          <button
            onClick={handleToday}
            className="text-sm text-primary hover:underline"
          >
            오늘로 이동
          </button>
        </div>

        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="다음 주"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => (
          <DayColumn
            key={formatDateString(date)}
            date={date}
            logs={logsByDate[formatDateString(date)] || []}
            onDayClick={() => handleDayClick(date)}
            onViewLog={(log) => handleViewLog(log, date)}
            currentUserId={user?.id}
          />
        ))}
      </div>

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
