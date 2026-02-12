'use client'

import { useState } from 'react'
import { useGroups } from '@/lib/hooks/useGroups'
import { useAuth } from '@/components/auth/AuthProvider'
import GroupCard from './GroupCard'
import GroupDetail from './GroupDetail'
import Loading from '@/components/ui/Loading'
import Modal from '@/components/ui/Modal'
import type { Group } from '@/lib/types/database'

export default function GroupList() {
  const { groups, loading, createGroup, deleteGroup } = useGroups()
  const { user } = useAuth()
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '', emoji: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newGroup.name.trim()) return

    setCreating(true)
    setError(null)

    try {
      await createGroup(user.id, {
        name: newGroup.name.trim(),
        description: newGroup.description.trim() || undefined,
        emoji: newGroup.emoji.trim() || undefined,
      })
      setShowCreateModal(false)
      setNewGroup({ name: '', description: '', emoji: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : '그룹 생성 실패')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteGroup = async (group: Group) => {
    if (!confirm(`"${group.name}" 그룹을 삭제하시겠습니까?`)) return

    try {
      await deleteGroup(group.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : '그룹 삭제 실패')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loading text="그룹 로딩 중..." />
      </div>
    )
  }

  if (selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">스터디 그룹</h2>
          <p className="text-gray-500 mt-1">관심 있는 그룹에 참여해보세요</p>
        </div>
        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span>+</span>
            <span>그룹 만들기</span>
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          아직 그룹이 없습니다. 첫 번째 그룹을 만들어보세요!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => setSelectedGroup(group)}
              onDelete={user?.id === group.created_by ? () => handleDeleteGroup(group) : undefined}
            />
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setNewGroup({ name: '', description: '', emoji: '' })
          setError(null)
        }}
        title="새 그룹 만들기"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이모지 (선택)
            </label>
            <input
              type="text"
              value={newGroup.emoji}
              onChange={(e) => setNewGroup({ ...newGroup, emoji: e.target.value })}
              placeholder="📚"
              className="input-field"
              maxLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              그룹 이름 *
            </label>
            <input
              type="text"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              placeholder="스터디 그룹 이름"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명 (선택)
            </label>
            <textarea
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              placeholder="그룹에 대한 설명을 입력하세요"
              className="textarea-field"
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false)
                setNewGroup({ name: '', description: '', emoji: '' })
                setError(null)
              }}
              className="btn-secondary flex-1"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={creating || !newGroup.name.trim()}
              className="btn-primary flex-1"
            >
              {creating ? '생성 중...' : '만들기'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
