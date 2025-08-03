import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Award, Calendar, MapPin, TrendingUp, Star, Zap, User, Settings, Cloud, Sun, Target, Trophy, Users } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface HomeTabProps {
  profile: any
  session: any
  onRefreshProfile: () => void
  onNavigateToChallenge: (challengeId: string) => void
}

export function HomeTab({ profile, session, onRefreshProfile, onNavigateToChallenge }: HomeTabProps) {
  const [recentActivities, setRecentActivities] = useState([])
  const [personalizedChallenges, setPersonalizedChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch recent activities
      const activitiesResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b4d691ea/activities`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        setRecentActivities(activitiesData.activities.slice(0, 3))
      }

      // Set personalized challenges based on user profile and preferences
      generatePersonalizedChallenges()
    } catch (error) {
      console.error('Data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePersonalizedChallenges = () => {
    // Mock weather and location data for Busan
    const currentWeather = "맑음"
    const currentTemp = "22°C"
    
    // Personalized challenges based on user level, past activities, weather
    const challenges = [
      {
        id: 'beach_cleanup',
        title: '해안 정화 활동',
        description: '해운대 해수욕장에서 쓰레기 수거 활동에 참여하세요',
        points: 120,
        successRate: 95,
        reason: '과거 정화 활동 참여 경험 + 좋은 날씨',
        weatherSuitability: '맑음 ☀️',
        image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=300&h=200&fit=crop',
        difficulty: 'easy',
        estimatedTime: 60,
        bonusPoints: '+20P (SNS 공유시)',
        participantCount: 156
      },
      {
        id: 'environmental_education',
        title: '해양환경 교육 참여',
        description: '부산 해양박물관 해양보호 특별전시 관람하기',
        points: 80,
        successRate: 98,
        reason: '레벨 ' + (profile?.level || 1) + ' 사용자 추천 + 실내 활동',
        weatherSuitability: '실내활동 🏢',
        image: 'https://images.unsplash.com/photo-1554475900-e0b2a71df4db?w=300&h=200&fit=crop',
        difficulty: 'easy',
        estimatedTime: 90,
        bonusPoints: '+15P (후기 작성시)',
        participantCount: 89
      },
      {
        id: 'surfing_experience',
        title: '서핑 체험하기',
        description: '송정해수욕장에서 친환경 서핑보드로 서핑 체험',
        points: 150,
        successRate: 85,
        reason: '활동적인 성향 + 해양 스포츠 관심',
        weatherSuitability: '서핑 최적 🏄‍♂️',
        image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=300&h=200&fit=crop',
        difficulty: 'medium',
        estimatedTime: 120,
        bonusPoints: '+30P (단체 참여시)',
        participantCount: 234
      }
    ]
    
    setPersonalizedChallenges(challenges)
  }

  const getLevelProgress = () => {
    if (!profile) return 0
    
    const levelRanges = [
      { level: 1, min: 0, max: 99 },
      { level: 2, min: 100, max: 499 },
      { level: 3, min: 500, max: 999 },
      { level: 4, min: 1000, max: 1499 },
      { level: 5, min: 1500, max: 1999 },
      { level: 6, min: 2000, max: Infinity }
    ]

    const currentRange = levelRanges.find(range => range.level === profile.level)
    if (!currentRange || profile.level === 6) return 100

    const progress = ((profile.points - currentRange.min) / (currentRange.max - currentRange.min)) * 100
    return Math.min(progress, 100)
  }

  const getNextLevelPoints = () => {
    if (!profile) return 0
    
    const levelThresholds = [0, 100, 500, 1000, 1500, 2000]
    const nextThreshold = levelThresholds.find(threshold => threshold > profile.points)
    return nextThreshold || 2000
  }

  const getMyRank = () => {
    return Math.floor(Math.random() * 50) + 1
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '쉬움'
      case 'medium': return '보통'
      case 'hard': return '어려움'
      default: return difficulty
    }
  }

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-2xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="w-20 h-20 border-4 border-primary/20">
            <AvatarImage src="" alt={profile.nickname} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {profile.nickname?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{profile.nickname}</h2>
            <p className="text-muted-foreground">레벨 {profile.level}</p>
            <p className="text-muted-foreground">순위 {getMyRank()}위</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{profile.points}</div>
            <div className="text-sm text-muted-foreground">포인트</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{recentActivities.length}</div>
            <div className="text-sm text-muted-foreground">챌린지</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">다음 레벨까지</span>
            <span className="text-foreground font-medium">
              {getNextLevelPoints() - profile.points}P 남음
            </span>
          </div>
          <Progress value={getLevelProgress()} className="h-2" />
        </div>
      </div>

      {/* Weather & Location Info */}
      <div className="bg-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sun className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="font-medium text-foreground">부산 해운대</p>
              <p className="text-sm text-muted-foreground">맑음, 22°C</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            활동 최적
          </Badge>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold text-foreground">맞춤 추천</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          과거 활동, 선호 유형, 지역, 날씨, 레벨을 기반으로 추천됩니다
        </p>
        
        <div className="space-y-4">
          {personalizedChallenges.map((challenge) => (
            <Card 
              key={challenge.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onNavigateToChallenge(challenge.id)}
            >
              <div className="flex">
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-primary/10 text-primary">
                        {challenge.points} 포인트
                      </Badge>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {getDifficultyText(challenge.difficulty)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-green-600">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{challenge.successRate}% 성공률</span>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-foreground mb-2">{challenge.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {challenge.description}
                  </p>
                  
                  {/* Recommendation Reason */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        추천 이유
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-300">{challenge.reason}</p>
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                      {challenge.weatherSuitability}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{challenge.estimatedTime}분</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{challenge.participantCount}명 참여</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bonus Points */}
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                      💰 보너스: {challenge.bonusPoints}
                    </p>
                  </div>
                  
                  {/* Click to view indicator */}
                  <div className="mt-3 text-center">
                    <Button size="sm" className="w-full">
                      상세보기
                    </Button>
                  </div>
                </div>
                
                <div className="w-24 h-32 flex-shrink-0">
                  <ImageWithFallback
                    src={challenge.image}
                    alt={challenge.title}
                    className="w-full h-full object-cover rounded-r-lg"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">최근 활동</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-card rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">챌린지 완료</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.submittedAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <Badge variant="secondary">+{activity.points}P</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenge Achievement Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>포인트 획득 가이드</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">기본 활동 완료</span>
              <span className="font-medium text-foreground">50-200P</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">난이도 보너스 (어려움)</span>
              <span className="font-medium text-foreground">+50%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">SNS 공유</span>
              <span className="font-medium text-foreground">+15-30P</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">단체 활동 (3명 이상)</span>
              <span className="font-medium text-foreground">+20-50P</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">멸종위기종 발견 신고</span>
              <span className="font-medium text-foreground">+100P</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}