import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { Camera, MapPin, Clock, Star, Trophy, Loader2, CheckCircle, Filter, Search, Users, ExternalLink, Info, TrendingUp, Target, Image, Upload, X } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface ChallengesTabProps {
  profile: any
  session: any
  onRefreshProfile: () => void
  selectedChallengeId?: string | null
  onClearSelectedChallenge?: () => void
}

export function ChallengesTab({ profile, session, onRefreshProfile, selectedChallengeId, onClearSelectedChallenge }: ChallengesTabProps) {
  const [challenges, setChallenges] = useState([])
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [verificationData, setVerificationData] = useState({
    location: '',
    note: '',
    photo: null,
    photoPreview: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('전체')

  // Realistic challenges for general citizens and tourists
  const realisticChallenges = [
    {
      id: 'beach_cleanup',
      title: '해안 정화 활동',
      description: '해변 또는 해안가 쓰레기를 수거합니다. 플라스틱, 캔, 담배꽁초 등을 분리수거하세요.',
      points: 100,
      difficulty: 'easy',
      estimatedTime: 60,
      category: 'cleanup',
      image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=250&fit=crop',
      recommendedLocation: '해운대 해수욕장, 부산',
      participantCount: 1247,
      satisfactionRate: 94,
      referenceImages: [
        'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400&h=250&fit=crop'
      ],
      bonusConditions: [
        { condition: 'SNS 공유', points: 20 },
        { condition: '3명 이상 단체 활동', points: 30 },
        { condition: '1kg 이상 수거', points: 25 }
      ],
      tips: '장갑과 집게를 준비하세요. 날카로운 물체는 조심스럽게 다루세요.',
      completionCount: 342
    },
    {
      id: 'marine_waste_collection',
      title: '해양 쓰레기 수거',
      description: '바다 위 또는 바닷속 쓰레기를 수거합니다. 다이빙, 카약, 낚시 중 발견한 쓰레기도 포함됩니다.',
      points: 150,
      difficulty: 'medium',
      estimatedTime: 90,
      category: 'cleanup',
      image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400&h=250&fit=crop',
      recommendedLocation: '광안리 해수욕장, 부산',
      participantCount: 567,
      satisfactionRate: 91,
      referenceImages: [
        'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400&h=250&fit=crop'
      ],
      bonusConditions: [
        { condition: 'SNS 공유', points: 25 },
        { condition: '수중 활동 중 수거', points: 50 },
        { condition: '대형 쓰레기 발견', points: 40 }
      ],
      tips: '수상 안전에 주의하세요. 혼자 하지 마시고 동반자와 함께 하세요.',
      completionCount: 156
    },
    {
      id: 'environmental_education',
      title: '환경교육 참여',
      description: '해양환경관련 교육프로그램에 참여합니다. 워크샵, 세미나, 전시관람 등이 포함됩니다.',
      points: 80,
      difficulty: 'easy',
      estimatedTime: 120,
      category: 'education',
      image: 'https://images.unsplash.com/photo-1554475900-e0b2a71df4db?w=400&h=250&fit=crop',
      recommendedLocation: '부산 해양박물관, 부산',
      participantCount: 892,
      satisfactionRate: 96,
      hasExternalLink: true,
      externalLinkText: '진행중인 해양환경관련 프로그램 확인하러가기',
      externalLinkUrl: 'https://beec.or.kr/edu_03.html?query=list&botype=LIS_B04_01&bocate=3',
      referenceImages: [
        'https://images.unsplash.com/photo-1554475900-e0b2a71df4db?w=400&h=250&fit=crop'
      ],
      bonusConditions: [
        { condition: '후기 작성', points: 15 },
        { condition: '지식 퀴즈 참여', points: 10 },
        { condition: '친구 초대', points: 20 }
      ],
      tips: '참여 증명서나 수료증을 보관해두세요. 사진 촬영시 개인정보 보호에 주의하세요.',
      completionCount: 234
    },
    {
      id: 'pollution_report',
      title: '오염 신고',
      description: '해양 오염 현장을 발견하고 신고합니다. 기름 유출, 불법 폐기물 투기, 적조 현상 등을 신고하세요.',
      points: 120,
      difficulty: 'easy',
      estimatedTime: 30,
      category: 'reporting',
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=250&fit=crop',
      recommendedLocation: '전 해안가, 부산',
      participantCount: 234,
      satisfactionRate: 89,
      referenceImages: [
        'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=250&fit=crop'
      ],
      bonusConditions: [
        { condition: '정확한 위치 정보 제공', points: 20 },
        { condition: '상세한 현장 사진', points: 25 },
        { condition: '멸종위기종 발견 신고', points: 100 }
      ],
      tips: '위험하지 않은 선에서 사진을 찍고, 정확한 위치와 시간을 기록하세요.',
      completionCount: 67
    },
    {
      id: 'surfing_experience',
      title: '서핑하기',
      description: '송정해수욕장, 광안리해수욕장 등 서핑이 가능한 해변가에서 서핑 체험하기',
      points: 150,
      difficulty: 'medium',
      estimatedTime: 120,
      category: 'sports',
      image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=250&fit=crop',
      recommendedLocation: '송정해수욕장, 부산',
      participantCount: 1156,
      satisfactionRate: 92,
      referenceImages: [
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=250&fit=crop'
      ],
      bonusConditions: [
        { condition: '친환경 서핑보드 사용', points: 30 },
        { condition: '서핑 클럽 가입', points: 40 },
        { condition: '서핑 후 해변 정리', points: 25 }
      ],
      tips: '안전 장비를 착용하고, 날씨와 파도 상태를 확인하세요. 초보자는 강사와 함께 하세요.',
      completionCount: 445
    },
    {
      id: 'marine_tourism',
      title: '해양관광프로그램 참여하기',
      description: '부산 해안가나 바다에서 이루어지는 관광 프로그램 참여하기 (유람선, 어촌체험, 해양생물관찰 등)',
      points: 100,
      difficulty: 'easy',
      estimatedTime: 180,
      category: 'tourism',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop',
      recommendedLocation: '태종대, 부산',
      participantCount: 2340,
      satisfactionRate: 88,
      hasExternalLink: true,
      externalLinkText: '진행중인 해양관광 프로그램 확인하러가기',
      externalLinkUrl: 'https://www.cocoisland.club/',
      referenceImages: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop'
      ],
      bonusConditions: [
        { condition: '현지 가이드 이용', points: 20 },
        { condition: '환경친화적 업체 선택', points: 30 },
        { condition: '관광후기 작성', points: 15 }
      ],
      tips: '지속가능한 관광을 위해 환경친화적인 업체를 선택하세요. 해양생물을 보호하세요.',
      completionCount: 678
    }
  ]

  useEffect(() => {
    fetchChallenges()
  }, [])

  // Auto-open challenge details when navigated from home
  useEffect(() => {
    if (selectedChallengeId && challenges.length > 0) {
      const challenge = challenges.find(c => c.id === selectedChallengeId)
      if (challenge) {
        handleChallengeDetails(challenge)
        onClearSelectedChallenge?.()
      }
    }
  }, [selectedChallengeId, challenges])

  const fetchChallenges = async () => {
    try {
      setChallenges(realisticChallenges)
    } catch (error) {
      console.error('Challenges fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge)
    setShowVerification(true)
    // Set default location from recommended location
    setVerificationData({ 
      location: challenge.recommendedLocation || '', 
      note: '',
      photo: null,
      photoPreview: ''
    })
    setSuccess('')
    setError('')
  }

  const handleChallengeDetails = (challenge) => {
    setSelectedChallenge(challenge)
    setShowDetails(true)
  }

  const handleLocationDetection = () => {
    if (!navigator.geolocation) {
      setError('위치 서비스를 지원하지 않는 브라우저입니다. 수동으로 위치를 입력해주세요.')
      return
    }

    setError('위치 정보를 확인하는 중...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setVerificationData(prev => ({
          ...prev,
          location: `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`
        }))
        setError('') // Clear any previous errors
      },
      (error) => {
        console.error('Location detection failed:', {
          code: error.code,
          message: error.message,
          type: error.constructor.name
        })
        let errorMessage = '위치 정보를 가져올 수 없습니다.'
        
        // Use GeolocationPositionError constants directly
        if (error.code === 1) { // PERMISSION_DENIED
          errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          errorMessage = '위치 정보를 사용할 수 없습니다.'
        } else if (error.code === 3) { // TIMEOUT
          errorMessage = '위치 요청 시간이 초과되었습니다.'
        } else {
          errorMessage = '위치 정보를 가져오는 중 오류가 발생했습니다.'
        }
        
        setError(errorMessage + ' 수동으로 입력해주세요.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000
      }
    )
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('파일 크기는 10MB 이하여야 합니다.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setVerificationData(prev => ({
          ...prev,
          photo: file,
          photoPreview: e.target?.result as string
        }))
        setError('')
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setVerificationData(prev => ({
      ...prev,
      photo: null,
      photoPreview: ''
    }))
  }

  const triggerFileInput = (inputType: 'camera' | 'gallery') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    if (inputType === 'camera') {
      input.capture = 'environment' // Use rear camera on mobile
    }
    
    input.onchange = handlePhotoUpload
    input.click()
  }

  const handleSubmitVerification = async () => {
    if (!selectedChallenge) return
    
    // Validate required fields
    if (!verificationData.photoPreview) {
      setError('사진을 업로드해주세요.')
      return
    }
    
    if (!verificationData.location.trim()) {
      setError('위치 정보를 입력해주세요.')
      return
    }
    
    setSubmitting(true)
    setError('')

    try {
      // Get access token from session
      const accessToken = session?.access_token
      
      if (!accessToken) {
        setError('로그인이 필요합니다.')
        return
      }

      // Submit challenge verification to server
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b4d691ea/verify-challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          location: verificationData.location.trim(),
          note: verificationData.note.trim(),
          photoData: verificationData.photoPreview // Base64 image data
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '서버 오류가 발생했습니다.')
      }

      if (result.success) {
        setSuccess(result.message || `챌린지 완료! ${result.earnedPoints}포인트를 획득했습니다.`)
        onRefreshProfile() // Refresh profile to show updated points
        
        setTimeout(() => {
          setShowVerification(false)
          setSelectedChallenge(null)
          setSuccess('')
          // Reset verification data
          setVerificationData({
            location: '',
            note: '',
            photo: null,
            photoPreview: ''
          })
        }, 3000)
      } else {
        setError(result.error || '챌린지 제출에 실패했습니다.')
      }
      
    } catch (error) {
      console.error('Challenge verification error:', error)
      setError(error.message || '인증 처리 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
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

  const getDifficultyMultiplier = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 1.0
      case 'medium': return 1.3
      case 'hard': return 1.5
      default: return 1.0
    }
  }

  const filteredChallenges = challenges.filter(challenge => {
    if (activeFilter === '전체') return true
    if (activeFilter === '정화활동') return challenge.category === 'cleanup'
    if (activeFilter === '교육참여') return challenge.category === 'education'
    if (activeFilter === '신고활동') return challenge.category === 'reporting'
    if (activeFilter === '체험활동') return challenge.category === 'sports' || challenge.category === 'tourism'
    return true
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Challenge Info Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Trophy className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-foreground">챌린지 참여 안내</h3>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• 다양한 챌린지 활동을 통해 포인트를 획득할 수 있습니다</p>
            <p>• 난이도에 따라 가중치가 부여됩니다 (쉬움 1.0x, 보통 1.3x, 어려움 1.5x)</p>
            <p>• 단체 활동, 멸종위기종 발견, SNS 공유 시 보너스 포인트를 받을 수 있습니다</p>
          </div>
        </CardContent>
      </Card>

      {/* Filter Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {['전체', '정화활동', '교육참여', '신고활동', '체험활동'].map((filter) => (
            <Button 
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="whitespace-nowrap"
            >
              {filter}
            </Button>
          ))}
        </div>
        
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          필터
        </Button>
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {filteredChallenges.map((challenge) => (
          <Card key={challenge.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex">
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-primary/10 text-primary">
                      {Math.round(challenge.points * getDifficultyMultiplier(challenge.difficulty))} 포인트
                    </Badge>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {getDifficultyText(challenge.difficulty)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{challenge.satisfactionRate}% 만족도</span>
                  </div>
                </div>
                
                <h4 className="font-semibold text-foreground mb-2">{challenge.title}</h4>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {challenge.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{challenge.estimatedTime}분</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-blue-600 truncate">추천: {challenge.recommendedLocation}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mb-3">
                  <p>📍 활동추천장소: {challenge.recommendedLocation} (다른 장소에서도 가능함)</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span>참여: {challenge.participantCount}명</span>
                    <span>완료: {challenge.completionCount}건</span>
                  </div>
                </div>
                
                {challenge.hasExternalLink && (
                  <div className="mb-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => window.open(challenge.externalLinkUrl, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {challenge.externalLinkText}
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button 
                    size="sm"
                    onClick={() => handleChallengeDetails(challenge)}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Info className="h-4 w-4 mr-1" />
                    상세보기
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleChallengeSelect(challenge)}
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                  >
                    챌린지 시작
                  </Button>
                </div>
              </div>
              
              <div className="w-20 h-24 sm:w-24 sm:h-32 flex-shrink-0">
                <ImageWithFallback
                  src={challenge.image}
                  alt={challenge.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Challenge Details Dialog */}
      <Dialog open={showDetails} onOpenChange={(open) => {
        setShowDetails(open)
        if (!open) {
          onClearSelectedChallenge?.()
        }
      }}>
        <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-2 border-b flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2">
              <span>{selectedChallenge?.title}</span>
            </DialogTitle>
            <DialogDescription>
              챌린지 상세 정보 및 참여 가이드
            </DialogDescription>
          </DialogHeader>

          {selectedChallenge && (
            <>
              <div className="flex-1 overflow-y-auto px-4">
                <div className="space-y-4 py-4">
                  {/* Challenge Image */}
                  <div className="w-full h-32 sm:h-48 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={selectedChallenge.image}
                      alt={selectedChallenge.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-foreground">
                        {Math.round(selectedChallenge.points * getDifficultyMultiplier(selectedChallenge.difficulty))}P
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">포인트</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-foreground">{selectedChallenge.estimatedTime}분</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">예상 시간</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium mb-2">설명</h4>
                    <p className="text-sm text-muted-foreground">{selectedChallenge.description}</p>
                  </div>

                  {/* Statistics */}
                  <div>
                    <h4 className="font-medium mb-2">참여 통계</h4>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                      <div>
                        <div className="text-sm sm:text-lg font-bold text-foreground">{selectedChallenge.participantCount}</div>
                        <div className="text-xs text-muted-foreground">참여 횟수</div>
                      </div>
                      <div>
                        <div className="text-sm sm:text-lg font-bold text-foreground">{selectedChallenge.satisfactionRate}%</div>
                        <div className="text-xs text-muted-foreground">만족도</div>
                      </div>
                      <div>
                        <div className="text-sm sm:text-lg font-bold text-foreground">{selectedChallenge.completionCount}</div>
                        <div className="text-xs text-muted-foreground">완료 건수</div>
                      </div>
                    </div>
                  </div>

                  {/* Bonus Conditions */}
                  <div>
                    <h4 className="font-medium mb-2">보너스 포인트</h4>
                    <div className="space-y-2">
                      {selectedChallenge.bonusConditions?.map((bonus, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <span className="text-muted-foreground">{bonus.condition}</span>
                          <span className="font-medium text-yellow-700 dark:text-yellow-400">+{bonus.points}P</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <h4 className="font-medium mb-2">참여 팁</h4>
                    <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      💡 {selectedChallenge.tips}
                    </p>
                  </div>

                  {/* Reference Images */}
                  {selectedChallenge.referenceImages && selectedChallenge.referenceImages.length > 1 && (
                    <div>
                      <h4 className="font-medium mb-2">참고 사진</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedChallenge.referenceImages.slice(1).map((image, index) => (
                          <div key={index} className="w-full h-20 sm:h-24 rounded overflow-hidden">
                            <ImageWithFallback
                              src={image}
                              alt={`참고 사진 ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External Link Button */}
                  {selectedChallenge.hasExternalLink && (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedChallenge.externalLinkUrl, '_blank', 'noopener,noreferrer')}
                        className="w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {selectedChallenge.externalLinkText}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons - Fixed at bottom */}
              <div className="px-4 py-3 border-t bg-background flex-shrink-0">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetails(false)
                      onClearSelectedChallenge?.()
                    }}
                    className="flex-1"
                  >
                    닫기
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetails(false)
                      handleChallengeSelect(selectedChallenge)
                    }}
                    className="flex-1"
                  >
                    참여하기
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-2 border-b flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2">
              <span>{selectedChallenge?.title}</span>
            </DialogTitle>
            <DialogDescription>
              챌린지 완료를 인증해주세요
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-4 py-4">
              {/* Success/Error Messages */}
              {success && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Photo Upload */}
              <div>
                <Label htmlFor="photo">활동 사진 *</Label>
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => triggerFileInput('camera')}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      사진 촬영
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => triggerFileInput('gallery')}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      앨범에서 선택
                    </Button>
                  </div>
                  
                  {verificationData.photoPreview ? (
                    <div className="mt-2 relative">
                      <div className="w-full h-32 sm:h-48 rounded-lg overflow-hidden border-2 border-border">
                        <img
                          src={verificationData.photoPreview}
                          alt="업로드된 사진"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removePhoto}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">사진을 업로드해주세요</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">위치 정보 *</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      id="location"
                      placeholder="위치를 입력하세요"
                      value={verificationData.location}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, location: e.target.value }))}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLocationDetection}
                      className="px-3"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {['해운대 해수욕장', '광안리 해수욕장', '송정해수욕장', '태종대'].map((location) => (
                      <Button
                        key={location}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setVerificationData(prev => ({ ...prev, location }))}
                        className="text-xs truncate"
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div>
                <Label htmlFor="note">활동 내용 (선택)</Label>
                <Textarea
                  id="note"
                  placeholder="활동 후기나 특별한 사항을 작성해주세요. SNS 공유, 단체 활동 등을 언급하면 보너스 포인트를 받을 수 있어요!"
                  value={verificationData.note}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, note: e.target.value }))}
                  className="mt-2 min-h-[80px]"
                />
              </div>

              {/* Submit Requirements */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2 text-blue-700 dark:text-blue-300">인증 필수 항목</h4>
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center space-x-2 ${verificationData.photoPreview ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${verificationData.photoPreview ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>사진 업로드 {verificationData.photoPreview ? '✓' : ''}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${verificationData.location.trim() ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${verificationData.location.trim() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>위치 정보 입력 {verificationData.location.trim() ? '✓' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="px-4 py-3 border-t bg-background flex-shrink-0">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowVerification(false)}
                className="flex-1"
                disabled={submitting}
              >
                취소
              </Button>
              <Button
                onClick={handleSubmitVerification}
                className="flex-1"
                disabled={submitting || !verificationData.photoPreview || !verificationData.location.trim()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    인증 중...
                  </>
                ) : (
                  '제출'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}