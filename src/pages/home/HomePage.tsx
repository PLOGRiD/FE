import { useNavigate } from 'react-router-dom'
import logo from '../../assets/auth/logo.png'
import defaultAvatar from '../../assets/mypage/default-avatar.png'
import bannerBird from '../../assets/home/banner-bird.png'
import ellipseLg from '../../assets/home/ellipse-lg.svg'
import ellipseSm from '../../assets/home/ellipse-sm.svg'
import runIcon from '../../assets/home/icons/run.svg'
import clockIcon from '../../assets/home/icons/clock.svg'
import trashIcon from '../../assets/home/icons/trash.svg'
import cloverIcon from '../../assets/home/icons/clover.svg'
import cameraIcon from '../../assets/home/icons/camera.svg'
import navNext from '../../assets/home/icons/nav-next.svg'
import medal1 from '../../assets/home/icons/medal-1st.svg'
import medal2 from '../../assets/home/icons/medal-2nd.svg'
import medal3 from '../../assets/home/icons/medal-3rd.svg'
import petIcon from '../../assets/home/recycling/paper.png'
import paperIcon from '../../assets/home/recycling/vinyl.png'
import paperPackIcon from '../../assets/home/recycling/paper-pack.png'
import glassIcon from '../../assets/home/recycling/glass.png'
import vinylIcon from '../../assets/home/recycling/battery-icon.png'
import batteryCellIcon from '../../assets/home/recycling/battery-cell.png'
import metalIcon from '../../assets/home/recycling/metal.png'
import lampIcon from '../../assets/home/recycling/lamp.png'
import foamIcon from '../../assets/home/recycling/foam.png'
import clothingIcon from '../../assets/home/recycling/clothing.png'
import electronicsIcon from '../../assets/home/recycling/electronics.png'
import plasticIcon from '../../assets/home/recycling/pet.png'
import BottomNav from '../../components/BottomNav/BottomNav'
import './HomePage.css'

const recentActivity = {
  distance: null as number | null,
  duration: null as string | null,
  trashCount: null as number | null,
}

const RECYCLING_ROW1 = [
  { icon: petIcon, label: '페트' },
  { icon: paperIcon, label: '종이' },
  { icon: paperPackIcon, label: '종이팩' },
  { icon: glassIcon, label: '유리' },
  { icon: vinylIcon, label: '비닐' },
  { icon: batteryCellIcon, label: '전지' },
]

