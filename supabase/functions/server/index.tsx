import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Enable CORS for all requests
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Helper function to verify user authentication
async function verifyAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1]
  if (!accessToken) {
    return { error: 'No access token provided', status: 401 }
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) {
    return { error: 'Invalid access token', status: 401 }
  }
  
  return { user }
}

// Sign up endpoint
app.post('/make-server-b4d691ea/signup', async (c) => {
  try {
    const { email, password, nickname } = await c.req.json()
    
    // Validate input
    if (!email || !password || !nickname) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    if (nickname.length < 3 || nickname.length > 10) {
      return c.json({ error: '닉네임은 3-10자여야 합니다.' }, 400)
    }
    
    if (password.length < 8) {
      return c.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, 400)
    }
    
    // Check if nickname already exists
    const existingUser = await kv.get(`user_nickname:${nickname}`)
    if (existingUser) {
      return c.json({ error: '이미 사용 중인 닉네임입니다.' }, 400)
    }
    
    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { nickname },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    })
    
    if (error) {
      console.log('User creation error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    // Initialize user profile with bonus points
    const userProfile = {
      id: data.user.id,
      email,
      nickname,
      points: 100,
      level: 1,
      badges: ['first_signup'],
      joinedAt: new Date().toISOString(),
      loginAttempts: 0,
      lastLogin: new Date().toISOString()
    }
    
    await kv.set(`user:${data.user.id}`, userProfile)
    await kv.set(`user_nickname:${nickname}`, data.user.id)
    
    return c.json({ 
      user: data.user, 
      message: '회원가입 완료! 100포인트 보너스를 받았습니다.',
      points: 100
    })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Get user profile
app.get('/make-server-b4d691ea/profile', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const profile = await kv.get(`user:${authResult.user.id}`)
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }
    
    return c.json({ profile })
  } catch (error) {
    console.log('Profile fetch error:', error)
    return c.json({ error: 'Internal server error while fetching profile' }, 500)
  }
})

// Update profile
app.put('/make-server-b4d691ea/profile', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const { nickname } = await c.req.json()
    const currentProfile = await kv.get(`user:${authResult.user.id}`)
    
    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404)
    }
    
    // Check if new nickname is different and available
    if (nickname && nickname !== currentProfile.nickname) {
      if (nickname.length < 3 || nickname.length > 10) {
        return c.json({ error: '닉네임은 3-10자여야 합니다.' }, 400)
      }
      
      const existingUser = await kv.get(`user_nickname:${nickname}`)
      if (existingUser && existingUser !== authResult.user.id) {
        return c.json({ error: '이미 사용 중인 닉네임입니다.' }, 400)
      }
      
      // Remove old nickname mapping and add new one
      await kv.del(`user_nickname:${currentProfile.nickname}`)
      await kv.set(`user_nickname:${nickname}`, authResult.user.id)
      
      currentProfile.nickname = nickname
    }
    
    await kv.set(`user:${authResult.user.id}`, currentProfile)
    
    return c.json({ profile: currentProfile })
  } catch (error) {
    console.log('Profile update error:', error)
    return c.json({ error: 'Internal server error while updating profile' }, 500)
  }
})

