import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../../assets/auth/logo.png'
import bird from '../../../assets/auth/bird.png'
import './SplashPage.css'

interface SplashPageProps {
  to?: string
  delay?: number
}

export default function SplashPage({ to = '/login', delay = 2500 }: SplashPageProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate(to, { replace: true }), delay)
    return () => clearTimeout(timer)
  }, [navigate, to, delay])

  return (
    <div className="splash-page">
      <p className="splash-tagline">지구를 위한 작은 기록</p>
      <img src={logo} alt="PLOGRiD" className="splash-logo" />
      <div className="splash-bird-wrap">
        <img src={bird} alt="캐릭터" className="splash-bird-img" />
      </div>
    </div>
  )
}
