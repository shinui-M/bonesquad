'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { FeedWithAuthor, CommentWithAuthor } from '@/lib/types/database'

export function useFeeds() {
  const [feeds, setFeeds] = useState<FeedWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchFeeds = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('feeds')
        .select(`
          *,
          profiles (*),
          comments (
            *,
            profiles (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Sort comments by created_at within each feed
      const feedsWithSortedComments = data.map((feed) => ({
        ...feed,
        comments: feed.comments?.sort(
          (a: CommentWithAuthor, b: CommentWithAuthor) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }))

      setFeeds(feedsWithSortedComments as FeedWithAuthor[])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeeds()
  }, [fetchFeeds])

  // Real-time subscriptions
  useEffect(() => {
    const feedsChannel = supabase
      .channel('feeds_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feeds' },
        () => fetchFeeds()
      )
      .subscribe()

    const commentsChannel = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => fetchFeeds()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(feedsChannel)
      supabase.removeChannel(commentsChannel)
    }
  }, [fetchFeeds])

  const uploadImage = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('feed-images')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('feed-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const createFeed = async (userId: string, content: string, imageFile?: File) => {
    let imageUrl: string | undefined

    if (imageFile) {
      imageUrl = await uploadImage(imageFile, userId)
    }

    const { data, error } = await supabase
      .from('feeds')
      .insert({
        user_id: userId,
        content,
        image_url: imageUrl,
      })
      .select()

    if (error) throw error

    await fetchFeeds()
    return data
  }

  const updateFeed = async (feedId: string, content: string) => {
    const { error } = await supabase
      .from('feeds')
      .update({ content })
      .eq('id', feedId)

    if (error) throw error

    await fetchFeeds()
  }

  const deleteFeed = async (feedId: string) => {
    const { error } = await supabase
      .from('feeds')
      .delete()
      .eq('id', feedId)

    if (error) throw error

    await fetchFeeds()
  }

  const addComment = async (feedId: string, userId: string, content: string) => {
    const { error } = await supabase
      .from('comments')
      .insert({
        feed_id: feedId,
        user_id: userId,
        content,
      })

    if (error) throw error

    await fetchFeeds()
  }

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error

    await fetchFeeds()
  }

  return {
    feeds,
    loading,
    error,
    refetch: fetchFeeds,
    createFeed,
    updateFeed,
    deleteFeed,
    addComment,
    deleteComment,
  }
}
