'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import StarRating from '@/components/ui/StarRating'
import Avatar from '@/components/ui/Avatar'
import { formatDateKoreanFull } from '@/lib/utils/date'
import type { WeeklyLogWithAuthor, WeeklyLogItem } from '@/lib/types/database'
import type { AvatarStyle } from '@/lib/utils/avatar'

const CATEGORIES = [
  { value: 'study', label: '공부', emoji: '📚' },
  { value: 'exercise', label: '운동', emoji: '💪' },
  { value: 'work', label: '업무', emoji: '💼' },
  { value: 'hobby', label: '취미', emoji: '🎨' },
  { value: 'etc', label: '기타', emoji: '📝' },
]

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  existingLog?: WeeklyLogWithAuthor
  onSave: (
    content: { items: WeeklyLogItem[] },
    rating: number | null
  ) => Promise<void>
  isOwnLog: boolean
}

export default function TaskModal({
  isOpen,
  onClose,
  date,
  existingLog,
  onSave,
  isOwnLog,
}: TaskModalProps) {
  const [items, setItems] = useState<WeeklyLogItem[]>([
    { category: 'study', content: '' },
  ])
  const [rating, setRating] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existingLog) {
      const content = existingLog.content as { items: WeeklyLogItem[] }
      setItems(content.items.length > 0 ? content.items : [{ category: 'study', content: '' }])
      setRating(existingLog.rating || 0)
    } else {
      setItems([{ category: 'study', content: '' }])
      setRating(0)
    }
  }, [existingLog])

  const handleAddItem = () => {
    setItems([...items, { category: 'study', content: '' }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (
    index: number,
    field: keyof WeeklyLogItem,
    value: string
  ) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const validItems = items.filter((item) => item.content.trim())
      await onSave({ items: validItems }, rating || null)
    } finally {
      setSaving(false)
    }
  }

  const getCategoryInfo = (value: string) => {
    return CATEGORIES.find((c) => c.value === value) || CATEGORIES[4]
  }

  // Read-only view for other users' logs
  if (existingLog && !isOwnLog) {
    const profile = existingLog.profiles
    const content = existingLog.content as { items: WeeklyLogItem[] }

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={formatDateKoreanFull(date)}
        size="lg"
      >
        <div className="space-y-4">
          {/* Author Info */}
          <div className="flex items-center gap-3 pb-4 border-b">
            <Avatar
              src={profile.avatar_url}
              name={profile.name}
              style={profile.avatar_style as AvatarStyle}
              size="lg"
            />
            <div>
              <div className="font-semibold text-lg">{profile.name}</div>
              {existingLog.rating !== null && (
                <StarRating value={existingLog.rating} readonly />
              )}
            </div>
          </div>

          {/* Content Items */}
          <div className="space-y-3">
            {content.items.map((item, index) => {
              const category = getCategoryInfo(item.category)
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{category.emoji}</span>
                    <span className="font-medium text-sm text-gray-600">
                      {category.label}
                    </span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    )
  }

  // Edit view
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${formatDateKoreanFull(date)} - 기록 ${existingLog ? '수정' : '작성'}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            오늘의 만족도
          </label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        {/* Items */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            오늘 한 일
          </label>

          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={item.category}
                onChange={(e) =>
                  handleItemChange(index, 'category', e.target.value)
                }
                className="w-28 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={item.content}
                onChange={(e) =>
                  handleItemChange(index, 'content', e.target.value)
                }
                placeholder="무엇을 했나요?"
                className="flex-1 input-field"
              />

              {items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="px-3 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleAddItem}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary hover:text-primary transition-colors"
          >
            + 항목 추가
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <button onClick={onClose} className="btn-secondary flex-1">
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || items.every((i) => !i.content.trim())}
            className="btn-primary flex-1"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
