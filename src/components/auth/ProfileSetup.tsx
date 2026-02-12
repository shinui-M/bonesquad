'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { AVATAR_STYLES, AvatarStyle, generateAvatarUrl, getStyleDisplayName } from '@/lib/utils/avatar'

interface ProfileSetupProps {
  onComplete?: () => void
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user, profile, updateProfile } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(
    (profile?.avatar_style as AvatarStyle) || 'notionists'
  )
  const [avatarSeed, setAvatarSeed] = useState(profile?.name || 'seed')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewAvatarUrl = generateAvatarUrl(avatarSeed || 'preview', avatarStyle)

  const handleRandomSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10)
    setAvatarSeed(randomSeed)
  }

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
      avatar_url: generateAvatarUrl(avatarSeed, avatarStyle),
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
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleRandomSeed}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              🎲 랜덤 변경
            </button>
          </div>
        </div>

        {/* Avatar Seed Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            아바타 시드 (변형)
          </label>
          <input
            type="text"
            value={avatarSeed}
            onChange={(e) => setAvatarSeed(e.target.value)}
            placeholder="원하는 단어 입력"
            className="input-field"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            같은 화풍에서 다른 모습을 원하면 다른 단어를 입력하세요
          </p>
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
            아바타 화풍
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
                  src={generateAvatarUrl(avatarSeed || 'sample', style, 48)}
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
