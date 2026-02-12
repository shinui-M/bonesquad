'use client'

import { useState } from 'react'
import TabNavigation from '@/components/layout/TabNavigation'
import Container from '@/components/layout/Container'
import UserMenu from '@/components/layout/UserMenu'
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar'
import FeedBoard from '@/components/feed/FeedBoard'
import GroupList from '@/components/group/GroupList'
import MemberList from '@/components/member/MemberList'
import { useAuth } from '@/components/auth/AuthProvider'
import Loading from '@/components/ui/Loading'

const TABS = [
  { id: 'calendar', label: '주간 캘린더', icon: '📅' },
  { id: 'feed', label: '뼈이스북', icon: '💬' },
  { id: 'groups', label: '스터디 그룹', icon: '📚' },
  { id: 'members', label: '멤버', icon: '👥' },
]

export default function Home() {
  const { loading } = useAuth()
  const [activeTab, setActiveTab] = useState('calendar')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="로딩 중..." />
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <WeeklyCalendar />
      case 'feed':
        return <FeedBoard />
      case 'groups':
        return <GroupList />
      case 'members':
        return <MemberList />
      default:
        return <WeeklyCalendar />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Banner with User Menu */}
      <header
        className="text-white relative"
        style={{
          backgroundImage: 'url(/banner.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl drop-shadow-lg">💀</span>
              <div>
                <h1 className="text-3xl font-bold drop-shadow-lg">뼈갈단</h1>
                <p className="text-white/90 text-sm hidden sm:block drop-shadow">
                  함께 성장하는 스터디 그룹
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-white/90">
                <span>🔥</span>
                <span className="text-sm drop-shadow">뼈를 갈아서라도 성공하자!</span>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Container>{renderContent()}</Container>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>© 2026 뼈갈단. 뼈를 갈아서라도 성공하자! 💀🔥</p>
        </div>
      </footer>
    </div>
  )
}
