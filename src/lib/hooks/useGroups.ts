'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  Group,
  GroupMemberWithProfile,
  GroupPostWithAuthor,
  DietLogWithAuthor,
} from '@/lib/types/database'
import { formatDateString } from '@/lib/utils/date'

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('groups')
        .select('*')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      setGroups(data as Group[])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  return { groups, loading, error, refetch: fetchGroups }
}

export function useGroupMembers(groupId: string | null) {
  const [members, setMembers] = useState<GroupMemberWithProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchMembers = useCallback(async () => {
    if (!groupId) {
      setMembers([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('group_members')
        .select(`
          *,
          profiles (*)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true })

      if (fetchError) throw fetchError

      setMembers(data as GroupMemberWithProfile[])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Real-time subscription
  useEffect(() => {
    if (!groupId) return

    const channel = supabase
      .channel(`group_members_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
          filter: `group_id=eq.${groupId}`,
        },
        () => fetchMembers()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, fetchMembers])

  const joinGroup = async (userId: string) => {
    if (!groupId) throw new Error('Group ID is required')

    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: userId })

    if (error) throw error

    await fetchMembers()
  }

  const leaveGroup = async (userId: string) => {
    if (!groupId) throw new Error('Group ID is required')

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (error) throw error

    await fetchMembers()
  }

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
    joinGroup,
    leaveGroup,
  }
}

export function useGroupPosts(groupId: string | null) {
  const [posts, setPosts] = useState<GroupPostWithAuthor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchPosts = useCallback(async () => {
    if (!groupId) {
      setPosts([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('group_posts')
        .select(`
          *,
          profiles (*)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setPosts(data as GroupPostWithAuthor[])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Real-time subscription
  useEffect(() => {
    if (!groupId) return

    const channel = supabase
      .channel(`group_posts_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_posts',
          filter: `group_id=eq.${groupId}`,
        },
        () => fetchPosts()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, fetchPosts])

  const createPost = async (userId: string, content: string) => {
    if (!groupId) throw new Error('Group ID is required')

    const { error } = await supabase
      .from('group_posts')
      .insert({ group_id: groupId, user_id: userId, content })

    if (error) throw error

    await fetchPosts()
  }

  const updatePost = async (postId: string, content: string) => {
    const { error } = await supabase
      .from('group_posts')
      .update({ content })
      .eq('id', postId)

    if (error) throw error

    await fetchPosts()
  }

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('group_posts')
      .delete()
      .eq('id', postId)

    if (error) throw error

    await fetchPosts()
  }

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    deletePost,
  }
}

export function useDietLogs(date: Date) {
  const [logs, setLogs] = useState<DietLogWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('diet_logs')
        .select(`
          *,
          profiles (*)
        `)
        .eq('date', formatDateString(date))
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setLogs(data as DietLogWithAuthor[])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('diet_logs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'diet_logs' },
        () => fetchLogs()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLogs])

  const upsertLog = async (
    userId: string,
    logData: {
      breakfast?: string
      lunch?: string
      dinner?: string
      snack?: string
      exercise?: string
    }
  ) => {
    const { error } = await supabase
      .from('diet_logs')
      .upsert({
        user_id: userId,
        date: formatDateString(date),
        ...logData,
      })

    if (error) throw error

    await fetchLogs()
  }

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
    upsertLog,
  }
}
