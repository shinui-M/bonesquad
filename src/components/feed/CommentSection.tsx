'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import { getRelativeTime } from '@/lib/utils/date'
import type { CommentWithAuthor } from '@/lib/types/database'
import type { AvatarStyle } from '@/lib/utils/avatar'

interface CommentSectionProps {
  comments: CommentWithAuthor[]
  currentUserId?: string
  onAddComment: (content: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
}

export default function CommentSection({
  comments,
  currentUserId,
  onAddComment,
  onDeleteComment,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUserId) return

    setLoading(true)
    try {
      await onAddComment(newComment.trim())
      setNewComment('')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      await onDeleteComment(commentId)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      {/* Comment List */}
      {comments.map((comment) => {
        const profile = comment.profiles
        const isOwner = currentUserId === comment.user_id

        return (
          <div key={comment.id} className="flex gap-2">
            <Avatar
              src={profile.avatar_url}
              name={profile.name}
              style={profile.avatar_style as AvatarStyle}
              size="sm"
            />
            <div className="flex-1 bg-gray-100 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{profile.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {getRelativeTime(comment.created_at)}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
            </div>
          </div>
        )
      })}

      {/* Comment Form */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="flex-1 input-field text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || loading}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? '...' : '게시'}
          </button>
        </form>
      )}
    </div>
  )
}
