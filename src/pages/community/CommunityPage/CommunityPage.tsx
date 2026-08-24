import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import heartIcon from '../../../assets/community/heart.svg'
import locationIcon from '../../../assets/community/location.svg'
import peopleIcon from '../../../assets/community/people.svg'
import clockIcon from '../../../assets/community/clock.svg'
import megaphoneIcon from '../../../assets/community/megaphone.svg'
import backIcon from '../../../assets/map/back.svg'
import navNextIcon from '../../../assets/home/icons/nav-next.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import {
  getInfoList, toggleLike,
  getRecruitmentList, getRecruitmentDetail, toggleParticipation,
} from '../../../api/community'
import type { InfoPost, Recruitment, RecruitmentDetail } from '../../../api/community'
import './CommunityPage.css'

const TABS = ['INFO', '단체 플로깅']

type View =
  | { type: 'info-list' }
  | { type: 'info-detail'; postId: number }
  | { type: 'group-list' }
  | { type: 'group-detail'; eventId: number }

export default function CommunityPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [view, setView] = useState<View>({ type: 'info-list' })

  const [infoPosts, setInfoPosts] = useState<InfoPost[]>([])
  const [recruitments, setRecruitments] = useState<Recruitment[]>([])
  const [detailPost, setDetailPost] = useState<InfoPost | null>(null)
  const [detailEvent, setDetailEvent] = useState<RecruitmentDetail | null>(null)
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
    if (view.type === 'info-detail') {
      const found = infoPosts.find(p => p.postId === view.postId)
      if (found) setDetailPost(found)
    }
    if (view.type === 'group-detail') {
      getRecruitmentDetail(view.eventId).then(setDetailEvent).catch(() => {})
    }
  }, [view])

  function handleTabChange(i: number) {
    setActiveTab(i)
    setView(i === 0 ? { type: 'info-list' } : { type: 'group-list' })
  }

  function handleBack() {
    if (view.type === 'info-detail') setView({ type: 'info-list' })
    else if (view.type === 'group-detail') setView({ type: 'group-list' })
    else navigate('/')
  }

  async function handleLike(postId: number) {
    try {
      const res = await toggleLike(postId)
      setInfoPosts(prev => prev.map(p =>
        p.postId === postId ? { ...p, liked: res.isLiked, likeCount: res.likeCount } : p
      ))
      if (detailPost?.postId === postId) {
        setDetailPost(prev => prev ? { ...prev, liked: res.isLiked, likeCount: res.likeCount } : prev)
      }
    } catch {}
  }

  async function handleParticipate(recruitmentId: number) {
    try {
      const res = await toggleParticipation(recruitmentId)
      setDetailEvent(prev => prev ? {
        ...prev,
        currentParticipants: res.currentParticipants,
        maxParticipants: res.maxParticipants,
      } : prev)
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

  const header = (
    <header className="community-header">
      <button className="community-back-btn" onClick={handleBack}>
        <img src={backIcon} alt="뒤로" className="community-back-icon" />
      </button>
      <span className="community-title">커뮤니티</span>
    </header>
  )

  /* INFO 게시글 상세 */
  if (view.type === 'info-detail' && detailPost) {
    return (
      <>
        {header}{tabBar}
        <div className="community-page">
          <div className="community-post">
            <div className="post-author-row">
              {detailPost.authorProfileImageUrl
                ? <img src={detailPost.authorProfileImageUrl} alt="" className="post-avatar-img" style={{ borderRadius: '50%', width: 32, height: 32 }} />
                : <div className="post-avatar"><div className="post-avatar-placeholder" /></div>}
              <span className="post-author-name">{detailPost.authorNickname}</span>
            </div>
            {detailPost.imageUrls.length > 0 && (
              <div className="post-image-wrap">
                <img src={detailPost.imageUrls[0]} alt="" className="post-image" />
                {detailPost.imageUrls.length > 1 && (
                  <div className="post-slide-badge">1/{detailPost.imageUrls.length}</div>
                )}
              </div>
            )}
            <div className="post-likes-row">
              <button onClick={() => handleLike(detailPost.postId)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <img src={heartIcon} alt="좋아요" className="post-heart-icon" style={{ opacity: detailPost.liked ? 1 : 0.4 }} />
              </button>
              <span className="post-likes">{detailPost.likeCount.toLocaleString()}</span>
            </div>
            <p className="post-body post-body-full">{detailPost.postContent}</p>
          </div>
        </div>
        <BottomNav />
      </>
    )
  }

  /* 단체 플로깅 상세 */
  if (view.type === 'group-detail' && detailEvent) {
    const pct = Math.round((detailEvent.currentParticipants / detailEvent.maxParticipants) * 100)
    return (
      <>
        {header}
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
                <span className="event-info-text">{detailEvent.eventDateTime}</span>
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
                  <p className="event-announce-label">안내사항</p>
                  <p className="event-announce-text">{detailEvent.description}</p>
                </div>
              </div>
            )}
            <button className="event-join-btn" onClick={() => handleParticipate(detailEvent.recruitmentId)}>참여하기</button>
          </div>
        </div>
        <BottomNav />
      </>
    )
  }

  /* 리스트 뷰 */
  return (
    <>
      {header}{tabBar}

      {activeTab === 0 ? (
        <div className="community-page">
          {loading && <p style={{ textAlign: 'center', padding: 24, color: '#999' }}>불러오는 중...</p>}
          {infoPosts.map(post => (
            <div key={post.postId} className="community-post">
              <div className="post-author-row">
                {post.authorProfileImageUrl
                  ? <img src={post.authorProfileImageUrl} alt="" className="post-avatar-img" style={{ borderRadius: '50%', width: 32, height: 32 }} />
                  : <div className="post-avatar"><div className="post-avatar-placeholder" /></div>}
                <span className="post-author-name">{post.authorNickname}</span>
              </div>
              {post.imageUrls.length > 0 && (
                <div className="post-image-wrap">
                  <img src={post.imageUrls[0]} alt="" className="post-image" />
                  {post.imageUrls.length > 1 && <div className="post-slide-badge">1/{post.imageUrls.length}</div>}
                </div>
              )}
              <div className="post-likes-row">
                <button onClick={() => handleLike(post.postId)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <img src={heartIcon} alt="좋아요" className="post-heart-icon" style={{ opacity: post.liked ? 1 : 0.4 }} />
                </button>
                <span className="post-likes">{post.likeCount.toLocaleString()}</span>
              </div>
              <p className="post-body">{post.postContent.slice(0, 100)}{post.postContent.length > 100 ? '...' : ''}</p>
              <button className="post-more-btn" onClick={() => setView({ type: 'info-detail', postId: post.postId })}>더보기</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="community-page group-page">
          {loading && <p style={{ textAlign: 'center', padding: 24, color: '#999' }}>불러오는 중...</p>}
          {recruitments.map(event => (
            <div key={event.recruitmentId} className="event-card" onClick={() => setView({ type: 'group-detail', eventId: event.recruitmentId })}>
              {event.thumbnailImageUrl && (
                <div className="event-card-image-wrap">
                  <img src={event.thumbnailImageUrl} alt={event.title} className="event-card-image" />
                  <div className="event-card-badge">{event.currentParticipants}/{event.maxParticipants}명</div>
                </div>
              )}
              <div className="event-card-body">
                <p className="event-card-title">{event.title}</p>
                <div className="event-info-row">
                  <img src={locationIcon} alt="" className="event-info-icon" />
                  <span className="event-info-text">{event.eventLocation}</span>
                </div>
                <div className="event-info-row">
                  <img src={clockIcon} alt="" className="event-info-icon" />
                  <span className="event-info-text">{event.eventDateTime}</span>
                </div>
                <div className="event-info-row">
                  <img src={peopleIcon} alt="" className="event-info-icon" />
                  <span className="event-info-text">{event.maxParticipants}명 모집</span>
                </div>
              </div>
              <img src={navNextIcon} alt="" className="event-card-arrow" />
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </>
  )
}
