import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import locationIcon from '../../../assets/map/location.svg'
import clockIcon from '../../../assets/community/clock.svg'
import pinIcon from '../../../assets/community/location.svg'
import iconPlastic from '../../../assets/map/plastic.svg'
import iconGlass from '../../../assets/map/glass.svg'
import iconPaper from '../../../assets/map/paper.svg'
import iconCan from '../../../assets/map/can.svg'
import iconStyrofoam from '../../../assets/map/styrofoam.svg'
import iconVinyl from '../../../assets/map/vinyl.svg'
import iconCigarette from '../../../assets/map/cigarette.svg'
import iconPetBottle from '../../../assets/map/pet-bottle.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import Header from '../../../components/Header/Header'
import { getTrashesInViewport, getTrashDetail } from '../../../api/map'
import type { TrashMarker, TrashDetail, TrashCategory } from '../../../api/map'
import './MapPage.css'

declare global { interface Window { kakao: any } }

function waitForKakaoMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.kakao) { reject(new Error('kakao undefined')); return }
    if (window.kakao.maps?.Map) { resolve(); return }
    window.kakao.maps.load(() => resolve())
  })
}

// 마이페이지 환경 기여 도넛 차트 범례와 동일한 색상의 카테고리별 배지 아이콘
const CATEGORY_META: Record<TrashCategory, { label: string; icon: string }> = {
  PLASTIC: { label: '플라스틱', icon: iconPlastic },
  GLASS: { label: '유리', icon: iconGlass },
  PAPER: { label: '종이', icon: iconPaper },
  CAN: { label: '캔', icon: iconCan },
  STYROFOAM: { label: '스티로폼', icon: iconStyrofoam },
  VINYL: { label: '비닐', icon: iconVinyl },
  CIGARETTE: { label: '담배꽁초', icon: iconCigarette },
  PET_BOTTLE: { label: '페트', icon: iconPetBottle },
}

const MARKER_SIZE = 28

function formatCollectedAt(collectedAt: string): string {
  const d = new Date(collectedAt.replace(' ', 'T'))
  if (isNaN(d.getTime())) return collectedAt
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${hh}:${mm}`
}

export default function MapPage() {
  const navigate = useNavigate()
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const markerImagesRef = useRef<Record<TrashCategory, any>>({} as Record<TrashCategory, any>)
  const [selected, setSelected] = useState<TrashDetail | null>(null)
  const [activeId, setActiveId] = useState<number | null>(null)

  function closeDetail() {
    setSelected(null)
  }

  useEffect(() => {
    let cancelled = false

    waitForKakaoMaps().then(() => {
      if (cancelled) return
      const container = document.getElementById('map-kakao')
      if (!container) return
      const defaultPos = new window.kakao.maps.LatLng(37.5665, 126.9780)
      const map = new window.kakao.maps.Map(container, { center: defaultPos, level: 7 })
      mapRef.current = map

      const size = new window.kakao.maps.Size(MARKER_SIZE, MARKER_SIZE)
      markerImagesRef.current = Object.fromEntries(
        (Object.entries(CATEGORY_META) as [TrashCategory, { label: string; icon: string }][])
          .map(([category, meta]) => [category, new window.kakao.maps.MarkerImage(meta.icon, size)])
      ) as Record<TrashCategory, any>

      // 위치 이동
      navigator.geolocation?.getCurrentPosition(pos => {
        const latlng = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
        map.setCenter(latlng)
      })

      const loadMarkers = async () => {
        const bounds = map.getBounds()
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()
        try {
          const trashes = await getTrashesInViewport(sw.getLat(), ne.getLat(), sw.getLng(), ne.getLng())
          // 기존 마커 제거
          markersRef.current.forEach(m => m.setMap(null))
          markersRef.current = []

          trashes.forEach((trash: TrashMarker) => {
            const pos = new window.kakao.maps.LatLng(trash.latitude, trash.longitude)
            const image = markerImagesRef.current[trash.category]
            const marker = new window.kakao.maps.Marker({ position: pos, map, image })
            window.kakao.maps.event.addListener(marker, 'click', async () => {
              try {
                const detail = await getTrashDetail(trash.id)
                setActiveId(trash.id)
                setSelected(detail)
              } catch {
                setSelected(null)
              }
            })
            markersRef.current.push(marker)
          })
        } catch {}
      }

      loadMarkers()
      window.kakao.maps.event.addListener(map, 'idle', loadMarkers)
    }).catch(console.error)

    return () => { cancelled = true }
  }, [])

  function moveToMyLocation() {
    navigator.geolocation?.getCurrentPosition(pos => {
      const latlng = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
      mapRef.current?.setCenter(latlng)
    })
  }

  const meta = selected && CATEGORY_META[selected.category]

  return (
    <>
      <Header title="전국 현황" onBack={() => navigate('/')} />

      <div id="map-kakao" className="map-area" onClick={closeDetail} />

      <button className="map-location-pill" onClick={moveToMyLocation} aria-label="내 위치">
        <img src={locationIcon} alt="" className="map-location-icon" />
      </button>

      {selected && meta && (
        <div key={activeId} className="map-detail-card" onClick={e => e.stopPropagation()}>
          {selected.imageUrl && (
            <img src={selected.imageUrl} alt="" className="map-detail-photo" />
          )}

          <div className="map-detail-body">
            <div className="map-detail-header">
              <img src={meta.icon} alt="" className="map-detail-badge" />
              <span className="map-detail-category">{meta.label}</span>
            </div>

            <div className="map-detail-row">
              <div className="map-detail-icon-box">
                <img src={clockIcon} alt="" className="map-detail-icon" />
              </div>
              <div className="map-detail-text">
                <p className="map-detail-label">수거 일시</p>
                <p className="map-detail-value">{formatCollectedAt(selected.collectedAt)}</p>
              </div>
            </div>

            <div className="map-detail-row">
              <div className="map-detail-icon-box">
                <img src={pinIcon} alt="" className="map-detail-icon" />
              </div>
              <div className="map-detail-text">
                <p className="map-detail-label">수거 위치</p>
                <p className="map-detail-value">{selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}</p>
              </div>
            </div>
          </div>

          <button className="map-detail-close" onClick={closeDetail} aria-label="닫기">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <BottomNav />
    </>
  )
}
