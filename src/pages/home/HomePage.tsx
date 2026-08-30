import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/auth/logo.png'
import defaultAvatar from '../../assets/mypage/default-avatar.png'
import mainBanner from '../../assets/home/main-banner.png'
import navNext from '../../assets/home/icons/nav-next.svg'
import runIcon from '../../assets/home/icons/run.svg'
import clockIcon from '../../assets/home/icons/clock.svg'
import trashIcon from '../../assets/home/icons/trash.svg'
import aiBannerImg from '../../assets/home/ai-banner-mascot.png'
import infoBannerImg from '../../assets/home/start-plogging-banner.png'
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
import { getRecentPlogging } from '../../api/plogging'
import { getRanking } from '../../api/member'
import type { RankItem } from '../../api/member'
import './HomePage.css'

const MEDALS = [medal1, medal2, medal3]

function daysAgo(dateStr: string): number {
  const then = new Date(dateStr).getTime()
  const diffMs = Date.now() - then
  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)))
}

const RECYCLING_ROW1 = [
  { icon: petIcon, label: '페트', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110103' },
  { icon: paperIcon, label: '종이', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110101' },
  { icon: paperPackIcon, label: '종이팩', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110102' },
  { icon: glassIcon, label: '유리', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110107' },
  { icon: vinylIcon, label: '비닐', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110105' },
  { icon: batteryCellIcon, label: '전지', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110110' },
]

const RECYCLING_ROW2 = [
  { icon: metalIcon, label: '금속류', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110108' },
  { icon: plasticIcon, label: '플라스틱', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110104' },
  { icon: lampIcon, label: '조명제품', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110111' },
  { icon: foamIcon, label: '발포합성수지', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110106' },
  { icon: clothingIcon, label: '의류/원단', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110109' },
  { icon: electronicsIcon, label: '전기전자제품', link: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=110112' },
]

function formatDuration(seconds: number): string {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h} : ${m} : ${s}`
}

export default function HomePage() {
  const navigate = useNavigate()
  const nickname = localStorage.getItem('nickname') ?? '사용자'

  const [recent, setRecent] = useState<{ distanceMeters: number; durationSeconds: number; trashCount: number } | null>(null)
  const [topRankings, setTopRankings] = useState<RankItem[]>([])

  useEffect(() => {
    getRecentPlogging().then(setRecent).catch(() => {})
    getRanking().then((r) => setTopRankings(r.topRankings.slice(0, 3))).catch(() => {})
  }, [])

  return (
    <>
      <header className="home-header">
        <img src={logo} alt="PLOGRiD" className="home-logo" />
      </header>

      <div className="home-page">

        {/* 메인배너 */}
        <div className="home-banner">
          <img src={mainBanner} alt="" className="banner-bg" />
          <div className="banner-text">
            <p className="banner-title">
              <span className="banner-name">{nickname}님,</span> 오늘도 화이팅!
            </p>
            <p className="banner-sub">
              {recent
                ? `마지막 플로깅이 ${daysAgo(recent.createdAt)}일 전이에요`
                : '아직 플로깅 기록이 없어요'}
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
                  {recent
                    ? <><span className="activity-num">{(recent.distanceMeters / 1000).toFixed(2)}</span> km</>
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
                  {recent ? formatDuration(recent.durationSeconds) : '00 : 00 : 00'}
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
                {recent
                  ? <><span className="activity-num">{recent.trashCount}</span> 개 수거됨</>
                  : <span className="activity-empty">기록 없음</span>}
              </p>
            </div>
          </div>
        </div>

        {/* 분리배출 정보 배너 */}
        <button className="home-info-banner" onClick={() => navigate('/plogging')}>
          <img src={infoBannerImg} alt="지금 플로깅 시작하기 - 우리 동네를 깨끗하게 만들어요" className="info-banner-img" />
        </button>

        {/* 전국 주간 랭킹 */}
        <div className="home-section-header">
          <p className="home-section-title no-margin">전국 주간 랭킹</p>
          <button className="home-more-btn" onClick={() => navigate('/mypage')}>더보기</button>
        </div>
        <div className="home-ranking">
          {topRankings.map((item, i) => (
            <div key={item.memberId} className="ranking-item">
              <img src={MEDALS[i]} alt={`${item.rank}위`} className="home-ranking-medal" />
              <div className="home-ranking-avatar">
                <img src={defaultAvatar} alt="" className="home-ranking-avatar-img" />
              </div>
              <span className="ranking-name">{item.nickName}</span>
              <span className="ranking-pt">{item.contributionScore} pt</span>
            </div>
          ))}
        </div>

        {/* 품목별 분리배출 방법 */}
        <p className="home-section-title">품목별 분리배출 방법</p>
        <div className="home-recycling">
          <div className="recycling-row">
            {RECYCLING_ROW1.map(({ icon, label, link }) => (
              <button
                key={label}
                className="recycling-item"
                onClick={() => (link ? window.open(link, '_blank', 'noopener,noreferrer') : navigate('/chat'))}
              >
                <div className="recycling-icon-box">
                  <img src={icon} alt={label} className="recycling-icon" />
                </div>
                <span className="recycling-label">{label}</span>
              </button>
            ))}
          </div>
          <div className="recycling-row">
            {RECYCLING_ROW2.map(({ icon, label, link }) => (
              <button
                key={label}
                className="recycling-item"
                onClick={() => (link ? window.open(link, '_blank', 'noopener,noreferrer') : navigate('/chat'))}
              >
                <div className="recycling-icon-box">
                  <img src={icon} alt={label} className="recycling-icon" />
                </div>
                <span className="recycling-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI 분리배출 안내 배너 */}
        <button className="home-ai-banner" onClick={() => navigate('/chat')}>
          <img src={aiBannerImg} alt="AI 분리배출 도우미 - 사진을 찍으면 플로비가 분리배출 방법을 알려드려요" className="ai-banner-img" />
        </button>

      </div>

      <BottomNav />
    </>
  )
}
