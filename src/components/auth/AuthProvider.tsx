'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'

interface ProfileUpdateData {
  name?: string
  bio?: string | null
  avatar_url?: string | null
  avatar_style?: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: ProfileUpdateData) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data as Profile
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  useEffect(() => {
    // Get initial session with timeout
    const initializeAuth = async () => {
      try {
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => {
            console.warn('[Auth] Session fetch timed out after 3s')
            resolve(null)
          }, 3000)
        )

        const sessionPromise = supabase.auth.getSession().then(({ data, error: sessionError }) => {
          if (sessionError) {
            console.error('[Auth] Session error:', sessionError)
            return null
          }
          return data.session
        })

        const initialSession = await Promise.race([sessionPromise, timeoutPromise])

        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        // Set loading false immediately so tabs can start fetching data
        // Profile fetch continues in background
        setLoading(false)

        if (initialSession?.user) {
          const profileData = await fetchProfile(initialSession.user.id)
          setProfile(profileData)
        }
      } catch (err) {
        console.error('[Auth] Init error:', err)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          const profileData = await fetchProfile(currentSession.user.id)
          setProfile(profileData)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with magic link
  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    return { error: error as Error | null }
  }

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  // Update profile
  const updateProfile = async (updates: ProfileUpdateData) => {
    if (!user) {
      return { error: new Error('Not authenticated') }
    }

    try {
      const timeoutPromise = new Promise<{ error: Error }>((resolve) =>
        setTimeout(() => resolve({ error: new Error('프로필 업데이트 시간 초과 - Supabase 연결을 확인해주세요') }), 15000)
      )

      const updatePromise = supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .then(({ error: updateError }) => ({ error: updateError as Error | null }))

      const result = await Promise.race([updatePromise, timeoutPromise])

      if (!result.error) {
        await refreshProfile()
      }

      return { error: result.error }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signInWithEmail,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
