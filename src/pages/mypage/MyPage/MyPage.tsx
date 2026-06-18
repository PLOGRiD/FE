import { useNavigate } from 'react-router-dom'
import mascotImg from '../../../assets/mypage/mascot.png'
import cloverIcon from '../../../assets/mypage/clover.svg'
import backIcon from '../../../assets/map/back.svg'
import navNextIcon from '../../../assets/home/icons/nav-next.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './MyPage.css'

export default function MyPage() {
  const navigate = useNavigate()

  return (
    <>
      {/* Figma 345:1539: 헤더 h=64(웹), border-bottom #e2e2e2 */}
      <header className="mypage-header">
        <button className="mypage-back-btn" onClick={() => navigate('/')}>
          <img src={backIcon} alt="뒤로" className="mypage-back-icon" />
        </button>
        <span className="mypage-title">마이페이지</span>
      </header>

      <div className="mypage-page">

        {/* Figma 345:1568: 메뉴 목록 top=120 */}
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

        {/* Figma 345:1575: 로그아웃 */}
        <div className="mypage-logout-section">
          <div className="mypage-menu-item">
            <span className="mypage-menu-label">로그아웃</span>
            <img src={navNextIcon} alt="" className="mypage-menu-arrow" />
          </div>
        </div>

        {/* Figma 345:1579: 배경 마스코트 right side, opacity=40% */}
        <div className="mypage-mascot-wrap">
          <img src={mascotImg} alt="" className="mypage-mascot" />
        </div>

        {/* Figma 345:1563: 하단 브랜딩 */}
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
