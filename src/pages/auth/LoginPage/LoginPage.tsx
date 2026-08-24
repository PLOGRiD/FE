import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../../assets/auth/logo.png'
import { signIn } from '../../../api/auth'
import { getMyProfile } from '../../../api/member'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!id.trim() || !pw.trim()) return
    setError('')
    setLoading(true)
    try {
      const tokens = await signIn({ username: id, password: pw })
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      const profile = await getMyProfile()
      localStorage.setItem('nickname', profile.nickName)
      localStorage.setItem('email', profile.email)
      navigate('/')
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <p className="login-tagline">지구를 위한 작은 기록</p>
      <img src={logo} alt="PLOGRiD" className="login-logo" />

      <div className="login-form">
        <input
          className="login-field"
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <input
          className="login-field"
          placeholder="비밀번호"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        {error && <p className="login-error">{error}</p>}
        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
        <button className="signup-link" onClick={() => navigate('/signup')}>
          회원가입
        </button>
      </div>
    </div>
  )
}
