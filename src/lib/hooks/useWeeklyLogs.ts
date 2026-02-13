'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchWithTimeout } from '@/lib/supabase/fetchWithTimeout'
import type { WeeklyLogWithAuthor, WeeklyLogContent } from '@/lib/types/database'
import { formatDateString } from '@/lib/utils/date'

export function useWeeklyLogs(startDate: Date, endDate: Date) {
  const [logs, setLogs] = useState<WeeklyLogWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchWithTimeout(
        supabase
          .from('weekly_logs')
          .select(`
            *,
            profiles (*)
          `)
          .gte('date', formatDateString(startDate))
          .lte('date', formatDateString(endDate))
          .order('date', { ascending: true })
      )

      setLogs((data as WeeklyLogWithAuthor[]) ?? [])
    } catch (err) {
      console.error('[WeeklyLogs] Error:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('weekly_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_logs',
        },
        () => {
          fetchLogs()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLogs])

  const upsertLog = async (
    userId: string,
    date: Date,
    content: WeeklyLogContent,
    rating: number | null
  ) => {
    const { data, error } = await supabase
      .from('weekly_logs')
      .upsert({
        user_id: userId,
        date: formatDateString(date),
        content,
        rating,
      })
      .select()

    if (error) throw error

    await fetchLogs()
    return data
  }

  const deleteLog = async (logId: string) => {
    const { error } = await supabase
      .from('weekly_logs')
      .delete()
      .eq('id', logId)

    if (error) throw error

    await fetchLogs()
  }

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
    upsertLog,
    deleteLog,
  }
}

export function useWeeklyLogByDate(userId: string | null, date: Date) {
  const [log, setLog] = useState<WeeklyLogWithAuthor | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchLog = useCallback(async () => {
    if (!userId) {
      setLog(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('weekly_logs')
        .select(`
          *,
          profiles (*)
        `)
        .eq('user_id', userId)
        .eq('date', formatDateString(date))
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      setLog(data as WeeklyLogWithAuthor | null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId, date])

  useEffect(() => {
    fetchLog()
  }, [fetchLog])

  return { log, loading, error, refetch: fetchLog }
}
