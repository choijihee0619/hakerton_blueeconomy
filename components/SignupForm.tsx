import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Checkbox } from './ui/checkbox'
import { Loader2, Mail, Lock, User } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface SignupFormProps {
  supabase: any
  onSwitchToLogin: () => void
}

export function SignupForm({ supabase, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const validateForm = () => {
    if (!email || !password || !nickname) {
      setError('모든 필드를 입력해주세요.')
      return false
    }

    if (nickname.length < 3 || nickname.length > 10) {
      setError('닉네임은 3-10자여야 합니다.')
      return false
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return false
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError('비밀번호는 영문과 숫자를 포함해야 합니다.')
      return false
    }

    if (!agreeTerms) {
      setError('이용약관에 동의해주세요.')
      return false
    }

    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      // Call our server signup endpoint
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b4d691ea/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          nickname,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        // Auto login after successful signup
        setTimeout(async () => {
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (loginError) {
            console.error('Auto login failed:', loginError)
            onSwitchToLogin()
          }
        }, 1500)
      } else {
        setError(data.error || '회원가입 중 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('서버와의 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>
          새 계정을 만들고 100포인트 보너스를 받으세요!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signup-email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="nickname"
                type="text"
                placeholder="3-10자의 닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                minLength={3}
                maxLength={10}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signup-password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signup-password"
                type="password"
                placeholder="8자 이상, 영문+숫자 포함"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              이용약관 및 개인정보 처리방침에 동의합니다
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                회원가입 중...
              </>
            ) : (
              '회원가입'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:underline"
            >
              로그인
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}