const RECYCLING_ROW2 = [
  { icon: metalIcon, label: '금속류' },
  { icon: plasticIcon, label: '플라스틱' },
  { icon: lampIcon, label: '조명제품' },
  { icon: foamIcon, label: '발포합성수지' },
  { icon: clothingIcon, label: '의류/원단' },
  { icon: electronicsIcon, label: '전기전자제품' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const nickname = localStorage.getItem('nickname') ?? '사용자'

  const rankingData = [
    { medal: medal1, name: '지구혼자쓰나', pt: '250 pt' },
    { medal: medal2, name: nickname, pt: '160 pt' },
    { medal: medal3, name: '분리수거의악마', pt: '160 pt' },
  ]

  return (
    <>
      {/* 고정 헤더 */}
      <header className="home-header">
        <img src={logo} alt="PLOGRiD" className="home-logo" />
      </header>

      {/* 스크롤 콘텐츠 */}
      <div className="home-page">

        {/* 메인배너 - Figma: x=14, y=101, w=367, h=111 */}
        <div className="home-banner">
          {/* 데코 ellipse */}
          <img src={ellipseLg} alt="" className="banner-ellipse-lg" />
          <img src={ellipseSm} alt="" className="banner-ellipse-sm1" />
          <img src={ellipseSm} alt="" className="banner-ellipse-sm2" />
          <img src={ellipseSm} alt="" className="banner-ellipse-sm3" />

          {/* 캐릭터: Figma left=226, top=16, w=127, h=121 / img: w=486.7%, h=411.55%, left=-132.54%, top=-54.4% */}
          <div className="banner-illust">
            <img src={bannerBird} alt="캐릭터" className="banner-bird" />
          </div>

          {/* 텍스트 */}
          <div className="banner-text">
            <p className="banner-title">
              <span className="banner-name">{nickname}님,</span> 오늘도 화이팅!
            </p>
            <p className="banner-sub">
              마지막 플로깅이 <span className="banner-day">15</span>일 전이에요
            </p>
            <button className="banner-btn" onClick={() => navigate('/map')}>
              <span className="banner-btn-text">전국 현황 확인</span>
              <img src={navNext} alt="" className="banner-btn-icon" />
            </button>
          </div>
        </div>

        {/* 최근 활동 */}
        <p className="home-section-title">최근 활동</p>
        <div className="home-activity">
          <div className="activity-row">
            <div className="activity-card">
              <div className="activity-icon-box">
                <img src={runIcon} alt="" className="activity-icon" />
              </div>
              <div className="activity-info">
                <p className="activity-label">이동거리</p>
                <p className="activity-value">
                  {recentActivity.distance != null
                    ? <><span className="activity-num">{recentActivity.distance}</span> km</>
                    : <span className="activity-empty">기록 없음</span>}
                </p>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-icon-box">
                <img src={clockIcon} alt="" className="activity-icon" />
              </div>
              <div className="activity-info">
                <p className="activity-label">진행시간</p>
                <p className="activity-value mint">
                  {recentActivity.duration ?? '00 : 00 : 00'}
                </p>
              </div>
            </div>
          </div>
          <div className="activity-card trash-card">
            <div className="activity-icon-box">
              <img src={trashIcon} alt="" className="activity-icon" />
            </div>
            <div className="activity-info">
              <p className="activity-label">수거한 쓰레기</p>
              <p className="activity-value">
                {recentActivity.trashCount != null
                  ? <><span className="activity-num">{recentActivity.trashCount}</span> 개 수거됨</>
                  : <span className="activity-empty">기록 없음</span>}
              </p>
            </div>
          </div>
        </div>

        {/* 분리배출 정보 배너 */}
        <div className="home-info-banner">
          <div className="info-banner-icon-box">
            <img src={cloverIcon} alt="" className="info-banner-icon" />
          </div>
          <div className="info-banner-text">
            <p className="info-banner-title">현재, 분리배출 정책은?</p>
            <p className="info-banner-sub">최신 분리배출 관련 이슈를 알려드려요</p>
          </div>
          <img src={navNext} alt="" className="info-banner-arrow" />
        </div>

        {/* 전국 주간 랭킹 */}
        <div className="home-section-header">
          <p className="home-section-title no-margin">전국 주간 랭킹</p>
          <button className="home-more-btn" onClick={() => navigate('/mypage')}>더보기</button>
        </div>
        <div className="home-ranking">
          {rankingData.map(({ medal, name, pt }) => (
            <div key={name} className="ranking-item">
              <img src={medal} alt="" className="ranking-medal" />
              <div className="ranking-avatar">
                <img src={defaultAvatar} alt="" className="ranking-avatar-img" />
              </div>
              <span className="ranking-name">{name}</span>
              <span className="ranking-pt">{pt}</span>
            </div>
          ))}
        </div>

        {/* 품목별 분리배출 방법 */}
        <p className="home-section-title">품목별 분리배출 방법</p>
        <div className="home-recycling">
          <div className="recycling-row">
            {RECYCLING_ROW1.map(({ icon, label }) => (
              <button key={label} className="recycling-item">
                <div className="recycling-icon-box">
                  <img src={icon} alt={label} className="recycling-icon" />
                </div>
                <span className="recycling-label">{label}</span>
              </button>
            ))}
          </div>
          <div className="recycling-row">
            {RECYCLING_ROW2.map(({ icon, label }) => (
              <button key={label} className="recycling-item">
                <div className="recycling-icon-box">
                  <img src={icon} alt={label} className="recycling-icon" />
                </div>
                <span className="recycling-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI 분리배출 안내 배너 */}
        <div className="home-ai-banner">
          <img src={cameraIcon} alt="" className="ai-banner-icon" />
          <div className="ai-banner-text">
            <p className="ai-banner-title">AI 분리배출 도우미</p>
            <p className="ai-banner-sub">사진을 찍으면 플로비가 분리배출 방법을 알려드려요</p>
          </div>
        </div>

      </div>

      <BottomNav />
    </>
  )
}
