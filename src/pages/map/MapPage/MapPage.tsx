import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import mapBg from '../../../assets/map/map-bg.png'
import markerIcon from '../../../assets/map/marker.svg'
import locationIcon from '../../../assets/map/location.svg'
import backIcon from '../../../assets/map/back.svg'
import filterHomeIcon from '../../../assets/map/filter-home.svg'
import filterBookIcon from '../../../assets/map/filter-book.svg'
import filterBookmarkIcon from '../../../assets/map/filter-bookmark.svg'
import filterCafeIcon from '../../../assets/map/filter-cafe.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './MapPage.css'

export default function MapPage() {
  const navigate = useNavigate()
  const [markerOpen, setMarkerOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState(3) // Figma에서 '북카페' 활성

  const FILTERS = [
    { label: '북스테이', icon: filterHomeIcon },
    { label: '독립서점', icon: filterBookIcon },
    { label: '공간책갈피', icon: filterBookmarkIcon },
    { label: '북카페', icon: filterCafeIcon },
  ]

  return (
    <>
      {/* Figma 345:1087: 헤더 */}
      <header className="map-header">
        <button className="map-back-btn" onClick={() => navigate('/')}>
          <img src={backIcon} alt="뒤로" className="map-back-icon" />
        </button>
        <span className="map-title">전국 현황</span>
      </header>

      {/* Figma 345:1152~1167: 필터 버튼들 top=116 */}
      <div className="map-filters">
        {FILTERS.map((f, i) => (
          <button
            key={f.label}
            className={`map-filter-btn ${activeFilter === i ? 'active' : ''}`}
            onClick={() => setActiveFilter(i)}
          >
            <img src={f.icon} alt="" className="map-filter-icon" />
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Figma 345:1086: 지도 이미지 left=-10, top=31 (frame 기준) */}
      <div className="map-area" onClick={() => setMarkerOpen(false)}>
        <img src={mapBg} alt="지도" className="map-bg" />
        {/* Figma 346:209: 마커 inset 20.31% 7.47% 18.47% 3.05% */}
        <button
          className="map-marker"
          onClick={e => { e.stopPropagation(); setMarkerOpen(true) }}
        >
          <img src={markerIcon} alt="" className="map-marker-img" />
        </button>
      </div>

      {/* Figma 345:1169: 현위치 모달 w=131, h=42, border #a0cfbd, radius=30 */}
      <div className="map-location-pill">
        <img src={locationIcon} alt="" className="map-location-icon" />
        <span className="map-location-text">서울시 강서구</span>
      </div>

      {/* 마커 클릭 바텀시트 (Figma 345:1173 마커클릭 화면) */}
      {markerOpen && (
        <div className="map-bottom-sheet">
          <div className="map-sheet-handle" />
          <p className="map-sheet-region">서울시 강서구</p>
          <p className="map-sheet-title">이번 주 플로깅 현황</p>
          <div className="map-sheet-stats">
            <div className="map-stat">
              <p className="map-stat-value">128<span>명</span></p>
              <p className="map-stat-label">참여자 수</p>
            </div>
            <div className="map-stat-divider" />
            <div className="map-stat">
              <p className="map-stat-value">3.2<span>km</span></p>
              <p className="map-stat-label">이동거리</p>
            </div>
            <div className="map-stat-divider" />
            <div className="map-stat">
              <p className="map-stat-value">456<span>개</span></p>
              <p className="map-stat-label">수거 쓰레기</p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  )
}
