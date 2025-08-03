import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './utils/supabase/info'
import { LoginForm } from './components/LoginForm'
import { SignupForm } from './components/SignupForm'
import { MainApp } from './components/MainApp'
import { ThemeProvider } from './components/ThemeProvider'
import { Loader2 } from 'lucide-react'

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('login') // 'login', 'signup', 'app'

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        setCurrentView('app')
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setCurrentView('app')
      } else {
        setCurrentView('login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">앱을 로딩 중...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  if (session && currentView === 'app') {
    return (
      <ThemeProvider>
        <MainApp session={session} supabase={supabase} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            {/* App Header */}
            <div className="text-center mb-8">
              <div className="bg-primary text-primary-foreground text-4xl rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                🌊
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">블루이코노미</h1>
              <p className="text-muted-foreground">해양 환경 보호 챌린지</p>
            </div>

            {/* Auth Forms */}
            {currentView === 'login' ? (
              <LoginForm 
                supabase={supabase}
                onSwitchToSignup={() => setCurrentView('signup')}
              />
            ) : (
              <SignupForm 
                supabase={supabase}
                onSwitchToLogin={() => setCurrentView('login')}
              />
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}