import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import mascot from '../../../assets/chat/mascot.png'
import heartIcon from '../../../assets/community/heart.svg'
import locationIcon from '../../../assets/community/location.svg'
import peopleIcon from '../../../assets/community/people.svg'
import clockIcon from '../../../assets/community/clock.svg'
import megaphoneIcon from '../../../assets/community/megaphone.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import Header from '../../../components/Header/Header'
import {
  getInfoList, toggleLike,
  getRecruitmentList, getRecruitmentDetail, toggleParticipation,
} from '../../../api/community'
import type { InfoPost, Recruitment, RecruitmentDetail } from '../../../api/community'
import './CommunityPage.css'

const TABS = ['INFO', '단체 플로깅']

function formatEventDateTime(eventDateTime: string): string {
  const d = new Date(eventDateTime.replace(' ', 'T'))
  if (isNaN(d.getTime())) return eventDateTime
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${hh}시 ${mm}분`
}

function getDday(eventDateTime: string): { label: string; status: 'dday' | 'upcoming' | 'ended' } {
  const event = new Date(eventDateTime.replace(' ', 'T'))
  const eventDay = new Date(event.getFullYear(), event.getMonth(), event.getDate())
  const today = new Date()
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffDays = Math.round((eventDay.getTime() - todayDay.getTime()) / 86400000)
  if (diffDays < 0) return { label: '이벤트 종료', status: 'ended' }
  if (diffDays === 0) return { label: 'D-Day', status: 'dday' }
  return { label: `D-${diffDays}`, status: 'upcoming' }
}

function AuthorAvatar({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <div className="post-avatar">
        <img src={src} alt="" className="post-avatar-photo" onError={() => setFailed(true)} />
      </div>
    )
  }
  return (
    <div className="post-avatar">
      <div className="post-avatar-mascot-crop">
        <img src={mascot} alt="" className="post-avatar-mascot-img" />
      </div>
    </div>
  )
}

function PostImages({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0)
  const startX = useRef<number | null>(null)

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    startX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (startX.current === null) return
    const delta = e.clientX - startX.current
    if (delta < -40 && index < images.length - 1) setIndex(i => i + 1)
    else if (delta > 40 && index > 0) setIndex(i => i - 1)
    startX.current = null
  }

  if (images.length === 0) return null
  return (
    <div
      className="post-image-wrap"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { startX.current = null }}
    >
      <div className="post-image-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          <img key={i} src={src} alt="" className="post-image" draggable={false} />
        ))}
      </div>
      {images.length > 1 && <div className="post-slide-badge">{index + 1}/{images.length}</div>}
    </div>
  )
}

type View =
  | { type: 'info-list' }
  | { type: 'group-list' }
  | { type: 'group-detail'; eventId: number }

export default function CommunityPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [view, setView] = useState<View>({ type: 'info-list' })

  const [infoPosts, setInfoPosts] = useState<InfoPost[]>([])
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [recruitments, setRecruitments] = useState<Recruitment[]>([])
  const [detailEvent, setDetailEvent] = useState<RecruitmentDetail | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 0) {
      setLoading(true)
      getInfoList().then(r => setInfoPosts(r.infos)).catch(() => {}).finally(() => setLoading(false))
    } else {
      setLoading(true)
      getRecruitmentList().then(setRecruitments).catch(() => {}).finally(() => setLoading(false))
    }
  }, [activeTab])

  useEffect(() => {
    if (view.type === 'group-detail') {
      getRecruitmentDetail(view.eventId).then(setDetailEvent).catch(() => {})
    }
  }, [view])

  function handleTabChange(i: number) {
    setActiveTab(i)
    setView(i === 0 ? { type: 'info-list' } : { type: 'group-list' })
  }

  function handleBack() {
    if (view.type === 'group-detail') {
      setView({ type: 'group-list' })
      setLoading(true)
      getRecruitmentList().then(setRecruitments).catch(() => {}).finally(() => setLoading(false))
    } else {
      navigate('/')
    }
  }

  async function handleLike(postId: number) {
    try {
      const res = await toggleLike(postId)
      setInfoPosts(prev => prev.map(p =>
        p.postId === postId ? { ...p, liked: res.isLiked, likeCount: res.likeCount } : p
      ))
    } catch {}
  }

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  async function handleParticipate(recruitmentId: number) {
    try {
      const res = await toggleParticipation(recruitmentId)
      const detail = await getRecruitmentDetail(recruitmentId)
      setDetailEvent(detail)
      showToast(res.isParticipating ? '참여 신청이 완료되었습니다' : '참여가 취소되었습니다')
    } catch {}
  }

  const tabBar = (
    <div className="community-tabbar">
      {TABS.map((tab, i) => (
        <button key={tab} className={`community-tab ${activeTab === i ? 'active' : ''}`} onClick={() => handleTabChange(i)}>
          {tab}
        </button>
      ))}
    </div>
  )

  const header = <Header title="커뮤니티" onBack={handleBack} />
  const toastEl = toast && <div className="community-toast">{toast}</div>
  const headerNoBorder = <Header title="커뮤니티" onBack={handleBack} noBorder />

  /* 단체 플로깅 상세 */
  if (view.type === 'group-detail' && detailEvent) {
    const pct = Math.round((detailEvent.currentParticipants / detailEvent.maxParticipants) * 100)
    const dday = getDday(detailEvent.eventDateTime)
    const ended = dday.status === 'ended'
    return (
      <>
        {header}
        {toastEl}
        <div className="event-detail-page">
          {detailEvent.thumbnailImageUrl && (
            <div className="event-detail-image-wrap">
              <img src={detailEvent.thumbnailImageUrl} alt={detailEvent.title} className="event-detail-image" />
            </div>
          )}
          <div className="event-detail-content">
            <h2 className="event-detail-title">{detailEvent.title}</h2>
            <div className="event-detail-info">
              <div className="event-info-row">
                <img src={locationIcon} alt="" className="event-info-icon" />
                <span className="event-info-text">{detailEvent.eventLocation}</span>
              </div>
              <div className="event-info-row">
                <img src={clockIcon} alt="" className="event-info-icon" />
                <span className="event-info-text">{formatEventDateTime(detailEvent.eventDateTime)}</span>
              </div>
              <div className="event-info-row">
                <img src={peopleIcon} alt="" className="event-info-icon" />
                <span className="event-info-text">
                  {detailEvent.maxParticipants}명 모집 ({detailEvent.currentParticipants}/{detailEvent.maxParticipants}명 참여중)
                </span>
              </div>
            </div>
            <div className="event-progress-wrap">
              <div className="event-progress-bar">
                <div className="event-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="event-progress-label">{pct}% 모집됨</span>
            </div>
            {detailEvent.description && (
              <div className="event-announcement">
                <img src={megaphoneIcon} alt="" className="event-megaphone-icon" />
                <div>
                  <p className="event-announce-label">활동 소개</p>
                  <p className="event-announce-text">{detailEvent.description}</p>
                </div>
              </div>
            )}
            <button
              className={`event-join-btn ${ended ? 'ended' : detailEvent.isParticipating ? 'participating' : ''}`}
              onClick={() => {
                if (ended) showToast('지금은 참여할 수 없습니다')
                else if (view.type === 'group-detail') handleParticipate(view.eventId)
              }}
            >
              {ended ? '모집중이 아닙니다' : detailEvent.isParticipating ? '참여 취소' : '참여하기'}
            </button>
          </div>
        </div>
        <BottomNav />
      </>
    )
  }

  /* 리스트 뷰 */
  return (
    <>
      {headerNoBorder}{tabBar}

      {activeTab === 0 ? (
        <div className="community-page">
          {loading && <p style={{ textAlign: 'center', padding: 24, color: '#999' }}>불러오는 중...</p>}
          {infoPosts.map(post => (
            <div key={post.postId} className="community-post">
              <div className="post-author-row">
                <AuthorAvatar src={post.authorProfileImageUrl} />
                <span className="post-author-name">{post.authorNickname}</span>
              </div>
              <PostImages images={post.imageUrls} />
              <div className={`post-likes-row ${post.imageUrls.length === 0 ? 'no-image' : ''}`}>
                <button onClick={() => handleLike(post.postId)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <img src={heartIcon} alt="좋아요" className="post-heart-icon" style={{ opacity: post.liked ? 1 : 0.4 }} />
                </button>
                <span className="post-likes">{post.likeCount.toLocaleString()}</span>
              </div>
              <p className="post-title">{post.postTitle}</p>
              <p className="post-body">
                {expandedIds.includes(post.postId) || post.postContent.length <= 100
                  ? post.postContent
                  : `${post.postContent.slice(0, 100)}...`}
              </p>
              {post.postContent.length > 100 && (
                expandedIds.includes(post.postId) ? (
                  <button
                    className="post-more-btn"
                    onClick={() => setExpandedIds(prev => prev.filter(id => id !== post.postId))}
                  >
                    접기
                  </button>
                ) : (
                  <button
                    className="post-more-btn"
                    onClick={() => setExpandedIds(prev => [...prev, post.postId])}
                  >
                    더보기
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="community-page group-page">
          {loading && <p style={{ textAlign: 'center', padding: 24, color: '#999' }}>불러오는 중...</p>}
          {recruitments.map(event => {
            const dday = getDday(event.eventDateTime)
            return (
              <div key={event.recruitmentId} className="event-card" onClick={() => setView({ type: 'group-detail', eventId: event.recruitmentId })}>
                <span className={`event-card-dday ${dday.status}`}>{dday.label}</span>

                <div className="event-card-body-row">
                  <div className="event-card-text-col">
                    <p className="event-card-title">{event.title}</p>
                    <p className="event-card-host">{event.hostName}</p>

                    <div className="event-card-info-list">
                      <div className="event-card-info-row">
                        <div className="event-card-icon-box">
                          <img src={clockIcon} alt="" className="event-card-icon" />
                        </div>
                        <div className="event-card-info-text">
                          <p className="event-card-info-label">이벤트 일시</p>
                          <p className="event-card-info-value">{formatEventDateTime(event.eventDateTime)}</p>
                        </div>
                      </div>

                      <div className="event-card-info-row">
                        <div className="event-card-icon-box">
                          <img src={locationIcon} alt="" className="event-card-icon" />
                        </div>
                        <div className="event-card-info-text">
                          <p className="event-card-info-label">이벤트 장소</p>
                          <p className="event-card-info-value">{event.eventLocation}</p>
                        </div>
                      </div>

                      <div className="event-card-info-row">
                        <div className="event-card-icon-box">
                          <img src={peopleIcon} alt="" className="event-card-icon" />
                        </div>
                        <div className="event-card-info-text">
                          <p className="event-card-info-label">참여 인원</p>
                          <p className="event-card-info-value">{event.currentParticipants} / {event.maxParticipants || '제한 없음'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {event.thumbnailImageUrl && (
                    <div className="event-card-thumb">
                      <img src={event.thumbnailImageUrl} alt="" className="event-card-thumb-img" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <BottomNav />
    </>
  )
}
