import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import profileImg from '../../../assets/community/profile.png'
import postImg from '../../../assets/community/post-img.png'
import heartIcon from '../../../assets/community/heart.svg'
import locationIcon from '../../../assets/community/location.svg'
import peopleIcon from '../../../assets/community/people.svg'
import clockIcon from '../../../assets/community/clock.svg'
import megaphoneIcon from '../../../assets/community/megaphone.svg'
import eventImg from '../../../assets/community/event-img.png'
import backIcon from '../../../assets/map/back.svg'
import navNextIcon from '../../../assets/home/icons/nav-next.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './CommunityPage.css'

const TABS = ['INFO', '단체 플로깅']

const INFO_POSTS = [
  {
    id: 1,
    author: 'PLOBI',
    likes: '2.6K',
    title: '헷갈리는 분리배출 기준, 서울시가 알려드립니다!',
    preview: '자치구마다 달라 헷갈리던 분리배출 기준! 서울시가 딱 정리했어요. 함께 알아볼까요?...',
    full: `자치구마다 달라 헷갈리던 분리배출 기준! 서울시가 딱 정리했어요. 함께 알아볼까요?\n\n혼란은 이제 그만!\n분리배출 기준, 제대로 정리했어요!\n재활용 잘하고 있다고 생각했는데..\n"스티커는 떼야 하나? 자치구마다 배출 방식이 다른데?"\n\n서울시가 60여 개 품목에 대한 표준 배출 기준안을 마련했습니다.\n자치구마다 달랐던 기준을 하나로 통일한 것이죠!\n앞으로는 제로서울이 알려드리는 대로만 버리세요!`,
    hasImage: true,
    imageSlide: '2/4',
  },
  {
    id: 2,
    author: 'PLOBI',
    likes: '1.8K',
    title: '페트병, 이렇게 버려야 제대로 재활용됩니다',
    preview: '페트병 재활용률을 높이려면 라벨 제거부터 시작! 올바른 배출 방법 총정리...',
    full: `페트병 재활용률을 높이려면 라벨 제거부터 시작! 올바른 배출 방법 총정리.\n\n페트병을 그냥 버리면 재활용률이 떨어집니다.\n\n올바른 배출 방법:\n1. 라벨 제거 - 비닐 라벨은 따로 분리\n2. 내용물 비우기 - 깨끗이 헹구기\n3. 찌그러뜨리기 - 부피를 줄여 배출\n4. 뚜껑 분리 - 뚜껑도 플라스틱으로 따로 배출\n\n이 네 단계만 지켜도 재활용 효율이 크게 올라갑니다!`,
    hasImage: false,
    imageSlide: '',
  },
]

const GROUP_EVENTS = [
  {
    id: 1,
    title: '한강 공원 플로깅',
    location: '서울 영등포구 여의도 한강공원',
    date: '2026.06.21 AM 10:00',
    participants: '20명 모집',
    current: 8,
    max: 20,
    announcement: '플로깅 장갑, 집게, 봉지는 현장에서 제공됩니다. 편한 복장으로 오세요! 참여 전날 앱을 통해 참여 확정 알림을 보내드립니다.',
  },
  {
    id: 2,
    title: '대학로 거리 청소 플로깅',
    location: '서울 종로구 대학로 마로니에공원',
    date: '2026.06.25 AM 09:00',
    participants: '15명 모집',
    current: 5,
    max: 15,
    announcement: '우천 시 행사는 취소될 수 있습니다. 전날 앱 공지를 확인해 주세요.',
  },
  {
    id: 3,
    title: '월드컵 공원 플로깅',
    location: '서울 마포구 월드컵공원 하늘공원',
    date: '2026.06.28 PM 02:00',
    participants: '25명 모집',
    current: 12,
    max: 25,
    announcement: '집게와 장갑이 제공됩니다. 개인 수통 지참을 권장합니다.',
  },
]

type View =
  | { type: 'info-list' }
  | { type: 'info-detail'; postId: number }
  | { type: 'group-list' }
  | { type: 'group-detail'; eventId: number }

