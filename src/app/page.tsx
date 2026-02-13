'use client'

import { useState } from 'react'
import TabNavigation from '@/components/layout/TabNavigation'
import Container from '@/components/layout/Container'
import UserMenu from '@/components/layout/UserMenu'
import DailyAchievement from '@/components/calendar/DailyAchievement'
import FeedBoard from '@/components/feed/FeedBoard'
import GroupList from '@/components/group/GroupList'
import MemberList from '@/components/member/MemberList'

const TABS = [
  { id: 'calendar', label: '오늘의 성과', icon: '📅' },
  { id: 'feed', label: '뼈이스북', icon: '💬' },
  { id: 'groups', label: '스터디 그룹', icon: '📚' },
  { id: 'members', label: '멤버', icon: '👥' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('calendar')

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <DailyAchievement />
      case 'feed':
        return <FeedBoard />
      case 'groups':
        return <GroupList />
      case 'members':
        return <MemberList />
      default:
        return <DailyAchievement />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Banner with User Menu */}
      <header className="relative">
        <img
          src="/banner.png"
          alt="뼈갈단 배너"
          className="w-full h-32 sm:h-40 md:h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="absolute top-0 right-0 p-4 z-10">
          <UserMenu />
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
