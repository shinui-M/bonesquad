'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import CommentSection from './CommentSection'
import { getRelativeTime } from '@/lib/utils/date'
import type { FeedWithAuthor } from '@/lib/types/database'
import type { AvatarStyle } from '@/lib/utils/avatar'

interface FeedItemProps {
  feed: FeedWithAuthor
  currentUserId?: string
  onEdit: (feedId: string, content: string) => Promise<void>
  onDelete: (feedId: string) => Promise<void>
  onAddComment: (content: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
}

export default function FeedItem({
  feed,
  currentUserId,
  onEdit,
  onDelete,
  onAddComment,
  onDeleteComment,
}: FeedItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(feed.content)
  const [showMenu, setShowMenu] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const profile = feed.profiles
  const isOwner = currentUserId === feed.user_id
  const commentCount = feed.comments?.length || 0

  const handleSaveEdit = async () => {
    if (editContent.trim()) {
      await onEdit(feed.id, editContent.trim())
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await onDelete(feed.id)
    }
    setShowMenu(false)
  }

  return (
    <div className="feed-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={profile.avatar_url}
            name={profile.name}
            style={profile.avatar_style as AvatarStyle}
            size="md"
          />
          <div>
            <div className="font-medium text-gray-800">{profile.name}</div>
            <div className="text-xs text-gray-500">
              {getRelativeTime(feed.created_at)}
              {feed.updated_at !== feed.created_at && ' (수정됨)'}
            </div>
          </div>
        </div>

        {/* Menu */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg py-1 z-20">
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="textarea-field h-24"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setIsEditing(false)
                setEditContent(feed.content)
              }}
              className="btn-secondary text-sm"
            >
              취소
            </button>
            <button onClick={handleSaveEdit} className="btn-primary text-sm w-auto px-4">
              저장
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 whitespace-pre-wrap">{feed.content}</p>
      )}

      {/* Image */}
      {feed.image_url && (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img
            src={feed.image_url}
            alt="피드 이미지"
            className="w-full object-cover max-h-96"
          />
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-3 border-t flex items-center gap-4">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm">댓글 {commentCount > 0 ? commentCount : ''}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection
          comments={feed.comments || []}
          currentUserId={currentUserId}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      )}
    </div>
  )
}
