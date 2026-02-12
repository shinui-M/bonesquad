'use client'

import { useState } from 'react'
import { useDietLogs } from '@/lib/hooks/useGroups'
import { useAuth } from '@/components/auth/AuthProvider'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import Loading from '@/components/ui/Loading'
import { formatDateKoreanFull, formatDateString } from '@/lib/utils/date'
import type { AvatarStyle } from '@/lib/utils/avatar'

interface DietLogListProps {
  groupId: string
  isMember: boolean
}

export default function DietLogList({ groupId, isMember }: DietLogListProps) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { logs, loading, upsertLog } = useDietLogs(selectedDate)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    breakfast: '',
    lunch: '',
    dinner: '',
    snack: '',
    exercise: '',
  })

  const userLog = logs.find((log) => log.user_id === user?.id)

  const handleOpenModal = () => {
    if (userLog) {
      setFormData({
        breakfast: userLog.breakfast || '',
        lunch: userLog.lunch || '',
        dinner: userLog.dinner || '',
        snack: userLog.snack || '',
        exercise: userLog.exercise || '',
      })
    } else {
      setFormData({
        breakfast: '',
        lunch: '',
        dinner: '',
        snack: '',
        exercise: '',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!user) return
    await upsertLog(user.id, formData)
    setShowModal(false)
  }

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
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
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => handleDateChange(-1)}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h3 className="font-semibold text-gray-800">식단 기록</h3>
          <p className="text-sm text-gray-500">{formatDateKoreanFull(selectedDate)}</p>
        </div>
        <button
          onClick={() => handleDateChange(1)}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Add/Edit Button */}
      {isMember && user && (
        <button
          onClick={handleOpenModal}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary hover:text-primary transition-colors"
        >
          {userLog ? '내 기록 수정' : '+ 오늘 기록 추가'}
        </button>
      )}

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          이 날의 기록이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const profile = log.profiles
            return (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                  <Avatar
                    src={profile.avatar_url}
                    name={profile.name}
                    style={profile.avatar_style as AvatarStyle}
                    size="md"
                  />
                  <span className="font-medium">{profile.name}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {log.breakfast && (
                    <div>
                      <span className="text-gray-500">🌅 아침</span>
                      <p className="text-gray-800">{log.breakfast}</p>
                    </div>
                  )}
                  {log.lunch && (
                    <div>
                      <span className="text-gray-500">☀️ 점심</span>
                      <p className="text-gray-800">{log.lunch}</p>
                    </div>
                  )}
                  {log.dinner && (
                    <div>
                      <span className="text-gray-500">🌙 저녁</span>
                      <p className="text-gray-800">{log.dinner}</p>
                    </div>
                  )}
                  {log.snack && (
                    <div>
                      <span className="text-gray-500">🍪 간식</span>
                      <p className="text-gray-800">{log.snack}</p>
                    </div>
                  )}
                  {log.exercise && (
                    <div>
                      <span className="text-gray-500">💪 운동</span>
                      <p className="text-gray-800">{log.exercise}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Diet Log Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="식단 기록"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🌅 아침
            </label>
            <input
              type="text"
              value={formData.breakfast}
              onChange={(e) => setFormData({ ...formData, breakfast: e.target.value })}
              placeholder="아침 식사"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ☀️ 점심
            </label>
            <input
              type="text"
              value={formData.lunch}
              onChange={(e) => setFormData({ ...formData, lunch: e.target.value })}
              placeholder="점심 식사"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🌙 저녁
            </label>
            <input
              type="text"
              value={formData.dinner}
              onChange={(e) => setFormData({ ...formData, dinner: e.target.value })}
              placeholder="저녁 식사"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🍪 간식
            </label>
            <input
              type="text"
              value={formData.snack}
              onChange={(e) => setFormData({ ...formData, snack: e.target.value })}
              placeholder="간식"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💪 운동
            </label>
            <input
              type="text"
              value={formData.exercise}
              onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
              placeholder="운동 내용"
              className="input-field"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="btn-secondary flex-1"
            >
              취소
            </button>
            <button onClick={handleSave} className="btn-primary flex-1">
              저장
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
