import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import iconClover from '../../../assets/mypage/icon-clover.svg'
import iconCloverLight from '../../../assets/mypage/icon-clover-light.svg'
import iconRun from '../../../assets/mypage/icon-run.svg'
import iconTrash from '../../../assets/mypage/icon-trash.svg'
import iconCoin from '../../../assets/mypage/icon-coin.svg'
import iconPie from '../../../assets/mypage/icon-pie.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import Header from '../../../components/Header/Header'
import MyPageProfile from '../../../components/MyPageProfile/MyPageProfile'
import { getMyContribution } from '../../../api/member'
import type { MyContribution } from '../../../api/member'
import './Contribution.css'

const CATEGORIES = [
  { label: '비닐',    key: 'vinylCount'          as const, color: '#a0cfbd' },
  { label: '유리',    key: 'glassCount'          as const, color: '#9aced8' },
  { label: '종이',    key: 'paperCount'          as const, color: '#d8aaa3' },
  { label: '캔',      key: 'canCount'            as const, color: '#d6d3a0' },
  { label: '페트',    key: 'petCount'            as const, color: '#b7d9a8' },
  { label: '플라스틱', key: 'plasticCount'       as const, color: '#a8c2e2' },
  { label: '담배꽁초', key: 'cigaretteButtCount' as const, color: '#c8b6df' },
  { label: '기타',    key: 'etcCount'            as const, color: '#e0c0d0' },
]

interface Segment { label: string; pct: number; color: string }

// 피그마 스펙: viewBox 264×261, 링 center (130.7, 130.7), R=93.75, SW=67.5
const CX = 130.7, CY = 130.7, R = 88, SW = 32

const SEGMENT_GAP = 0

function WasteDonutChart({ segments }: { segments: Segment[] }) {
  const circ = 2 * Math.PI * R
  const usableCirc = circ - SEGMENT_GAP * segments.length
  let offset = 0
  const segs = segments.map(s => {
    const dash = (s.pct / 100) * usableCirc
    const seg = { ...s, dash, gap: circ - dash, offset }
    offset += dash + SEGMENT_GAP
    return seg
  })

  const getTextPos = (segOffset: number, dash: number) => {
    const midAngle = ((segOffset + dash / 2) / circ) * 360 - 90
    const rad = (midAngle * Math.PI) / 180
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) }
  }

  return (
    <div className="con-chart-card">
      {/* 헤더 아이콘 — 피그마: left=15, top=20, 31×32 */}
      <div className="con-chart-icon-box">
        <img src={iconPie} alt="" className="con-chart-icon-img" />
      </div>
      {/* 타이틀 — 피그마: left=53, top=27 */}
      <p className="con-chart-title">수거 쓰레기 유형</p>

      {/* 도넛 SVG — 피그마: left=42, top=67, 264×261 */}
      <div className="con-chart-svg-wrap">
        <svg viewBox="0 0 264 261" width="304" height="300">
          {/* 배경 링 — 데이터가 하나도 없을 때만 표시 */}
          {segs.length === 0 && (
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f0f0f0" strokeWidth={SW} />
          )}
          {/* 데이터 세그먼트 */}
          {segs.map(s => (
            <circle
              key={s.label}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={SW}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={circ / 4 - s.offset}
              strokeLinecap="butt"
            />
          ))}
          {/* 10% 이상 세그먼트에 퍼센트 텍스트 */}
          {segs.filter(s => s.pct >= 10).map(s => {
            const pos = getTextPos(s.offset, s.dash)
            return (
              <text
                key={s.label + '-lbl'}
                x={pos.x} y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fontWeight="700"
                fill="#fff"
              >
                {s.pct}%
              </text>
            )
          })}
        </svg>
        {/* 클로버 중앙 — 피그마: left=71, top=69, 120×120 */}
        <img src={iconCloverLight} alt="" className="con-chart-center" />
      </div>

      {/* 범례 — 피그마: 카드 내 left=297, top=12 (right=0) */}
      <div className="con-legend">
        {CATEGORIES.map(item => (
          <div key={item.label} className="con-legend-item">
            <span className="con-legend-dot" style={{ background: item.color }} />
            <span className="con-legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Contribution() {
  const navigate = useNavigate()

  const [data, setData] = useState<MyContribution | null>(null)

  useEffect(() => {
    getMyContribution().then(setData).catch(() => {})
  }, [])

  const statCards = [
    { icon: iconClover, label: '플로깅 횟수',  value: data ? String(data.ploggingCount) : '-',                        unit: '회' },
    { icon: iconRun,    label: '총 이동거리',   value: data ? (data.totalDistanceMeters / 1000).toFixed(1) : '-',     unit: 'km' },
    { icon: iconTrash,  label: '총 수거량',     value: data ? data.totalTrashCount.toLocaleString() : '-',            unit: '개' },
    { icon: iconCoin,   label: '환경기여 점수', value: data ? data.contributionScore.toLocaleString() : '-',          unit: 'pt' },
  ]

  const segments: Segment[] = (() => {
    const cat = data?.trashCategory
    if (!cat) return []
    const total = CATEGORIES.reduce((s, c) => s + (cat[c.key] ?? 0), 0)
    if (total === 0) return []
    return CATEGORIES
      .filter(c => (cat[c.key] ?? 0) > 0)
      .map(c => ({ label: c.label, color: c.color, pct: Math.round((cat[c.key] / total) * 100) }))
  })()

  return (
    <>
      <Header title="마이페이지" />

      <MyPageProfile />

      <div className="con-tabbar">
        <button className="con-tab active">환경 기여</button>
        <button className="con-tab" onClick={() => navigate('/mypage')}>주간 랭킹</button>
      </div>

      <div className="con-page">
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

        <WasteDonutChart segments={segments} />
      </div>

      <BottomNav />
    </>
  )
}
