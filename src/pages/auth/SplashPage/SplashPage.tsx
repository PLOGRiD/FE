import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../../assets/auth/logo.png'
import bird from '../../../assets/auth/bird.png'
import './SplashPage.css'

export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login', { replace: true }), 2500)
    return () => clearTimeout(timer)
  }, [navigate])

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
