import { useNavigate } from 'react-router-dom'
import bannerBird from '../../../assets/home/banner-bird.png'
import ellipseLg from '../../../assets/home/ellipse-lg.svg'
import runIcon from '../../../assets/plogging/run.svg'
import trashIcon from '../../../assets/plogging/trash.svg'
import coinIcon from '../../../assets/plogging/coin.svg'
import cameraIcon from '../../../assets/home/icons/camera.svg'
import clockIcon from '../../../assets/home/icons/clock.svg'
import './PloggingResultPage.css'

const CHART_LEFT = [
  { label: '비닐', pct: 29 },
  { label: '종이', pct: 6 },
  { label: '유리', pct: 6 },
  { label: '캔', pct: 0 },
  { label: '페트', pct: 0 },
]
const CHART_RIGHT = [
  { label: '플라스틱', pct: 18 },
  { label: '담배꽁초', pct: 0 },
]

export default function PloggingResultPage() {
  const navigate = useNavigate()

  const raw = localStorage.getItem('ploggingResult')
  const result = raw ? JSON.parse(raw) : { distance: '0.00', duration: '00 : 00 : 00', trashCount: 0 }

  return (
    <>
      <header className="plogging-header">
        <span className="plogging-title">플로깅</span>
      </header>

      <div className="result-page">
        {/* 축하 일러스트 + 텍스트 */}
        <div className="result-hero">
          <div className="result-congrats">
            <p className="result-congrats-line">오늘도 지구를</p>
            <p className="result-congrats-line">깨끗하게 만들었어요!</p>
          </div>
          <div className="result-illust">
            <img src={ellipseLg} alt="" className="result-ellipse" />
            <div className="result-bird-wrap">
              <img src={bannerBird} alt="" className="result-bird" />
            </div>
          </div>
        </div>

        {/* 이동거리 · 진행시간 */}
        <div className="result-stats-row">
          <div className="result-stat-card">
            <div className="result-stat-icon-box">
              <img src={runIcon} alt="" className="result-stat-icon" />
            </div>
            <div>
              <p className="result-stat-label">이동거리</p>
              <p className="result-stat-value">
                <span className="result-stat-num">{result.distance}</span> km
              </p>
            </div>
          </div>
          <div className="result-stat-card">
            <div className="result-stat-icon-box">
              <img src={clockIcon} alt="" className="result-stat-icon" />
            </div>
            <div>
              <p className="result-stat-label">진행시간</p>
              <p className="result-stat-value mint">{result.duration}</p>
            </div>
          </div>
        </div>

        {/* 수거한 쓰레기 카드 */}
        <div className="result-trash-card">
          <div className="result-trash-header">
            <div className="result-stat-icon-box">
              <img src={trashIcon} alt="" className="result-stat-icon" />
            </div>
            <div>
              <p className="result-stat-label">수거한 쓰레기</p>
              <p className="result-stat-value">
                <span className="result-stat-num">{result.trashCount}</span> 개 수거됨
              </p>
            </div>
          </div>

          {/* 사진 그리드 (플레이스홀더) */}
          <div className="result-photo-grid">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="result-photo-thumb" />
            ))}
          </div>

          {/* 카테고리 바 차트 */}
          <div className="result-charts">
            <div className="result-chart-col">
              {CHART_LEFT.map(row => (
                <div key={row.label} className="result-chart-row">
                  <span className="result-chart-label">{row.label}</span>
                  <div className="result-bar-bg">
                    <div className="result-bar-fill" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="result-chart-pct">{row.pct} %</span>
                </div>
              ))}
            </div>
            <div className="result-chart-col">
              {CHART_RIGHT.map(row => (
                <div key={row.label} className="result-chart-row">
                  <span className="result-chart-label">{row.label}</span>
                  <div className="result-bar-bg">
                    <div className="result-bar-fill" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="result-chart-pct">{row.pct} %</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI 분리배출 배너 */}
        <div className="result-ai-banner">
          <img src={cameraIcon} alt="" className="result-ai-icon" />
          <div>
            <p className="result-ai-title">상세한 분리배출 방법이 궁금하다면?</p>
            <p className="result-ai-sub">수거물 이미지를 클릭해보세요.</p>
          </div>
        </div>

        {/* 환경 기여 점수 */}
        <div className="result-score-card">
          <div className="result-stat-icon-box">
            <img src={coinIcon} alt="" className="result-stat-icon" />
          </div>
          <div>
            <p className="result-stat-label">환경 기여 점수</p>
            <p className="result-stat-value">
              <span className="result-stat-num">+ 1,320</span> pt
            </p>
          </div>
        </div>

        {/* 확인 버튼 */}
        <button className="result-confirm-btn" onClick={() => navigate('/')}>
          확인
        </button>
      </div>
    </>
  )
}
