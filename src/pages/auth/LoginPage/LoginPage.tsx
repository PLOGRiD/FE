import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../../assets/auth/logo.png'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')

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
        />
        <input
          className="login-field"
          placeholder="비밀번호"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button className="login-btn" onClick={() => navigate('/')}>
          로그인
        </button>
        <button className="signup-link" onClick={() => navigate('/signup')}>
          회원가입
        </button>
      </div>
    </div>
  )
}
