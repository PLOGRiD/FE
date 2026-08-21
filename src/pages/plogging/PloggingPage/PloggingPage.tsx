import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import bagImg from '../../../assets/plogging/bag.png'
import ellipseImg from '../../../assets/plogging/ellipse.svg'
import loadingIcon from '../../../assets/plogging/loading.svg'
import checkIcon from '../../../assets/plogging/check.svg'
import backIcon from '../../../assets/map/back.svg'
import runIcon from '../../../assets/plogging/run.svg'
import trashIcon from '../../../assets/plogging/trash.svg'
import bellIcon from '../../../assets/plogging/bell.svg'
import clockIcon from '../../../assets/home/icons/clock.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './PloggingPage.css'

declare global {
  interface Window { kakao: any }
}

function waitForKakaoMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.kakao) { reject(new Error('kakao undefined')); return }
    if (window.kakao.maps?.Map) { resolve(); return }
    window.kakao.maps.load(() => resolve())
  })
}

type Stage = 'waiting' | 'camera' | 'connected' | 'running'

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const TRASH_CHIPS = [
  { label: '비닐', count: 5, color: '#a0cfbd' },
  { label: '플라스틱', count: 3, color: '#d6d3a0' },
  { label: '유리', count: 1, color: '#9aced8' },
  { label: '종이', count: 1, color: '#b7d9a8' },
]

