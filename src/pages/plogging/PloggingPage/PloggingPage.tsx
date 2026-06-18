import { useNavigate } from 'react-router-dom'
import bagImg from '../../../assets/plogging/bag.png'
import qrBg from '../../../assets/plogging/qr-bg.png'
import ellipseImg from '../../../assets/plogging/ellipse.png'
import loadingIcon from '../../../assets/plogging/loading.svg'
import backIcon from '../../../assets/map/back.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './PloggingPage.css'

export default function PloggingPage() {
  const navigate = useNavigate()

  return (
    <>
      {/* Figma 345:1011: 헤더 */}
      <header className="plogging-header">
        <button className="plogging-back-btn" onClick={() => navigate('/')}>
          <img src={backIcon} alt="뒤로" className="plogging-back-icon" />
        </button>
        <span className="plogging-title">플로깅</span>
      </header>

      <div className="plogging-page">

        {/* Figma 345:1039: "디바이스 연결" font=20px SemiBold, top=144 */}
        <p className="plogging-main-title">디바이스 연결</p>

        {/* Figma 345:1040: 설명 font=13px Medium #7c7c7c, top=184 */}
        <p className="plogging-sub">
          카메라에 전용 스마트 수거 디바이스의<br />QR 코드를 비추어 주세요
        </p>

        {/* Figma 345:1043: 그림자 ellipse h=29, w=147, top=377 */}
        {/* Figma 345:1044: 백 이미지 w=150, h=146, top=269
            inner img: w=868.67%, h=596.09%, left=-29.75%, top=-352.44% */}
        <div className="plogging-bag-area">
          <div className="plogging-bag-container">
            <img src={bagImg} alt="플로깅 백" className="plogging-bag-img" />
          </div>
          <div className="plogging-ellipse-container">
            <img src={ellipseImg} alt="" className="plogging-ellipse-img" />
          </div>
        </div>

        {/* Figma 345:1036: "연결 대기 중" font=20px SemiBold, top=456 */}
        <p className="plogging-wait-title">연결 대기 중</p>

        {/* Figma 345:1037: loading icon size=24, top=491 */}
        <div className="plogging-loading">
          <img src={loadingIcon} alt="" className="plogging-loading-icon" />
        </div>

        {/* Figma 345:1041: QR border h=246, w=254, radius=10, border #bdc0c7
            inner img: object-cover */}
        <div className="plogging-qr-border">
          <img src={qrBg} alt="QR" className="plogging-qr-img" />
        </div>

      </div>

      <BottomNav />
    </>
  )
}