// Get challenges
app.get('/make-server-b4d691ea/challenges', async (c) => {
  try {
    const challenges = [
      {
        id: 'beach_cleanup',
        title: '해안 정화',
        description: '해변 또는 해안가 쓰레기를 수거합니다.',
        points: 60,
        difficulty: 'medium',
        estimatedTime: 60,
        category: 'cleanup',
        icon: '🏖️'
      },
      {
        id: 'ocean_waste',
        title: '해양 쓰레기 수거',
        description: '바다 위 또는 바닷속 쓰레기를 수거합니다.',
        points: 50,
        difficulty: 'medium',
        estimatedTime: 45,
        category: 'cleanup',
        icon: '🌊'
      },
      {
        id: 'education',
        title: '환경 교육 참여',
        description: '해양 환경 관련 교육 프로그램에 참여합니다.',
        points: 40,
        difficulty: 'easy',
        estimatedTime: 30,
        category: 'education',
        icon: '📚'
      },
      {
        id: 'pollution_report',
        title: '오염 신고',
        description: '해양 오염 현장을 발견하고 신고합니다.',
        points: 30,
        difficulty: 'easy',
        estimatedTime: 15,
        category: 'report',
        icon: '⚠️'
      },
      {
        id: 'wildlife_observation',
        title: '해양 생물 관찰',
        description: '해양 생물을 관찰하고 기록합니다.',
        points: 35,
        difficulty: 'easy',
        estimatedTime: 30,
        category: 'observation',
        icon: '🐟'
      }
    ]
    
    return c.json({ challenges })
  } catch (error) {
    console.log('Challenges fetch error:', error)
    return c.json({ error: 'Internal server error while fetching challenges' }, 500)
  }
})

