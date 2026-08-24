import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import resultBird from '../../../assets/plogging/result-bird.png'
import resultNature from '../../../assets/plogging/result-nature.png'
import resultEllipse from '../../../assets/plogging/result-ellipse.svg'
import runIcon from '../../../assets/plogging/run.svg'
import trashIcon from '../../../assets/plogging/trash.svg'
import coinIcon from '../../../assets/plogging/coin.svg'
import cameraIcon from '../../../assets/home/icons/camera.svg'
import clockIcon from '../../../assets/home/icons/clock.svg'
import type { PloggingResult } from '../../../api/plogging'
import { getMyContribution } from '../../../api/member'
import './PloggingResultPage.css'

function formatDuration(seconds: number): string {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h} : ${m} : ${s}`
}

// trashSummary 퍼센트 키 → 표시 라벨/색상 매핑
const CHART_CATEGORIES = [
  { label: '비닐',    key: 'vinylPercentage'     as const, color: '#a0cfbd' },
  { label: '종이',    key: 'paperPercentage'      as const, color: '#d8aaa3' },
  { label: '유리',    key: 'glassPercentage'      as const, color: '#9aced8' },
  { label: '캔',      key: 'canPercentage'        as const, color: '#d6d3a0' },
  { label: '페트',    key: 'petBottlePercentage'  as const, color: '#b7d9a8' },
  { label: '플라스틱', key: 'plasticPercentage'   as const, color: '#a8c2e2' },
  { label: '담배꽁초', key: 'cigarettePercentage' as const, color: '#c8b6df' },
  { label: '스티로폼', key: 'styrofoamPercentage' as const, color: '#e0c0d0' },
]

interface ChartRow { label: string; pct: number; color: string }

// 피그마 345:943: 두 컬럼 바 차트
function TrashBarChart({ rows }: { rows: ChartRow[] }) {
  const half = Math.ceil(rows.length / 2)
  const leftRows = rows.slice(0, half)
  const rightRows = rows.slice(half)

  return (
    <div className="result-bar-chart">
      <div className="result-bar-col">
        {leftRows.map(row => (
          <div key={row.label} className="result-bar-row">
            <span className="result-bar-label">{row.label}</span>
            <div className="result-bar-track" />
            <span className="result-bar-pct">{row.pct}%</span>
          </div>
        ))}
      </div>
      <div className="result-bar-col">
        {rightRows.map(row => (
          <div key={row.label} className="result-bar-row">
            <span className="result-bar-label">{row.label}</span>
            <div className="result-bar-track" />
            <span className="result-bar-pct">{row.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PloggingResultPage() {
  const navigate = useNavigate()

  const raw = localStorage.getItem('ploggingResult')
  const result: PloggingResult | null = raw ? JSON.parse(raw) : null

  const distanceKm = result ? (result.distanceMeters / 1000).toFixed(2) : '0.00'
  const duration = result ? formatDuration(result.durationSeconds) : '00 : 00 : 00'
  const trashCount = result?.trashSummary?.totalCount ?? 0

  // GET /members/me/contribution → 누적 환경 기여 점수
  const [totalScore, setTotalScore] = useState<number | null>(null)
  useEffect(() => {
    getMyContribution()
      .then(data => setTotalScore(data.contributionScore))
      .catch(() => {})
  }, [])
  const score = totalScore ?? result?.contributionScore ?? 0

  // API trashSummary 퍼센트 필드를 바로 사용
  const chartRows: ChartRow[] = (() => {
    const summary = result?.trashSummary
    if (!summary) return []
    return CHART_CATEGORIES
      .filter(c => (summary[c.key] ?? 0) > 0)
      .map(c => ({ label: c.label, pct: summary[c.key], color: c.color }))
  })()

  const photos = result?.trashes?.slice(0, 4) ?? []

  return (
    <>
      <header className="plogging-header">
        <span className="plogging-title">플로깅</span>
      </header>

      <div className="result-page">
        <div className="result-hero">
          <div className="result-congrats">
            <p className="result-congrats-line">오늘도 지구를</p>
            <p className="result-congrats-line">깨끗하게 만들었어요!</p>
          </div>
          <img src={resultEllipse} alt="" className="result-ellipse-bg" />
          <div className="result-nature-wrap">
            <img src={resultNature} alt="" className="result-nature-img" />
          </div>
          <div className="result-bird-main-wrap">
            <img src={resultBird} alt="" className="result-bird-main" />
          </div>
          <div className="result-bird-sm-wrap">
            <img src={resultBird} alt="" className="result-bird-sm" />
          </div>
        </div>

        <div className="result-stats-row">
          <div className="result-stat-card">
            <div className="result-stat-icon-box">
              <img src={runIcon} alt="" className="result-stat-icon" />
            </div>
            <div>
              <p className="result-stat-label">이동거리</p>
              <p className="result-stat-value">
                <span className="result-stat-num">{distanceKm}</span> km
              </p>
            </div>
          </div>
          <div className="result-stat-card">
            <div className="result-stat-icon-box">
              <img src={clockIcon} alt="" className="result-stat-icon" />
            </div>
            <div>
              <p className="result-stat-label">진행시간</p>
              <p className="result-stat-value mint">{duration}</p>
            </div>
          </div>
        </div>

        <div className="result-trash-card">
          <div className="result-trash-header">
            <div className="result-stat-icon-box">
              <img src={trashIcon} alt="" className="result-stat-icon" />
            </div>
            <div>
              <p className="result-stat-label">수거한 쓰레기</p>
              <p className="result-stat-value">
                <span className="result-stat-num">{trashCount}</span> 개 수거됨
              </p>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="result-photo-grid">
              {photos.map(t => (
                <div key={t.trashId} className="result-photo-thumb">
                  {t.imageUrl
                    ? <img src={t.imageUrl} alt={t.category}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    : null
                  }
                </div>
              ))}
            </div>
          )}

          {chartRows.length > 0 && <TrashBarChart rows={chartRows} />}
        </div>

        <div className="result-ai-banner" onClick={() => navigate('/chat')}>
          <img src={cameraIcon} alt="" className="result-ai-icon" />
          <div>
            <p className="result-ai-title">상세한 분리배출 방법이 궁금하다면?</p>
            <p className="result-ai-sub">수거물 이미지를 클릭해보세요.</p>
          </div>
        </div>

        <div className="result-score-card">
          <div className="result-stat-icon-box">
            <img src={coinIcon} alt="" className="result-stat-icon" />
          </div>
          <div>
            <p className="result-stat-label">환경 기여 점수</p>
            <p className="result-stat-value">
              <span className="result-stat-num">{score.toLocaleString()}</span> pt
            </p>
          </div>
        </div>

        <button className="result-confirm-btn" onClick={() => navigate('/')}>확인</button>
      </div>
    </>
  )
}