export default function PloggingPage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('waiting')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // running state
  const [seconds, setSeconds] = useState(0)
  const [distance, setDistance] = useState(0)
  const [trashCount, setTrashCount] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const polylineRef = useRef<any>(null)
  const pathRef = useRef<{ lat: number; lng: number }[]>([])
  const watchIdRef = useRef<number>(-1)

  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  const timerDisplay = `${h} : ${m} : ${s}`

  // timer
  useEffect(() => {
    if (stage !== 'running') return
    const id = setInterval(() => setSeconds(prev => prev + 1), 1000)
    return () => clearInterval(id)
  }, [stage])

  // mock trash detection
  useEffect(() => {
    if (stage !== 'running') return
    const id = setInterval(() => {
      setTrashCount(c => c + 1)
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }, 20000)
    return () => clearInterval(id)
  }, [stage])

  // kakao map + geolocation
  useEffect(() => {
    if (stage !== 'running') return

    const startTracking = (map: any, marker: any) => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        const latlng = new window.kakao.maps.LatLng(lat, lng)
        map.setCenter(latlng)
        marker.setPosition(latlng)
        pathRef.current = [{ lat, lng }]
      })
      watchIdRef.current = navigator.geolocation.watchPosition(pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        const latlng = new window.kakao.maps.LatLng(lat, lng)
        marker.setPosition(latlng)
        map.panTo(latlng)
        pathRef.current = [...pathRef.current, { lat, lng }]
        if (pathRef.current.length >= 2) {
          let total = 0
          for (let i = 1; i < pathRef.current.length; i++) {
            const a = pathRef.current[i - 1], b = pathRef.current[i]
            total += haversine(a.lat, a.lng, b.lat, b.lng)
          }
          setDistance(total)
        }
        polylineRef.current?.setMap(null)
        const poly = new window.kakao.maps.Polyline({
          path: pathRef.current.map(p => new window.kakao.maps.LatLng(p.lat, p.lng)),
          strokeWeight: 4, strokeColor: '#a0cfbd', strokeOpacity: 0.9, strokeStyle: 'solid',
        })
        poly.setMap(map)
        polylineRef.current = poly
      }, undefined, { enableHighAccuracy: true, maximumAge: 2000 })
    }

    let cancelled = false

    waitForKakaoMaps().then(() => {
      if (cancelled) return
      const container = document.getElementById('kakao-map')
      if (!container) return
      const defaultPos = new window.kakao.maps.LatLng(37.5665, 126.9780)
      const map = new window.kakao.maps.Map(container, { center: defaultPos, level: 3 })
      map.relayout()
      mapRef.current = map
      const marker = new window.kakao.maps.Marker({ position: defaultPos, map })
      markerRef.current = marker
      startTracking(map, marker)
    }).catch(console.error)

    return () => {
      cancelled = true
      if (watchIdRef.current !== -1) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = -1
      }
    }
  }, [stage])

  // camera stage
  useEffect(() => {
    if (stage !== 'camera') return
    let timer: ReturnType<typeof setTimeout>
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        timer = setTimeout(() => {
          stream.getTracks().forEach(t => t.stop())
          streamRef.current = null
          setStage('connected')
        }, 3000)
      })
      .catch(() => setStage('connected'))
    return () => {
      clearTimeout(timer)
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [stage])

  const handleStop = () => {
    if (watchIdRef.current !== -1) navigator.geolocation.clearWatch(watchIdRef.current)
    localStorage.setItem('ploggingResult', JSON.stringify({
      distance: distance.toFixed(2),
      duration: timerDisplay,
      trashCount,
    }))
    navigate('/plogging/result')
  }

  /* ── 플로깅 진행 중 화면 ── */
  if (stage === 'running') {
    return (
      <div className="pr-running-wrap">
        <header className="plogging-header">
          <span className="plogging-title">플로깅</span>
        </header>

        <div id="kakao-map" className="pr-map" />

        {showAlert && (
          <div className="pr-alert">
            <img src={bellIcon} alt="" className="pr-alert-icon" />
            수거가 감지되었어요!
          </div>
        )}

        <div className="pr-sheet">
          <div className="pr-handle" />

          <div className="pr-stats-row">
            <div className="pr-stat-card">
              <div className="pr-stat-icon-box">
                <img src={runIcon} alt="" className="pr-stat-icon" />
              </div>
              <div className="pr-stat-info">
                <p className="pr-stat-label">이동거리</p>
                <p className="pr-stat-value">
                  <span className="pr-stat-num">{distance.toFixed(2)}</span> km
                </p>
              </div>
            </div>
            <div className="pr-stat-card">
              <div className="pr-stat-icon-box">
                <img src={clockIcon} alt="" className="pr-stat-icon" />
              </div>
              <div className="pr-stat-info">
                <p className="pr-stat-label">진행시간</p>
                <p className="pr-stat-value mint">{timerDisplay}</p>
              </div>
            </div>
          </div>

          <div className="pr-trash-card">
            <div className="pr-stat-icon-box">
              <img src={trashIcon} alt="" className="pr-stat-icon" />
            </div>
            <div className="pr-stat-info">
              <p className="pr-stat-label">자동수거감지</p>
              <p className="pr-stat-value">
                <span className="pr-stat-num">{trashCount}</span> 개 수거됨
              </p>
            </div>
          </div>

          <div className="pr-chips">
            {TRASH_CHIPS.map(chip => (
              <span key={chip.label} className="pr-chip" style={{ background: chip.color }}>
                {chip.label} x{chip.count}
              </span>
            ))}
          </div>

          <button className="pr-stop-btn" onClick={handleStop}>
            ■ 플로깅 종료
          </button>
        </div>
      </div>
    )
  }

  /* ── 연결 흐름 화면 ── */
  return (
    <>
      <header className="plogging-header">
        <button className="plogging-back-btn" onClick={() => navigate('/')}>
          <img src={backIcon} alt="뒤로" className="plogging-back-icon" />
        </button>
        <span className="plogging-title">플로깅</span>
      </header>

      <div className="plogging-page">
        <p className="plogging-main-title">디바이스 연결</p>

        {stage !== 'connected' && (
          <p className="plogging-sub">
            카메라에 전용 스마트 수거 디바이스의<br />QR 코드를 비추어 주세요
          </p>
        )}

        <div className="plogging-bag-area">
          <div className="plogging-bag-container">
            <img src={bagImg} alt="플로깅 백" className="plogging-bag-img" />
          </div>
          <div className="plogging-ellipse-container">
            <img src={ellipseImg} alt="" className="plogging-ellipse-img" />
          </div>
        </div>

        {stage === 'waiting' && (
          <>
            <p className="plogging-wait-title">연결 대기 중</p>
            <div className="plogging-loading">
              <img src={loadingIcon} alt="" className="plogging-loading-icon" />
            </div>
            <div className="plogging-qr-border plogging-qr-tap" onClick={() => setStage('camera')}>
              <div className="plogging-qr-corners">
                <span className="qr-corner tl" /><span className="qr-corner tr" />
                <span className="qr-corner bl" /><span className="qr-corner br" />
              </div>
              <p className="plogging-qr-hint">탭하여 카메라로 QR 스캔</p>
            </div>
          </>
        )}

        {stage === 'camera' && (
          <>
            <p className="plogging-wait-title">QR 스캔 중...</p>
            <div className="plogging-loading" style={{ height: 24 }} />
            <div className="plogging-qr-border">
              <video ref={videoRef} className="plogging-camera-video" playsInline autoPlay muted />
              <div className="plogging-qr-corners">
                <span className="qr-corner tl" /><span className="qr-corner tr" />
                <span className="qr-corner bl" /><span className="qr-corner br" />
              </div>
              <p className="plogging-scanning-text">스캔 중...</p>
            </div>
          </>
        )}

        {stage === 'connected' && (
          <>
            <p className="plogging-connected-title">연결 완료 - 156</p>
            <div className="plogging-connected-check">
              <img src={checkIcon} alt="" className="plogging-check-icon" />
            </div>
            <p className="plogging-connected-sub">스마트 수거 디바이스 연동에 성공하였습니다</p>
            <p className="plogging-connected-sub2">이제 플로깅을 시작할 수 있어요</p>
            <button className="plogging-done-btn" onClick={() => setStage('running')}>
              플로깅 시작
            </button>
          </>
        )}
      </div>

      <BottomNav />
    </>
  )
}
