'use client'

import { useState, useCallback } from 'react'
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
  // Track which tabs have been visited so we mount them lazily but keep them alive
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(['calendar']))

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
    setVisitedTabs(prev => {
      if (prev.has(tabId)) return prev
      return new Set([...prev, tabId])
    })
  }, [])

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
        onTabChange={handleTabChange}
      />

      {/* Main Content - tabs stay mounted once visited for instant switching */}
      <main className="flex-1">
        <Container>
          <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>
            <DailyAchievement />
          </div>
          {visitedTabs.has('feed') && (
            <div style={{ display: activeTab === 'feed' ? 'block' : 'none' }}>
              <FeedBoard />
            </div>
          )}
          {visitedTabs.has('groups') && (
            <div style={{ display: activeTab === 'groups' ? 'block' : 'none' }}>
              <GroupList />
            </div>
          )}
          {visitedTabs.has('members') && (
            <div style={{ display: activeTab === 'members' ? 'block' : 'none' }}>
              <MemberList />
            </div>
          )}
        </Container>
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