// Submit challenge verification
app.post('/make-server-b4d691ea/verify-challenge', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const { challengeId, location, note, photoData } = await c.req.json()
    
    if (!challengeId || !location) {
      return c.json({ error: 'Challenge ID and location are required' }, 400)
    }
    
    const profile = await kv.get(`user:${authResult.user.id}`)
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }
    
    // Check for recent duplicate submissions (prevent spam)
    const userActivities = await kv.getByPrefix(`activity:${authResult.user.id}:`)
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    const recentSubmission = userActivities.find(activity => 
      activity.challengeId === challengeId && 
      new Date(activity.submittedAt).getTime() > oneHourAgo
    )
    
    if (recentSubmission) {
      return c.json({ 
        error: '동일한 챌린지는 1시간에 한 번만 제출할 수 있습니다.' 
      }, 429)
    }
    
    // Get challenge details - Updated with new challenge IDs
    const challenges = [
      { id: 'beach_cleanup', points: 100, difficulty: 'easy' },
      { id: 'marine_waste_collection', points: 150, difficulty: 'medium' },
      { id: 'environmental_education', points: 80, difficulty: 'easy' },
      { id: 'pollution_report', points: 120, difficulty: 'easy' },
      { id: 'surfing_experience', points: 150, difficulty: 'medium' },
      { id: 'marine_tourism', points: 100, difficulty: 'easy' },
      // Legacy challenge IDs for backward compatibility
      { id: 'ocean_waste', points: 50, difficulty: 'medium' },
      { id: 'education', points: 40, difficulty: 'easy' },
      { id: 'wildlife_observation', points: 35, difficulty: 'easy' }
    ]
    
    const challenge = challenges.find(c => c.id === challengeId)
    if (!challenge) {
      return c.json({ error: 'Invalid challenge ID' }, 400)
    }
    
    // Calculate points with difficulty multiplier
    const difficultyMultiplier = challenge.difficulty === 'hard' ? 1.5 : (challenge.difficulty === 'medium' ? 1.3 : 1.0)
    let earnedPoints = Math.round(challenge.points * difficultyMultiplier)
    
    // Calculate bonus points based on note content
    let bonusPoints = 0
    if (note) {
      const lowerNote = note.toLowerCase()
      if (lowerNote.includes('단체') || lowerNote.includes('그룹')) {
        bonusPoints += 30
      }
      if (lowerNote.includes('sns') || lowerNote.includes('공유')) {
        bonusPoints += 20
      }
      if (lowerNote.includes('멸종위기종')) {
        bonusPoints += 100
      }
    }
    
    // First time bonus
    const firstTime = userActivities.length === 0
    if (firstTime) {
      bonusPoints += 10
    }
    
    const totalPoints = earnedPoints + bonusPoints
    
    // Create activity record
    const activityId = `activity:${authResult.user.id}:${Date.now()}`
    const activity = {
      id: activityId,
      userId: authResult.user.id,
      challengeId,
      basePoints: earnedPoints,
      bonusPoints,
      totalPoints,
      location,
      note: note || '',
      status: 'approved', // Auto-approve for demo
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    }
    
    await kv.set(activityId, activity)
    
    // Update user profile
    const oldPoints = profile.points
    const oldLevel = profile.level
    profile.points += totalPoints
    profile.lastLogin = new Date().toISOString()
    
    // Update challenge completion count if not already tracked
    if (!profile.challengesCompleted) profile.challengesCompleted = 0
    profile.challengesCompleted += 1
    
    // Update streak logic
    const today = new Date().toDateString()
    const lastActivityDate = profile.lastActivity ? new Date(profile.lastActivity).toDateString() : null
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
    
    if (!profile.currentStreak) profile.currentStreak = 0
    if (!profile.longestStreak) profile.longestStreak = 0
    
    if (lastActivityDate === yesterday) {
      profile.currentStreak += 1
    } else if (lastActivityDate !== today) {
      profile.currentStreak = 1
    }
    
    profile.longestStreak = Math.max(profile.longestStreak, profile.currentStreak)
    profile.lastActivity = new Date().toISOString()
    
    // Check for level up (every 1000 points = 1 level)
    const newLevel = Math.floor(profile.points / 1000) + 1
    const leveledUp = newLevel > profile.level
    profile.level = newLevel
    
    // Add badges
    if (!profile.badges) profile.badges = []
    const newBadges = []
    
    if (firstTime && !profile.badges.includes('첫챌린지')) {
      profile.badges.push('첫챌린지')
      newBadges.push('첫챌린지')
    }
    
    if (profile.points >= 1000 && !profile.badges.includes('천점달성')) {
      profile.badges.push('천점달성')
      newBadges.push('천점달성')
    }
    
    if (profile.challengesCompleted >= 10 && !profile.badges.includes('도전자')) {
      profile.badges.push('도전자')
      newBadges.push('도전자')
    }
    
    if (profile.currentStreak >= 7 && !profile.badges.includes('일주일연속')) {
      profile.badges.push('일주일연속')
      newBadges.push('일주일연속')
    }
    
    await kv.set(`user:${authResult.user.id}`, profile)
    
    // Prepare success message
    let successMessage = `챌린지 완료! ${totalPoints}포인트를 획득했습니다.`
    if (bonusPoints > 0) {
      successMessage += ` (보너스 +${bonusPoints}P)`
    }
    if (leveledUp) {
      successMessage += ` 🎉 레벨업!`
    }
    
    return c.json({ 
      success: true,
      activity,
      earnedPoints: totalPoints,
      totalPoints: profile.points,
      level: profile.level,
      leveledUp,
      badges: profile.badges,
      newBadges,
      message: successMessage,
      rewards: {
        basePoints: earnedPoints,
        bonusPoints,
        totalPoints,
        leveledUp,
        newBadges,
        newLevel: profile.level
      }
    })
  } catch (error) {
    console.log('Challenge verification error:', error)
    return c.json({ error: 'Internal server error during challenge verification' }, 500)
  }
})

// Get user activities
app.get('/make-server-b4d691ea/activities', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const activities = await kv.getByPrefix(`activity:${authResult.user.id}:`)
    
    // Sort by submission date (newest first)
    const sortedActivities = activities.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
    
    return c.json({ activities: sortedActivities })
  } catch (error) {
    console.log('Activities fetch error:', error)
    return c.json({ error: 'Internal server error while fetching activities' }, 500)
  }
})

// Get rankings
app.get('/make-server-b4d691ea/rankings', async (c) => {
  try {
    const users = await kv.getByPrefix('user:')
    
    // Filter out system users and sort by points
    const rankings = users
      .filter(user => user.points !== undefined)
      .sort((a, b) => b.points - a.points)
      .slice(0, 100) // Top 100
      .map((user, index) => ({
        rank: index + 1,
        nickname: user.nickname,
        points: user.points,
        level: user.level,
        badges: user.badges?.length || 0
      }))
    
    return c.json({ rankings })
  } catch (error) {
    console.log('Rankings fetch error:', error)
    return c.json({ error: 'Internal server error while fetching rankings' }, 500)
  }
})

Deno.serve(app.fetch)