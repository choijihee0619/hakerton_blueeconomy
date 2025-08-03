import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Trophy, Medal, Award, Crown, Star, TrendingUp, User, Calendar, Filter } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface RankingTabProps {
  profile: any
}

export function RankingTab({ profile }: RankingTabProps) {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeRankingType, setActiveRankingType] = useState('total')

  // Mock ranking data with Korean names
  const mockRankings = [
    { rank: 1, nickname: '바다지킴이', level: 6, points: 2450, badges: 12 },
    { rank: 2, nickname: '해양수호자', level: 5, points: 2200, badges: 10 },
    { rank: 3, nickname: '푸른바다', level: 5, points: 1980, badges: 9 },
    { rank: 4, nickname: '환경사랑', level: 4, points: 1750, badges: 8 },
    { rank: 5, nickname: '깨끗한해변', level: 4, points: 1650, badges: 7 },
    { rank: 6, nickname: '미래세대', level: 4, points: 1520, badges: 6 },
    { rank: 7, nickname: '지구지킴이', level: 3, points: 1350, badges: 5 },
    { rank: 8, nickname: '청정바다', level: 3, points: 1280, badges: 5 },
    { rank: 9, nickname: '해양보호', level: 3, points: 1150, badges: 4 },
    { rank: 10, nickname: '푸른지구', level: 3, points: 1090, badges: 4 }
  ]

  useEffect(() => {
    fetchRankings()
  }, [])

  const fetchRankings = async () => {
    try {
      // Use mock data for better UI demonstration
      setTimeout(() => {
        setRankings(mockRankings)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Rankings fetch error:', error)
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">{rank}</span>
    }
  }

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    if (rank === 2) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    if (rank === 3) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
    if (rank <= 10) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    return 'bg-muted text-muted-foreground'
  }

  const getMyRank = () => {
    if (!profile) return Math.floor(Math.random() * 20) + 1
    return rankings.findIndex(r => r.nickname === profile.nickname) + 1 || Math.floor(Math.random() * 20) + 1
  }

  if (loading) {
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
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card rounded-xl p-4">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* My Ranking Card */}
      {profile && (
        <div className="bg-card rounded-2xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-20 h-20 border-4 border-primary/20">
              <AvatarImage src="" alt={profile.nickname} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profile.nickname?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{profile.nickname}</h2>
              <p className="text-muted-foreground">레벨 {profile.level}</p>
              <p className="text-muted-foreground">내 순위: {getMyRank()}위</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{profile.points}</div>
              <div className="text-sm text-muted-foreground">포인트</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{getMyRank()}</div>
              <div className="text-sm text-muted-foreground">순위</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant={activeRankingType === 'total' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveRankingType('total')}
          >
            전체
          </Button>
          <Button 
            variant={activeRankingType === 'weekly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveRankingType('weekly')}
          >
            주간
          </Button>
          <Button 
            variant={activeRankingType === 'monthly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveRankingType('monthly')}
          >
            월간
          </Button>
          <Button 
            variant={activeRankingType === 'level' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveRankingType('level')}
          >
            레벨별
          </Button>
        </div>
        
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          필터
        </Button>
      </div>

      {/* Rankings List */}
      {activeRankingType === 'total' && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">전체 순위</h3>
          <div className="space-y-3">
            {rankings.slice(0, 10).map((user, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex items-center p-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-muted/50 rounded-full mr-4">
                    {getRankIcon(user.rank)}
                  </div>
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{user.nickname}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>레벨 {user.level}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{user.badges}개 배지</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground">{user.points}P</div>
                    <Badge className={getRankBadgeColor(user.rank)}>
                      {user.rank}위
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeRankingType === 'weekly' && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>주간 랭킹 데이터를 준비 중입니다.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeRankingType === 'monthly' && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>월간 랭킹 데이터를 준비 중입니다.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeRankingType === 'level' && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>레벨별 랭킹 데이터를 준비 중입니다.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {rankings.length >= 3 && activeRankingType === 'total' && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">🏆 TOP 3</h3>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-end justify-center space-x-4">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="w-16 h-20 bg-muted rounded-t-xl flex items-end justify-center pb-2">
                    <span className="text-lg font-bold text-foreground">2</span>
                  </div>
                  <div className="mt-2">
                    <Trophy className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    <p className="font-semibold text-sm text-foreground">{rankings[1]?.nickname}</p>
                    <p className="text-xs text-muted-foreground">{rankings[1]?.points}P</p>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="w-16 h-24 bg-yellow-300 rounded-t-xl flex items-end justify-center pb-2">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <div className="mt-2">
                    <Crown className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                    <p className="font-semibold text-sm text-foreground">{rankings[0]?.nickname}</p>
                    <p className="text-xs text-muted-foreground">{rankings[0]?.points}P</p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-300 rounded-t-xl flex items-end justify-center pb-2">
                    <span className="text-lg font-bold">3</span>
                  </div>
                  <div className="mt-2">
                    <Medal className="h-6 w-6 text-amber-600 mx-auto mb-1" />
                    <p className="font-semibold text-sm text-foreground">{rankings[2]?.nickname}</p>
                    <p className="text-xs text-muted-foreground">{rankings[2]?.points}P</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}