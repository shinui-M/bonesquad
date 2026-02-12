'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
  onSuccess?: () => void
}

type AuthMode = 'login' | 'signup'

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' })
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setMessage({ type: 'error', text: '비밀번호는 6자 이상이어야 합니다.' })
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({
          type: 'success',
          text: '회원가입 완료! 이메일 인증 후 로그인해주세요.',
        })
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        onSuccess?.()
        window.location.reload()
      }
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tab Switch */}
      <div className="flex mb-6 border-b">
        <button
          type="button"
          onClick={() => { setMode('login'); setMessage(null) }}
          className={`flex-1 py-2 text-center font-medium ${
            mode === 'login'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500'
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setMessage(null) }}
          className={`flex-1 py-2 text-center font-medium ${
            mode === 'signup'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500'
          }`}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="input-field"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="input-field"
            disabled={loading}
            minLength={6}
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-field"
              disabled={loading}
              minLength={6}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="btn-primary"
        >
          {loading
            ? '처리 중...'
            : mode === 'login'
            ? '로그인'
            : '회원가입'}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
