import { useState, useRef, useEffect, useCallback } from 'react'
import jsQR from 'jsqr'
import { useNavigate } from 'react-router-dom'
import bagImg from '../../../assets/plogging/bag.png'
import ellipseImg from '../../../assets/plogging/ellipse.svg'
import checkIcon from '../../../assets/plogging/check.svg'
import runIcon from '../../../assets/plogging/run.svg'
import trashIcon from '../../../assets/plogging/trash.svg'
import bellIcon from '../../../assets/plogging/bell.svg'
import clockIcon from '../../../assets/home/icons/clock.svg'
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

// SSE trash-added/plogging-in-progress에서 오는 category 코드 → 라벨/색상/지도 배지 아이콘
const CATEGORY_META: Record<string, { label: string; color: string; icon: string }> = {
  VINYL: { label: '비닐', color: '#a0cfbd', icon: iconVinyl },
  GLASS: { label: '유리', color: '#9aced8', icon: iconGlass },
  PAPER: { label: '종이', color: '#d8aaa3', icon: iconPaper },
  CAN: { label: '캔', color: '#d6d3a0', icon: iconCan },
  PET_BOTTLE: { label: '페트', color: '#b7d9a8', icon: iconPetBottle },
  PLASTIC: { label: '플라스틱', color: '#a8c2e2', icon: iconPlastic },
  CIGARETTE: { label: '담배꽁초', color: '#c8b6df', icon: iconCigarette },
  STYROFOAM: { label: '스티로폼', color: '#e0c0d0', icon: iconStyrofoam },
}

// plogging-in-progress의 trashSummary 필드명 → CATEGORY_META 키
const SUMMARY_FIELD_TO_CATEGORY: [string, string][] = [
  ['vinylCount', 'VINYL'], ['paperCount', 'PAPER'], ['glassCount', 'GLASS'], ['canCount', 'CAN'],
  ['petBottleCount', 'PET_BOTTLE'], ['plasticCount', 'PLASTIC'], ['cigaretteCount', 'CIGARETTE'], ['styrofoamCount', 'STYROFOAM'],
]

// 위치 전송 주기 - API 문서 스펙(약 3초). 간격이 길수록 서버가 두 점을 직선으로 이어
// 누적하기 때문에 실제 경로보다 짧게 계산됨
const LOCATION_INTERVAL_MS = 3000

// 새로고침해도 진행 중이던 플로깅이 끊기지 않도록 세션 id/시작 시각을 저장
const ACTIVE_PLOGGING_KEY = 'activePlogging'

function readActivePlogging(): { ploggingId: number; startedAt: number } | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PLOGGING_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed.ploggingId === 'number' && typeof parsed.startedAt === 'number') return parsed
    return null
  } catch {
    return null
  }
}

