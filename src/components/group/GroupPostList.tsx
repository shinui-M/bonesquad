'use client'

import { useState } from 'react'
import { useGroupPosts } from '@/lib/hooks/useGroups'
import { useAuth } from '@/components/auth/AuthProvider'
import Avatar from '@/components/ui/Avatar'
import Loading from '@/components/ui/Loading'
import { getRelativeTime } from '@/lib/utils/date'
import type { AvatarStyle } from '@/lib/utils/avatar'

interface GroupPostListProps {
  groupId: string
  isMember: boolean
}

export default function GroupPostList({ groupId, isMember }: GroupPostListProps) {
  const { user } = useAuth()
  const { posts, loading, createPost, updatePost, deletePost } = useGroupPosts(groupId)
  const [newContent, setNewContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim() || !user) return

    setSubmitting(true)
    try {
      await createPost(user.id, newContent.trim())
      setNewContent('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (postId: string, content: string) => {
    setEditingId(postId)
    setEditContent(content)
  }

  const handleSaveEdit = async (postId: string) => {
    if (!editContent.trim()) return

    await updatePost(postId, editContent.trim())
    setEditingId(null)
    setEditContent('')
  }

  const handleDelete = async (postId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deletePost(postId)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loading />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">게시판</h3>

      {/* New Post Form */}
      {isMember && user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="오늘의 학습 내용을 공유해보세요..."
            className="flex-1 input-field"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!newContent.trim() || submitting}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? '...' : '게시'}
          </button>
        </form>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          아직 게시물이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const profile = post.profiles
            const isOwner = user?.id === post.user_id
            const isEditing = editingId === post.id

            return (
              <div key={post.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={profile.avatar_url}
                    name={profile.name}
                    style={profile.avatar_style as AvatarStyle}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">{profile.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {getRelativeTime(post.created_at)}
                        </span>
                      </div>
                      {isOwner && !isEditing && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(post.id, post.content)}
                            className="text-xs text-gray-500 hover:text-primary"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-xs text-gray-500 hover:text-red-500"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="flex-1 input-field text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-sm text-gray-500"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleSaveEdit(post.id)}
                          className="text-sm text-primary"
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-700 mt-1">{post.content}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