export default function CommunityPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [view, setView] = useState<View>({ type: 'info-list' })

  function handleTabChange(i: number) {
    setActiveTab(i)
    setView(i === 0 ? { type: 'info-list' } : { type: 'group-list' })
  }

  function handleBack() {
    if (view.type === 'info-detail') {
      setView({ type: 'info-list' })
    } else if (view.type === 'group-detail') {
      setView({ type: 'group-list' })
    } else {
      navigate('/')
    }
  }

  /* ── INFO 게시글 상세 ── */
  if (view.type === 'info-detail') {
    const post = INFO_POSTS.find(p => p.id === view.postId)!
    return (
      <>
        <header className="community-header">
          <button className="community-back-btn" onClick={handleBack}>
            <img src={backIcon} alt="뒤로" className="community-back-icon" />
          </button>
          <span className="community-title">커뮤니티</span>
        </header>
        <div className="community-tabbar">
          {TABS.map((tab, i) => (
            <button key={tab} className={`community-tab ${activeTab === i ? 'active' : ''}`} onClick={() => handleTabChange(i)}>
              {tab}
            </button>
          ))}
        </div>
        <div className="community-page">
          <div className="community-post">
            <div className="post-author-row">
              <div className="post-avatar">
                <img src={profileImg} alt={post.author} className="post-avatar-img" />
              </div>
              <span className="post-author-name">{post.author}</span>
            </div>
            {post.hasImage && (
              <div className="post-image-wrap">
                <img src={postImg} alt="" className="post-image" />
                {post.imageSlide && <div className="post-slide-badge">{post.imageSlide}</div>}
              </div>
            )}
            <div className="post-likes-row">
              <img src={heartIcon} alt="좋아요" className="post-heart-icon" />
              <span className="post-likes">{post.likes}</span>
            </div>
            <p className="post-title">{post.title}</p>
            <p className="post-body post-body-full">{post.full}</p>
          </div>
        </div>
        <BottomNav />
      </>
    )
  }

  /* ── 단체 플로깅 상세 ── */
  if (view.type === 'group-detail') {
    const event = GROUP_EVENTS.find(e => e.id === view.eventId)!
    const pct = Math.round((event.current / event.max) * 100)
    return (
      <>
        <header className="community-header">
          <button className="community-back-btn" onClick={handleBack}>
            <img src={backIcon} alt="뒤로" className="community-back-icon" />
          </button>
          <span className="community-title">커뮤니티</span>
        </header>
        <div className="event-detail-page">
          <div className="event-detail-image-wrap">
            <img src={eventImg} alt={event.title} className="event-detail-image" />
          </div>
          <div className="event-detail-content">
            <h2 className="event-detail-title">{event.title}</h2>
            <div className="event-detail-info">
              <div className="event-info-row">
                <img src={locationIcon} alt="" className="event-info-icon" />
                <span className="event-info-text">{event.location}</span>
              </div>
              <div className="event-info-row">
                <img src={clockIcon} alt="" className="event-info-icon" />
                <span className="event-info-text">{event.date}</span>
              </div>
              <div className="event-info-row">
                <img src={peopleIcon} alt="" className="event-info-icon" />
                <span className="event-info-text">{event.participants} ({event.current}/{event.max}명 참여중)</span>
              </div>
            </div>
            <div className="event-progress-wrap">
              <div className="event-progress-bar">
                <div className="event-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="event-progress-label">{pct}% 모집됨</span>
            </div>
            <div className="event-announcement">
              <img src={megaphoneIcon} alt="" className="event-megaphone-icon" />
              <div>
                <p className="event-announce-label">안내사항</p>
                <p className="event-announce-text">{event.announcement}</p>
              </div>
            </div>
            <button className="event-join-btn">참여하기</button>
          </div>
        </div>
        <BottomNav />
      </>
    )
  }

  /* ── 리스트 뷰 (INFO / 단체 플로깅) ── */
  return (
    <>
      <header className="community-header">
        <button className="community-back-btn" onClick={handleBack}>
          <img src={backIcon} alt="뒤로" className="community-back-icon" />
        </button>
        <span className="community-title">커뮤니티</span>
      </header>
      <div className="community-tabbar">
        {TABS.map((tab, i) => (
          <button key={tab} className={`community-tab ${activeTab === i ? 'active' : ''}`} onClick={() => handleTabChange(i)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 ? (
        /* INFO 목록 */
        <div className="community-page">
          {INFO_POSTS.map(post => (
            <div key={post.id} className="community-post">
              <div className="post-author-row">
                <div className="post-avatar">
                  <img src={profileImg} alt={post.author} className="post-avatar-img" />
                </div>
                <span className="post-author-name">{post.author}</span>
              </div>
              {post.hasImage && (
                <div className="post-image-wrap">
                  <img src={postImg} alt="" className="post-image" />
                  {post.imageSlide && <div className="post-slide-badge">{post.imageSlide}</div>}
                </div>
              )}
              <div className="post-likes-row">
                <img src={heartIcon} alt="좋아요" className="post-heart-icon" />
                <span className="post-likes">{post.likes}</span>
              </div>
              <p className="post-title">{post.title}</p>
              <p className="post-body">{post.preview}</p>
              <button
                className="post-more-btn"
                onClick={() => setView({ type: 'info-detail', postId: post.id })}
              >더보기</button>
            </div>
          ))}
        </div>
      ) : (
        /* 단체 플로깅 목록 */
        <div className="community-page group-page">
          {GROUP_EVENTS.map(event => (
            <div
              key={event.id}
              className="event-card"
              onClick={() => setView({ type: 'group-detail', eventId: event.id })}
            >
              <div className="event-card-image-wrap">
                <img src={eventImg} alt={event.title} className="event-card-image" />
                <div className="event-card-badge">{event.current}/{event.max}명</div>
              </div>
              <div className="event-card-body">
                <p className="event-card-title">{event.title}</p>
                <div className="event-info-row">
                  <img src={locationIcon} alt="" className="event-info-icon" />
                  <span className="event-info-text">{event.location}</span>
                </div>
                <div className="event-info-row">
                  <img src={clockIcon} alt="" className="event-info-icon" />
                  <span className="event-info-text">{event.date}</span>
                </div>
                <div className="event-info-row">
                  <img src={peopleIcon} alt="" className="event-info-icon" />
                  <span className="event-info-text">{event.participants}</span>
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
