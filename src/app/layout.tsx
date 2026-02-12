import type { Metadata } from 'next'
import { AuthProvider } from '@/components/auth/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
  title: '뼈갈단 - 스터디 그룹',
  description: '뼈를 갈아서라도 성공하자! 함께 성장하는 스터디 그룹',
  keywords: ['스터디', '공부', '목표', '성장', '뼈갈단'],
  openGraph: {
    title: '뼈갈단 - 스터디 그룹',
    description: '뼈를 갈아서라도 성공하자! 함께 성장하는 스터디 그룹',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
