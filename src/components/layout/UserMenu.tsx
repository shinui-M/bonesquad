'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import LoginForm from '@/components/auth/LoginForm'
import ProfileSetup from '@/components/auth/ProfileSetup'
import ImportModal from '@/components/import/ImportModal'
import type { AvatarStyle } from '@/lib/utils/avatar'

export default function UserMenu() {
  const { user, profile, loading, signOut } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-4 py-2 bg-white text-red-500 rounded-md font-medium hover:bg-red-50 transition-colors"
        >
          로그인
        </button>

        <Modal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="로그인"
        >
          <LoginForm onSuccess={() => setShowLoginModal(false)} />
        </Modal>
      </>
    )
  }

  // User is logged in but no profile name set
  if (!profile?.name || profile.name === user.email) {
    return (
      <>
        <button
          onClick={() => setShowProfileModal(true)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md font-medium hover:bg-yellow-600 transition-colors"
        >
          프로필 설정
        </button>

        <Modal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title="프로필 설정"
          size="lg"
        >
          <ProfileSetup onComplete={() => setShowProfileModal(false)} />
        </Modal>
      </>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Avatar
          src={profile.avatar_url}
          name={profile.name}
          style={profile.avatar_style as AvatarStyle}
          size="md"
        />
        <span className="hidden sm:block text-white font-medium">
          {profile.name}
        </span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            <div className="px-4 py-2 border-b">
              <p className="font-medium text-gray-800">{profile.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                setShowProfileModal(true)
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              프로필 수정
            </button>
            <button
              onClick={() => {
                setShowImportModal(true)
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              데이터 가져오기
            </button>
            <button
              onClick={() => {
                signOut()
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            >
              로그아웃
            </button>
          </div>
        </>
      )}

      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="프로필 수정"
        size="lg"
      >
        <ProfileSetup onComplete={() => setShowProfileModal(false)} />
      </Modal>

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  )
}
