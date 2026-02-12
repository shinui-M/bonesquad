'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { AVATAR_STYLES, AvatarStyle, generateAvatarUrl, getStyleDisplayName } from '@/lib/utils/avatar'

interface ProfileSetupProps {
  onComplete?: () => void
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('notionists')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewAvatarUrl = generateAvatarUrl(name || 'preview', avatarStyle)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: updateError } = await updateProfile({
      name: name.trim(),
      bio: bio.trim() || null,
      avatar_style: avatarStyle,
      avatar_url: generateAvatarUrl(name.trim(), avatarStyle),
    })

    if (updateError) {
      setError(updateError.message)
    } else {
      onComplete?.()
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        프로필 설정
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Preview */}
        <div className="flex flex-col items-center">
          <img
            src={previewAvatarUrl}
            alt="Avatar preview"
            className="w-24 h-24 rounded-full bg-gray-100 mb-2"
          />
          <p className="text-sm text-gray-500">아바타 미리보기</p>
        </div>

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            이름 (닉네임) *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="뼈갈단원"
            required
            className="input-field"
            disabled={loading}
            maxLength={20}
          />
        </div>

        {/* Bio Input */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            자기소개
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="간단한 자기소개를 적어주세요"
            className="textarea-field h-20"
            disabled={loading}
            maxLength={200}
          />
        </div>

        {/* Avatar Style Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            아바타 스타일
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
            {AVATAR_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setAvatarStyle(style)}
                className={`p-2 rounded-md flex flex-col items-center transition-all ${
                  avatarStyle === style
                    ? 'bg-red-100 border-2 border-red-500'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <img
                  src={generateAvatarUrl(name || 'sample', style, 48)}
                  alt={style}
                  className="w-12 h-12 mb-1"
                />
                <span className="text-xs text-gray-600 truncate w-full text-center">
                  {getStyleDisplayName(style).split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary"
        >
          {loading ? '저장 중...' : '프로필 저장'}
        </button>
      </form>
    </div>
  )
}
