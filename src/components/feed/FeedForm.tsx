'use client'

import { useState } from 'react'

interface FeedFormProps {
  onSubmit: (content: string) => Promise<void>
  onCancel: () => void
  initialContent?: string
}

export default function FeedForm({
  onSubmit,
  onCancel,
  initialContent = '',
}: FeedFormProps) {
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      await onSubmit(content.trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="무슨 생각을 하고 계신가요?"
        className="textarea-field h-28"
        autoFocus
        disabled={loading}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="btn-primary w-auto px-6"
        >
          {loading ? '게시 중...' : '게시'}
        </button>
      </div>
    </form>
  )
}
