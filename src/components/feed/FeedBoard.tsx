'use client'

import { useState } from 'react'
import { useFeeds } from '@/lib/hooks/useFeeds'
import { useAuth } from '@/components/auth/AuthProvider'
import FeedItem from './FeedItem'
import FeedForm from './FeedForm'
import Loading from '@/components/ui/Loading'

export default function FeedBoard() {
  const { user, profile } = useAuth()
  const { feeds, loading, createFeed, updateFeed, deleteFeed, addComment, deleteComment } = useFeeds()
  const [showForm, setShowForm] = useState(false)

  const handleCreateFeed = async (content: string, imageFile?: File) => {
    if (!user) return
    await createFeed(user.id, content, imageFile)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loading text="피드 로딩 중..." />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Feed Form */}
      {user && profile && (
        <div className="bg-white rounded-lg shadow-md p-4">
          {showForm ? (
            <FeedForm
              onSubmit={handleCreateFeed}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 text-left text-gray-500 hover:bg-gray-50 rounded-md px-4 transition-colors"
            >
              무슨 생각을 하고 계신가요, {profile.name}님?
            </button>
          )}
        </div>
      )}

      {/* Feeds List */}
      {feeds.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">📭</p>
          <p>아직 피드가 없습니다.</p>
          <p className="text-sm">첫 번째 글을 작성해보세요!</p>
        </div>
      ) : (
        feeds.map((feed) => (
          <FeedItem
            key={feed.id}
            feed={feed}
            currentUserId={user?.id}
            onEdit={updateFeed}
            onDelete={deleteFeed}
            onAddComment={(content) => addComment(feed.id, user!.id, content)}
            onDeleteComment={deleteComment}
          />
        ))
      )}
    </div>
  )
}
