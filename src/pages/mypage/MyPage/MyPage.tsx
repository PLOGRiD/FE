import { useNavigate } from 'react-router-dom'
import mascotImg from '../../../assets/mypage/mascot.png'
import cloverIcon from '../../../assets/mypage/clover.svg'
import backIcon from '../../../assets/map/back.svg'
import navNextIcon from '../../../assets/home/icons/nav-next.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import { signOut } from '../../../api/auth'
import './MyPage.css'

export default function MyPage() {
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await signOut()
    } catch {
      // 토큰 만료 등 실패해도 로컬 초기화 후 이동
    } finally {
      localStorage.clear()
      navigate('/login')
    }
  }

  return (
    <>
      <header className="mypage-header">
        <button className="mypage-back-btn" onClick={() => navigate('/mypage')}>
          <img src={backIcon} alt="뒤로" className="mypage-back-icon" />
        </button>
        <span className="mypage-title">마이페이지</span>
      </header>

      <div className="mypage-page">

        <div className="mypage-menu-section">
          <div className="mypage-menu-item">
            <span className="mypage-menu-label">서비스 이용 약관</span>
            <img src={navNextIcon} alt="" className="mypage-menu-arrow" />
          </div>
          <div className="mypage-divider" />
          <div className="mypage-menu-item">
            <span className="mypage-menu-label">개인정보 처리방침</span>
            <img src={navNextIcon} alt="" className="mypage-menu-arrow" />
          </div>
        </div>

        <div className="mypage-logout-section">
          <div className="mypage-menu-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <span className="mypage-menu-label">로그아웃</span>
            <img src={navNextIcon} alt="" className="mypage-menu-arrow" />
          </div>
        </div>

        <div className="mypage-mascot-wrap">
          <img src={mascotImg} alt="" className="mypage-mascot" />
        </div>

        <div className="mypage-footer">
          <img src={cloverIcon} alt="" className="mypage-footer-clover" />
          <p className="mypage-footer-brand">PLOGRiD</p>
          <div className="mypage-footer-info">
            <p>plogrid@gmail.com</p>
            <p>2026 PLOGRID. All rights reserved.</p>
          </div>
        </div>

      </div>

      <BottomNav />
    </>
  )
}
