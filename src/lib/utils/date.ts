/**
 * Date utility functions for the bonesquad app
 */

// Korean day names
export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
export const DAY_NAMES_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse date string to Date object
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Get the start and end dates of the current week (Monday to Sunday)
 */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  // Adjust for Monday start (0 = Sunday, so we need to go back to Monday)
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const start = new Date(now)
  start.setDate(now.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Get array of dates for the current week (Monday to Sunday)
 */
export function getCurrentWeekDates(): Date[] {
  const { start } = getCurrentWeekRange()
  const dates: Date[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }

  return dates
}

/**
 * Get week dates for a specific date
 */
export function getWeekDatesForDate(date: Date): Date[] {
  const dayOfWeek = date.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const monday = new Date(date)
  monday.setDate(date.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }

  return dates
}

/**
 * Navigate weeks (positive = forward, negative = backward)
 */
export function navigateWeek(currentDate: Date, direction: number): Date {
  const newDate = new Date(currentDate)
  newDate.setDate(currentDate.getDate() + (direction * 7))
  return newDate
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate < today
}

/**
 * Format date to Korean display format (M/D 요일)
 */
export function formatDateKorean(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayName = DAY_NAMES[date.getDay()]
  return `${month}/${day} ${dayName}`
}

/**
 * Format date to full Korean display format
 */
export function formatDateKoreanFull(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayName = DAY_NAMES_FULL[date.getDay()]
  return `${year}년 ${month}월 ${day}일 ${dayName}`
}

/**
 * Get relative time string (e.g., "5분 전", "3시간 전")
 */
export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const target = typeof date === 'string' ? new Date(date) : date
  const diff = now.getTime() - target.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  // For older dates, show the actual date
  return formatDateKorean(target)
}

/**
 * Get month range header text
 */
export function getWeekRangeText(dates: Date[]): string {
  if (dates.length === 0) return ''

  const first = dates[0]
  const last = dates[dates.length - 1]

  if (first.getMonth() === last.getMonth()) {
    return `${first.getFullYear()}년 ${first.getMonth() + 1}월`
  }

  if (first.getFullYear() === last.getFullYear()) {
    return `${first.getFullYear()}년 ${first.getMonth() + 1}월 - ${last.getMonth() + 1}월`
  }

  return `${first.getFullYear()}년 ${first.getMonth() + 1}월 - ${last.getFullYear()}년 ${last.getMonth() + 1}월`
}
