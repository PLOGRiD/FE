import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import locationIcon from '../../../assets/map/location.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import Header from '../../../components/Header/Header'
import { getTrashesInViewport, getTrashDetail } from '../../../api/map'
import type { TrashMarker, TrashDetail } from '../../../api/map'
import './MapPage.css'

declare global { interface Window { kakao: any } }

function waitForKakaoMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.kakao) { reject(new Error('kakao undefined')); return }
    if (window.kakao.maps?.Map) { resolve(); return }
    window.kakao.maps.load(() => resolve())
  })
}

export default function MapPage() {
  const navigate = useNavigate()
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [selected, setSelected] = useState<TrashDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    let cancelled = false

    waitForKakaoMaps().then(() => {
      if (cancelled) return
      const container = document.getElementById('map-kakao')
      if (!container) return
      const defaultPos = new window.kakao.maps.LatLng(37.5665, 126.9780)
      const map = new window.kakao.maps.Map(container, { center: defaultPos, level: 7 })
      mapRef.current = map

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
            const marker = new window.kakao.maps.Marker({ position: pos, map })
            window.kakao.maps.event.addListener(marker, 'click', async () => {
              setLoadingDetail(true)
              try {
                const detail = await getTrashDetail(trash.id)
                setSelected(detail)
              } catch {
                setSelected(null)
              } finally {
                setLoadingDetail(false)
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

  return (
    <>
      <Header title="전국 현황" onBack={() => navigate('/')} variant="end" />

      <div id="map-kakao" className="map-area" onClick={() => setSelected(null)} />

      <button className="map-location-pill" onClick={moveToMyLocation}>
        <img src={locationIcon} alt="" className="map-location-icon" />
        <span className="map-location-text">내 위치</span>
      </button>

      {(selected || loadingDetail) && (
        <div className="map-bottom-sheet" onClick={e => e.stopPropagation()}>
          <div className="map-sheet-handle" />
          {loadingDetail ? (
            <p style={{ textAlign: 'center', padding: '16px 0', color: '#999' }}>불러오는 중...</p>
          ) : selected && (
            <>
              <p className="map-sheet-region">{selected.category}</p>
              <p className="map-sheet-title">수거 쓰레기 상세</p>
              {selected.imageUrl && (
                <img src={selected.imageUrl} alt="" style={{ width: '100%', borderRadius: 8, marginTop: 8, objectFit: 'cover', maxHeight: 160 }} />
              )}
              <div className="map-sheet-stats">
                <div className="map-stat">
                  <p className="map-stat-value">{selected.category}</p>
                  <p className="map-stat-label">분류</p>
                </div>
                <div className="map-stat-divider" />
                <div className="map-stat">
                  <p className="map-stat-value" style={{ fontSize: 13 }}>{selected.collectedAt?.slice(0, 10) ?? '-'}</p>
                  <p className="map-stat-label">수거일</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <BottomNav />
    </>
  )
}
