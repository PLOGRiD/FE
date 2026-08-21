import { useState, useRef, useEffect, useCallback } from 'react'
import jsQR from 'jsqr'
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
import { startPlogging, updateLocation, endPlogging, linkDevice, BASE_URL } from '../../../api/plogging'
import './PloggingPage.css'

declare global { interface Window { kakao: any } }

function waitForKakaoMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.kakao) { reject(new Error('kakao undefined')); return }
    if (window.kakao.maps?.Map) { resolve(); return }
    window.kakao.maps.load(() => resolve())
  })
}

type Stage = 'idle' | 'waiting' | 'camera' | 'connected' | 'running'

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface TrashChip { label: string; count: number; color: string }

export default function PloggingPage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [seconds, setSeconds] = useState(0)
  const [distance, setDistance] = useState(0)
  const [trashChips, setTrashChips] = useState<TrashChip[]>([])
  const [totalTrash, setTotalTrash] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')

  const ploggingIdRef = useRef<number | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const polylineRef = useRef<any>(null)
  const pathRef = useRef<{ lat: number; lng: number }[]>([])
  const watchIdRef = useRef<number>(-1)
  const sseRef = useRef<EventSource | null>(null)
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  const timerDisplay = `${h} : ${m} : ${s}`

  useEffect(() => {
    if (stage !== 'running') return
    const id = setInterval(() => setSeconds(prev => prev + 1), 1000)
    return () => clearInterval(id)
  }, [stage])

  // 카카오맵 + 위치 추적
  useEffect(() => {
    if (stage !== 'running') return
    let cancelled = false

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

    const getInitialPos = (): Promise<{ lat: number; lng: number }> =>
      new Promise((resolve) => {
        navigator.geolocation?.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve({ lat: 37.5665, lng: 126.9780 }),
          { timeout: 5000 }
        )
      })

    Promise.all([waitForKakaoMaps(), getInitialPos()]).then(([, pos]) => {
      if (cancelled) return
      const container = document.getElementById('kakao-map')
      if (!container) return
      const initialLatLng = new window.kakao.maps.LatLng(pos.lat, pos.lng)
      const map = new window.kakao.maps.Map(container, { center: initialLatLng, level: 3 })
      map.relayout()
      mapRef.current = map
      const marker = new window.kakao.maps.Marker({ position: initialLatLng, map })
      markerRef.current = marker
      pathRef.current = [pos]
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

  // API 위치 전송 (10초마다)
  useEffect(() => {
    if (stage !== 'running') return
    locationIntervalRef.current = setInterval(() => {
      if (pathRef.current.length === 0) return
      const last = pathRef.current[pathRef.current.length - 1]
      updateLocation(last.lat, last.lng).catch(() => {})
    }, 10000)
    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current)
    }
  }, [stage])

  // SSE 쓰레기 감지
  useEffect(() => {
    if (stage !== 'running' || !ploggingIdRef.current) return
    const token = localStorage.getItem('accessToken')
    const es = new EventSource(
      `${BASE_URL}/ploggings/${ploggingIdRef.current}/events?token=${token}`
    )
    sseRef.current = es
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        const category: string = data.category ?? '기타'
        setTrashChips(prev => {
          const existing = prev.find(c => c.label === category)
          if (existing) return prev.map(c => c.label === category ? { ...c, count: c.count + 1 } : c)
          const colors = ['#a0cfbd', '#d6d3a0', '#9aced8', '#b7d9a8', '#d8aaa3', '#c8b6df']
          return [...prev, { label: category, count: 1, color: colors[prev.length % colors.length] }]
        })
        setTotalTrash(n => n + 1)
        setAlertMsg(`${category} 수거가 감지되었어요!`)
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      } catch {}
    }
    return () => { es.close(); sseRef.current = null }
  }, [stage])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(-1)

  const parseDeviceId = (text: string): number | null => {
    try {
      const parsed = JSON.parse(text)
      if (typeof parsed.deviceId === 'number') return parsed.deviceId
    } catch {}
    const num = Number(text.trim())
    return Number.isFinite(num) ? num : null
  }

  const onQrDetected = useCallback(async (text: string) => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    cancelAnimationFrame(rafRef.current)
    const deviceId = parseDeviceId(text)
    if (deviceId !== null) {
      try { await linkDevice(deviceId) } catch {}
    }
    setStage('connected')
  }, [])

  const scanFrame = useCallback(async (video: HTMLVideoElement, canvas: HTMLCanvasElement, detector: any) => {
    if (video.readyState < 2) {
      rafRef.current = requestAnimationFrame(() => scanFrame(video, canvas, detector))
      return
    }
    if (detector) {
      try {
        const results = await detector.detect(video)
        if (results.length > 0) { onQrDetected(results[0].rawValue); return }
      } catch {}
    } else {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })
        if (code) { onQrDetected(code.data); return }
      }
    }
    rafRef.current = requestAnimationFrame(() => scanFrame(video, canvas, detector))
  }, [onQrDetected])

  // 카메라 스캔 → 연결
  useEffect(() => {
    if (stage !== 'camera') return
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        const detector = ('BarcodeDetector' in window)
          ? new (window as any).BarcodeDetector({ formats: ['qr_code'] })
          : null
        const startScan = () => {
          video.play().catch(() => {})
          const canvas = canvasRef.current
          if (canvas) rafRef.current = requestAnimationFrame(() => scanFrame(video, canvas, detector))
        }
        if (video.readyState >= 1) {
          startScan()
        } else {
          video.onloadedmetadata = startScan
        }
      })
      .catch(() => setStage('waiting'))
    return () => {
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [stage, scanFrame])

  async function handleStop() {
    if (watchIdRef.current !== -1) navigator.geolocation.clearWatch(watchIdRef.current)
    sseRef.current?.close()
    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current)

    try {
      const result = await endPlogging()
      localStorage.setItem('ploggingResult', JSON.stringify(result))
    } catch {
      localStorage.setItem('ploggingResult', JSON.stringify({
        distanceMeters: distance * 1000,
        durationSeconds: seconds,
        contributionScore: 0,
        trashSummary: { totalCount: totalTrash },
        trashes: [],
      }))
    }
    navigate('/plogging/result')
  }

  async function handleStart() {
    try {
      const id = await startPlogging()
      ploggingIdRef.current = id
    } catch {}
    setStage('running')
  }

  /* 플로깅 진행 중 */
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
            {alertMsg || '수거가 감지되었어요!'}
          </div>
        )}

        <div className="pr-sheet">
          <div className="pr-handle" />
          <div className="pr-stats-row">
            <div className="pr-stat-card">
              <div className="pr-stat-icon-box"><img src={runIcon} alt="" className="pr-stat-icon" /></div>
              <div className="pr-stat-info">
                <p className="pr-stat-label">이동거리</p>
                <p className="pr-stat-value"><span className="pr-stat-num">{(distance * 1000).toFixed(0)}</span> m</p>
              </div>
            </div>
            <div className="pr-stat-card">
              <div className="pr-stat-icon-box"><img src={clockIcon} alt="" className="pr-stat-icon" /></div>
              <div className="pr-stat-info">
                <p className="pr-stat-label">진행시간</p>
                <p className="pr-stat-value mint">{timerDisplay}</p>
              </div>
            </div>
          </div>

          <div className="pr-trash-card">
            <div className="pr-stat-icon-box"><img src={trashIcon} alt="" className="pr-stat-icon" /></div>
            <div className="pr-stat-info">
              <p className="pr-stat-label">자동수거감지</p>
              <p className="pr-stat-value"><span className="pr-stat-num">{totalTrash}</span> 개 수거됨</p>
            </div>
          </div>

          {trashChips.length > 0 && (
            <div className="pr-chips">
              {trashChips.map(chip => (
                <span key={chip.label} className="pr-chip" style={{ background: chip.color }}>
                  {chip.label} x{chip.count}
                </span>
              ))}
            </div>
          )}

          <button className="pr-stop-btn" onClick={handleStop}>■ 플로깅 종료</button>
        </div>
      </div>
    )
  }

  /* 연결 흐름 */
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

        {(stage === 'idle' || stage === 'waiting' || stage === 'camera') && (
          <p className="plogging-sub">카메라에 전용 스마트 수거 디바이스의<br />QR 코드를 비추어 주세요</p>
        )}

        <div className="plogging-bag-area">
          <div className="plogging-bag-container">
            <img src={bagImg} alt="플로깅 백" className="plogging-bag-img" />
          </div>
          <div className="plogging-ellipse-container">
            <img src={ellipseImg} alt="" className="plogging-ellipse-img" />
          </div>
        </div>

        {stage === 'idle' && (
          <button className="plogging-done-btn" style={{ marginTop: 28 }} onClick={() => setStage('waiting')}>
            QR 스캔 시작
          </button>
        )}

        {stage === 'waiting' && (
          <>
            <p className="plogging-wait-title">연결 대기 중</p>
            <div className="plogging-loading">
              <span className="plogging-dot" />
              <span className="plogging-dot" />
              <span className="plogging-dot" />
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
            <div className="plogging-loading">
              <span className="plogging-dot" />
              <span className="plogging-dot" />
              <span className="plogging-dot" />
            </div>
            <div className="plogging-qr-border">
              <video ref={videoRef} className="plogging-camera-video" playsInline autoPlay muted />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
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
            <button className="plogging-done-btn" onClick={handleStart}>플로깅 시작</button>
          </>
        )}
      </div>

      <BottomNav />
    </>
  )
}