export default function PloggingPage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('idle')
  const [connectedDeviceId, setConnectedDeviceId] = useState<number | null>(null)
  const [linkErrorToast, setLinkErrorToast] = useState(false)
  const [sessionGoneToast, setSessionGoneToast] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [seconds, setSeconds] = useState(() => {
    const active = readActivePlogging()
    return active ? Math.max(0, Math.floor((Date.now() - active.startedAt) / 1000)) : 0
  })
  const [distance, setDistance] = useState(0)
  const [trashChips, setTrashChips] = useState<TrashChip[]>([])
  const [totalTrash, setTotalTrash] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')
  // 새로고침 시 진행 중이던 세션이 있었으면 바로 이어서 로딩 시작
  const [starting, setStarting] = useState(() => readActivePlogging() !== null)

  const ploggingIdRef = useRef<number | null>(readActivePlogging()?.ploggingId ?? null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const polylineRef = useRef<any>(null)
  const trashMarkersRef = useRef<any[]>([])
  const pathRef = useRef<{ lat: number; lng: number }[]>([])
  const lastFixRef = useRef<{ lat: number; lng: number; t: number } | null>(null)
  const clientDistanceRef = useRef(0)
  // 서버 거리 이벤트를 한 번이라도 받으면 그 뒤로는 서버 값만 사용
  // (클라이언트 누적치와 서버 계산치가 서로 덮어쓰면 숫자가 위아래로 튐)
  const hasServerDistanceRef = useRef(false)
  // 마지막으로 화면에 반영한 서버 거리(km) - 순서 역전 판별용
  const serverDistanceKmRef = useRef(0)
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

  // 카카오맵 + 위치 추적 — '플로깅 시작' 클릭 시점(starting)부터 미리 로딩해서
  // 지도가 준비된 뒤에 running 화면으로 전환함
  useEffect(() => {
    if (!starting) return
    let cancelled = false

    // 경로의 시작점도 watchPosition이 준 실제 fix로만 잡음
    // (전에는 getCurrentPosition이 뒤늦게 도착해 pathRef를 통째로 덮어써서 거리가 0으로 떨어졌음)
    const startTracking = (map: any, marker: any) => {
      if (!navigator.geolocation) return
      watchIdRef.current = navigator.geolocation.watchPosition(pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        const t = pos.timestamp || Date.now()
        const prev = lastFixRef.current
        if (prev) {
          clientDistanceRef.current += haversine(prev.lat, prev.lng, lat, lng)
        }
        lastFixRef.current = { lat, lng, t }
        pathRef.current = [...pathRef.current, { lat, lng }]

        const latlng = new window.kakao.maps.LatLng(lat, lng)
        marker.setPosition(latlng)
        map.panTo(latlng)

        // 서버 거리 이벤트가 도착하기 전까지만 클라이언트 추정치를 보여줌. 화면에 이미 표기된
        // 값보다 작아지는 갱신은 버림 (거리는 줄어들 수 없음)
        if (!hasServerDistanceRef.current) {
          setDistance(d => Math.max(d, clientDistanceRef.current))
        }

        polylineRef.current?.setMap(null)
        const poly = new window.kakao.maps.Polyline({
          path: pathRef.current.map(p => new window.kakao.maps.LatLng(p.lat, p.lng)),
          strokeWeight: 4, strokeColor: '#a0cfbd', strokeOpacity: 0.9, strokeStyle: 'solid',
        })
        poly.setMap(map)
        polylineRef.current = poly
      }, undefined, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 })
    }

    // 지도 초기 중심 좌표 전용. 실패 시 서울시청으로 폴백하지만 이 값은 경로/거리에 넣지 않음
    // (넣으면 첫 실제 GPS 좌표가 들어오는 순간 서울시청까지의 거리가 통째로 더해짐)
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
      const enterRunning = () => { if (!cancelled) setStage('running') }
      window.kakao.maps.event.addListener(map, 'tilesloaded', enterRunning)
      setTimeout(enterRunning, 4000)
      const marker = new window.kakao.maps.Marker({ position: initialLatLng })
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
  }, [starting])

  // 서버에 진행 중인 플로깅이 없으면(PLOGGING404_1) 더 보낼 이유가 없으므로
  // 위치 전송/추적을 멈추고 연결 화면으로 되돌림
  const abortInactivePlogging = useCallback(() => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
      locationIntervalRef.current = null
    }
    if (watchIdRef.current !== -1) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = -1
    }
    localStorage.removeItem(ACTIVE_PLOGGING_KEY)
    ploggingIdRef.current = null
    // 다음 세션이 이전 거리를 물려받지 않도록 누적 상태를 모두 초기화
    pathRef.current = []
    lastFixRef.current = null
    clientDistanceRef.current = 0
    hasServerDistanceRef.current = false
    serverDistanceKmRef.current = 0
    setDistance(0)
    setStarting(false)
    setStage('idle')
    setSessionGoneToast(true)
    setTimeout(() => setSessionGoneToast(false), 3000)
  }, [])

  // API 위치 전송 (3초마다)
  useEffect(() => {
    if (stage !== 'running') return
    locationIntervalRef.current = setInterval(() => {
      if (pathRef.current.length === 0) return
      const last = pathRef.current[pathRef.current.length - 1]
      updateLocation(last.lat, last.lng).catch((err: any) => {
        if (err?.response?.data?.code === 'PLOGGING404_1') abortInactivePlogging()
      })
    }, LOCATION_INTERVAL_MS)
    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current)
    }
  }, [stage, abortInactivePlogging])

  // SSE 쓰레기 감지 — 백엔드가 event: 필드로 이름 붙여서 보내므로 onmessage(unnamed)가 아니라
  // addEventListener로 각 이벤트 이름별로 받아야 함
  useEffect(() => {
    if (stage !== 'running' || !ploggingIdRef.current) return
    const token = localStorage.getItem('accessToken')
    const es = new EventSource(
      `${BASE_URL}/ploggings/${ploggingIdRef.current}/events?token=${token}`
    )
    sseRef.current = es

    const on = (name: string, handler: (raw: string) => void) => {
      es.addEventListener(name, (e) => handler((e as MessageEvent).data))
    }

    const addTrashMarker = (loc: { latitude: number; longitude: number; category: string }) => {
      const map = mapRef.current
      if (!map || !window.kakao) return
      const icon = CATEGORY_META[loc.category]?.icon
      const pos = new window.kakao.maps.LatLng(loc.latitude, loc.longitude)
      const marker = new window.kakao.maps.Marker({
        position: pos,
        map,
        image: icon ? new window.kakao.maps.MarkerImage(icon, new window.kakao.maps.Size(26, 26)) : undefined,
      })
      trashMarkersRef.current.push(marker)
    }

    const bumpCategory = (category: string) => {
      const meta = CATEGORY_META[category]
      const label = meta?.label ?? category
      setTrashChips(prev => {
        const existing = prev.find(c => c.label === label)
        if (existing) return prev.map(c => c.label === label ? { ...c, count: c.count + 1 } : c)
        return [...prev, { label, count: 1, color: meta?.color ?? '#a9a9a9' }]
      })
      setTotalTrash(n => n + 1)
    }

    // 최초 접속 시 지금까지 수거된 현황 스냅샷
    on('plogging-in-progress', (raw) => {
      try {
        const data = JSON.parse(raw)
        const summary = data.trashSummary
        if (summary) {
          setTotalTrash(summary.totalCount ?? 0)
          setTrashChips(
            SUMMARY_FIELD_TO_CATEGORY
              .filter(([field]) => (summary[field] ?? 0) > 0)
              .map(([field, category]) => ({
                label: CATEGORY_META[category].label,
                count: summary[field],
                color: CATEGORY_META[category].color,
              }))
          )
        }
        ;(data.trashLocations ?? []).forEach(addTrashMarker)
      } catch {}
    })

    // 서버가 계산한 이동거리 - 종료 시 endPlogging()이 주는 값과 같은 기준이라 이쪽을 단일 진실로 삼음.
    // 서버는 Redis에 누적만 하므로 거리가 줄어들 수 없지만, updateLocation의 읽기-계산-쓰기가
    // 원자적이지 않아 요청이 겹치면 더 작은 값이 뒤늦게 도착할 수 있음(순서 역전).
    // 첫 값은 그대로 받아 클라이언트 추정치에서 넘겨받고, 이후로는 이전보다 작은 값은 버림
    on('plogging-distance-updated', (raw) => {
      try {
        const data = JSON.parse(raw)
        if (typeof data.distanceMeters !== 'number') return
        const km = data.distanceMeters / 1000
        if (!Number.isFinite(km) || km < 0) return
        if (hasServerDistanceRef.current && km <= serverDistanceKmRef.current) return
        hasServerDistanceRef.current = true
        serverDistanceKmRef.current = km
        setDistance(km)
      } catch {}
    })

    // 쓰레기 투입 감지 알림 토스트 (plain text)
    on('trash-detective-event', (raw) => {
      setAlertMsg(raw)
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    })

    // 실제 수거 확정 — 카운트/칩/지도 마커 반영
    on('trash-added', (raw) => {
      try {
        const data = JSON.parse(raw)
        bumpCategory(data.category)
        addTrashMarker(data)
      } catch {}
    })

    return () => {
      es.close()
      sseRef.current = null
      trashMarkersRef.current.forEach(m => m.setMap(null))
      trashMarkersRef.current = []
    }
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
    if (deviceId === null) {
      setLinkErrorToast(true)
      setTimeout(() => setLinkErrorToast(false), 3000)
      setStage('waiting')
      return
    }
    try {
      await linkDevice(deviceId)
      setConnectedDeviceId(deviceId)
      setStage('connected')
    } catch {
      setLinkErrorToast(true)
      setTimeout(() => setLinkErrorToast(false), 3000)
      setStage('waiting')
    }
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
    localStorage.removeItem(ACTIVE_PLOGGING_KEY)

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
    setStarting(true)
    try {
      const id = await startPlogging()
      ploggingIdRef.current = id
      localStorage.setItem(ACTIVE_PLOGGING_KEY, JSON.stringify({ ploggingId: id, startedAt: Date.now() }))
    } catch {}
    // 지도 로딩이 끝나면(맵 useEffect 안에서) stage가 'running'으로 바뀜
  }

  /* 플로깅 진행 중 — starting부터 지도를 미리 로딩해두고, 준비되면 stage가 running으로 바뀜.
     그 전까지는 화면에 그리지 않고 숨겨서(visibility) 지도만 백그라운드에서 로딩됨 */
  const runningView = starting && (
    <div className="pr-running-wrap" style={{ visibility: stage === 'running' ? 'visible' : 'hidden' }}>
        <Header title="플로깅" />

        <div id="kakao-map" className="pr-map" />

        {showAlert && (
          <div className="pr-alert">
            <img src={bellIcon} alt="" className="pr-alert-icon" />
            {alertMsg || '수거가 감지되었어요!'}
          </div>
        )}

        <div className="pr-sheet">
          <div className="pr-handle" />
          <div className="pr-sheet-body">
          <div className="pr-stats-row">
            <div className="pr-stat-card">
              <div className="pr-stat-icon-box"><img src={clockIcon} alt="" className="pr-stat-icon" /></div>
              <div className="pr-stat-info">
                <p className="pr-stat-label">진행시간</p>
                <p className="pr-stat-value mint">{timerDisplay}</p>
              </div>
            </div>
            <div className="pr-stat-card">
              <div className="pr-stat-icon-box"><img src={runIcon} alt="" className="pr-stat-icon" /></div>
              <div className="pr-stat-info">
                <p className="pr-stat-label">이동거리</p>
                <p className="pr-stat-value"><span className="pr-stat-num">{(distance * 1000).toFixed(0)}</span> m</p>
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
    </div>
  )

  if (stage === 'running') {
    return runningView
  }

  /* 연결 흐름 */
  return (
    <>
      {runningView}

      <Header title="플로깅" />

      <div className="plogging-page">
        <p className="plogging-main-title">디바이스 연결</p>

        <p className="plogging-sub">카메라에 전용 스마트 수거 디바이스의<br />QR 코드를 비추어 주세요</p>

        <div className="plogging-bag-area">
          <div className="plogging-bag-container">
            <img src={bagImg} alt="플로깅 백" className="plogging-bag-img" />
          </div>
          <div className="plogging-ellipse-container">
            <img src={ellipseImg} alt="" className="plogging-ellipse-img" />
          </div>
        </div>

        <div className="plogging-stage-content">
        {stage === 'idle' && (
          <button className="plogging-done-btn plogging-qr-start-btn" style={{ marginTop: 28 }} onClick={() => setStage('waiting')}>
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
              <span className="plogging-scan-line" />
              <p className="plogging-scanning-text">스캔 중...</p>
            </div>
          </>
        )}

        {stage === 'connected' && (
          <div className="plogging-connected-block">
            <div className="plogging-connected-header">
              <p className="plogging-connected-title">연결 완료{connectedDeviceId !== null ? ` - ${connectedDeviceId}` : ''}</p>
              <img src={checkIcon} alt="" className="plogging-check-icon" />
            </div>
            <p className="plogging-connected-sub">스마트 수거 디바이스 연동에 성공하였습니다</p>
            <p className="plogging-connected-sub2">이제 플로깅을 시작할 수 있어요</p>
            <button className="plogging-done-btn" onClick={handleStart} disabled={starting}>
              {starting ? '준비 중...' : '플로깅 시작'}
            </button>
          </div>
        )}
        </div>
      </div>

      {starting && (
        <div className="plogging-map-loading-toast">지도를 불러오는 중...</div>
      )}

      {linkErrorToast && (
        <div className="plogging-map-loading-toast">디바이스 연동에 실패했습니다</div>
      )}

      {sessionGoneToast && (
        <div className="plogging-map-loading-toast">진행 중인 플로깅이 없어 처음 화면으로 돌아왔어요</div>
      )}

      <BottomNav />
    </>
  )
}
