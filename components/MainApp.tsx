import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Home, Trophy, Users, User, LogOut, Settings } from 'lucide-react'
import { HomeTab } from './HomeTab'
import { ChallengesTab } from './ChallengesTab'
import { RankingTab } from './RankingTab'
import { ProfileTab } from './ProfileTab'
import { ThemeToggle } from './ThemeToggle'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface MainAppProps {
  session: any
  supabase: any
}

export function MainApp({ session, supabase }: MainAppProps) {
  const [activeTab, setActiveTab] = useState('home')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedChallengeId, setSelectedChallengeId] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b4d691ea/profile`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      } else {
        console.error('Failed to fetch profile')
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = () => {
    fetchProfile()
  }

  const handleNavigateToChallenge = (challengeId: string) => {
    setSelectedChallengeId(challengeId)
    setActiveTab('challenges')
  }

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'home': return '홈'
      case 'challenges': return '챌린지'
      case 'ranking': return '순위'
      case 'profile': return '마이페이지'
      default: return '홈'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">프로필을 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground text-xl rounded-full w-10 h-10 flex items-center justify-center">
                  🌊
                </div>
                <div>
                  <h1 className="font-bold text-foreground">
                    {getPageTitle(activeTab)}
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 container mx-auto px-4 py-6 pb-20">
          <TabsContent value="home" className="space-y-6 mt-0">
            <HomeTab 
              profile={profile} 
              session={session}
              onRefreshProfile={refreshProfile}
              onNavigateToChallenge={handleNavigateToChallenge}
            />
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6 mt-0">
            <ChallengesTab 
              profile={profile}
              session={session}
              onRefreshProfile={refreshProfile}
              selectedChallengeId={selectedChallengeId}
              onClearSelectedChallenge={() => setSelectedChallengeId(null)}
            />
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6 mt-0">
            <RankingTab profile={profile} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 mt-0">
            <ProfileTab 
              profile={profile}
              session={session}
              onRefreshProfile={refreshProfile}
            />
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <div className="container mx-auto px-4">
            <TabsList className="grid w-full grid-cols-4 bg-transparent h-16 rounded-none border-0">
              <TabsTrigger 
                value="home" 
                className="flex flex-col items-center space-y-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">홈</span>
              </TabsTrigger>
              <TabsTrigger 
                value="challenges" 
                className="flex flex-col items-center space-y-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <Trophy className="h-5 w-5" />
                <span className="text-xs">챌린지</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ranking" 
                className="flex flex-col items-center space-y-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">순위</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex flex-col items-center space-y-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <User className="h-5 w-5" />
                <span className="text-xs">마이페이지</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </Tabs>
    </div>
  )
}