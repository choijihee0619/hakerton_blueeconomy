import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { User, Edit, Award, Calendar, MapPin, TrendingUp, Star, Settings, Loader2, CheckCircle, Filter } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface ProfileTabProps {
  profile: any
  session: any
  onRefreshProfile: () => void
}

export function ProfileTab({ profile, session, onRefreshProfile }: ProfileTabProps) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('activities')

  useEffect(() => {
    fetchActivities()
    if (profile) {
      setEditNickname(profile.nickname || '')
    }
  }, [profile])

  const fetchActivities = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b4d691ea/activities`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Activities fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProfile = async () => {
    setEditLoading(true)
    setEditError('')
    setEditSuccess('')

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b4d691ea/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          nickname: editNickname,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setEditSuccess('프로필이 성공적으로 업데이트되었습니다.')
        onRefreshProfile()
        setTimeout(() => {
          setEditDialogOpen(false)
        }, 1500)
      } else {
        setEditError(data.error || '프로필 업데이트 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setEditError('서버와의 연결에 실패했습니다.')
    } finally {
      setEditLoading(false)
    }
  }

  const getActivityStats = () => {
    const totalActivities = activities.length
    const totalPoints = activities.reduce((sum, activity) => sum + (activity.totalPoints || activity.points || 0), 0)
    const thisWeekActivities = activities.filter(activity => {
      const activityDate = new Date(activity.submittedAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return activityDate >= weekAgo
    }).length

    return { totalActivities, totalPoints, thisWeekActivities }
  }

  const getBadgeInfo = (badge) => {
    const badges = {
      'first_signup': { emoji: '🎉', name: '첫 가입', description: '앱에 처음 가입했습니다' },
      'first_challenge': { emoji: '🥇', name: '첫 인증', description: '첫 번째 챌린지를 완료했습니다' },
      '첫챌린지': { emoji: '🥇', name: '첫 챌린지', description: '첫 번째 챌린지를 완료했습니다' },
      '천점달성': { emoji: '💎', name: '천점 달성', description: '1000포인트를 달성했습니다' },
      '오천점달성': { emoji: '💍', name: '오천점 달성', description: '5000포인트를 달성했습니다' },
      '도전자': { emoji: '🏆', name: '도전자', description: '10개의 챌린지를 완료했습니다' },
      '환경지킴이': { emoji: '🌍', name: '환경지킴이', description: '50개의 챌린지를 완료했습니다' },
      '일주일연속': { emoji: '📅', name: '일주일 연속', description: '7일 연속 활동했습니다' },
      '한달연속': { emoji: '🔥', name: '한달 연속', description: '30일 연속 활동했습니다' },
      'level_up': { emoji: '📈', name: '레벨업', description: '레벨을 올렸습니다' },
      'streak_7': { emoji: '📅', name: '연속 7일', description: '7일 연속 활동했습니다' },
      'streak_30': { emoji: '🔥', name: '연속 30일', description: '30일 연속 활동했습니다' },
    }
    return badges[badge] || { emoji: '🏆', name: badge, description: '특별한 성취입니다' }
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

  const stats = getActivityStats()

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
            <p className="text-muted-foreground">레벨 {profile.level} · {profile.points}P</p>
            <p className="text-sm text-muted-foreground">
              가입일: {new Date(profile.joinedAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                편집
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>프로필 편집</DialogTitle>
                <DialogDescription>
                  프로필 정보를 수정할 수 있습니다
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-nickname">닉네임</Label>
                  <Input
                    id="edit-nickname"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    placeholder="3-10자의 닉네임"
                    minLength={3}
                    maxLength={10}
                  />
                </div>

                {editError && (
                  <Alert variant="destructive">
                    <AlertDescription>{editError}</AlertDescription>
                  </Alert>
                )}

                {editSuccess && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-600 dark:text-green-400">{editSuccess}</AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    className="flex-1"
                    disabled={editLoading}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleEditProfile}
                    className="flex-1"
                    disabled={editLoading || editNickname.length < 3}
                  >
                    {editLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      '저장'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalActivities}</div>
            <div className="text-sm text-muted-foreground">총 활동</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{profile.badges?.length || 0}</div>
            <div className="text-sm text-muted-foreground">배지</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant={activeTab === 'activities' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('activities')}
          >
            활동 이력
          </Button>
          <Button 
            variant={activeTab === 'badges' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('badges')}
          >
            배지
          </Button>
          <Button 
            variant={activeTab === 'settings' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            설정
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'activities' && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">활동 이력</h3>
          {activities.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>아직 완료한 챌린지가 없습니다.</p>
                  <p className="text-sm">첫 번째 챌린지에 참여해보세요!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <Card key={index}>
                  <div className="flex items-center p-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">챌린지 완료</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.submittedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {activity.location && (
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{activity.location}</span>
                        </div>
                      )}
                      {activity.note && (
                        <p className="text-xs text-muted-foreground mt-1">{activity.note}</p>
                      )}
                    </div>
                    <Badge variant="secondary">+{activity.totalPoints || activity.points}P</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'badges' && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">보유 배지</h3>
          {!profile.badges || profile.badges.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>아직 획득한 배지가 없습니다.</p>
                  <p className="text-sm">챌린지를 완료해서 배지를 획득해보세요!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {profile.badges.map((badge, index) => {
                const badgeInfo = getBadgeInfo(badge)
                return (
                  <Card key={index}>
                    <div className="flex items-center p-4">
                      <div className="text-3xl mr-4">{badgeInfo.emoji}</div>
                      <div>
                        <h4 className="font-medium text-foreground">{badgeInfo.name}</h4>
                        <p className="text-sm text-muted-foreground">{badgeInfo.description}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">설정</h3>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>계정 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>이메일: {profile.email}</p>
                  <p>가입일: {new Date(profile.joinedAt).toLocaleDateString('ko-KR')}</p>
                  <p>마지막 로그인: {new Date(profile.lastLogin).toLocaleDateString('ko-KR')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📱 푸시 알림: 활성화</p>
                  <p>📧 이메일 알림: 비활성화</p>
                  <p>🔔 챌린지 추천: 활성화</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>개인정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    데이터 다운로드
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    계정 탈퇴
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}