import { useNavigate } from 'react-router-dom'
import defaultAvatar from '../../../assets/mypage/default-avatar.png'
import navNextIcon from '../../../assets/home/icons/nav-next.svg'
import iconClover from '../../../assets/mypage/icon-clover.svg'
import iconRun from '../../../assets/mypage/icon-run.svg'
import iconTrash from '../../../assets/mypage/icon-trash.svg'
import iconCoin from '../../../assets/mypage/icon-coin.svg'
import chartWaste from '../../../assets/mypage/chart-waste.png'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './Contribution.css'

const statCards = [
  { icon: iconClover, label: '플로깅 횟수',  value: '47',     unit: '회' },
  { icon: iconRun,    label: '총 이동거리',   value: '182.3',  unit: 'km' },
  { icon: iconTrash,  label: '총 수거량',     value: '12,307', unit: '개' },
  { icon: iconCoin,   label: '환경기여 점수', value: '1,320',  unit: 'pt' },
]

const legendItems = [
  { color: '#a0cfbd', label: '비닐' },
  { color: '#9aced8', label: '유리' },
  { color: '#d8aaa3', label: '종이' },
  { color: '#d6d3a0', label: '캔' },
  { color: '#b7d9a8', label: '페트' },
  { color: '#a8c2e2', label: '플라스틱' },
  { color: '#c8b6df', label: '담배꽁초' },
  { color: '#e0c0d0', label: '기타' },
]

export default function Contribution() {
  const navigate = useNavigate()
  const nickname = localStorage.getItem('nickname') ?? '사용자'

  return (
    <>
      <header className="con-header">
        <span className="con-header-title">마이페이지</span>
      </header>

      <div className="con-profile-section">
        <div className="con-avatar">
          <img src={defaultAvatar} alt="프로필" className="con-avatar-img" />
        </div>
        <div className="con-profile-info">
          <span className="con-profile-name">{nickname}</span>
          <span className="con-profile-email">ddkkssj123@gmail.com</span>
        </div>
        <button className="con-profile-arrow" onClick={() => navigate('/mypage/etc')}>
          <img src={navNextIcon} alt="더보기" />
        </button>
      </div>

      <div className="con-tabbar">
        <button className="con-tab active">환경 기여</button>
        <button className="con-tab" onClick={() => navigate('/mypage')}>주간 랭킹</button>
      </div>

      <div className="con-page">
        {/* 2×2 stat 카드 그리드 */}
        <div className="con-grid">
          {statCards.map((card) => (
            <div key={card.label} className="con-card">
              <div className="con-card-icon-box">
                <img src={card.icon} alt="" className="con-card-icon" />
              </div>
              <div className="con-card-text">
                <p className="con-card-label">{card.label}</p>
                <p className="con-card-value">
                  <span className="con-card-num">{card.value}</span>
                  {' '}<span className="con-card-unit">{card.unit}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 수거 쓰레기 유형 차트 */}
        <div className="con-chart-section">
          <div className="con-chart-header">
            <div className="con-card-icon-box">
              <img src={iconClover} alt="" className="con-card-icon" />
            </div>
            <p className="con-chart-title">수거 쓰레기 유형</p>
          </div>
          <div className="con-chart-body">
            <img src={chartWaste} alt="쓰레기 유형 차트" className="con-chart-img" />
            <div className="con-legend">
              {legendItems.map((item) => (
                <div key={item.label} className="con-legend-item">
                  <span className="con-legend-dot" style={{ background: item.color }} />
                  <span className="con-legend-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  )
}
