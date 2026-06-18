import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import profileImg from '../../../assets/community/profile.png'
import postImg from '../../../assets/community/post-img.png'
import heartIcon from '../../../assets/community/heart.svg'
import backIcon from '../../../assets/map/back.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './CommunityPage.css'

const TABS = ['INFO', '단체 플로깅']

const POSTS = [
  {
    id: 1,
    author: 'PLOBI',
    likes: '2.6K',
    title: '헷갈리는 분리배출 기준, 서울시가 알려드립니다!',
    body: '자치구마다 달라 헷갈리던 분리배출 기준! 서울시가 딱 정리했어요. 함께 알아볼까요?...',
    hasImage: true,
    imageSlide: '2/4',
  },
  {
    id: 2,
    author: 'PLOBI',
    likes: '2.6K',
    title: '헷갈리는 분리배출 기준, 서울시가 알려드립니다!',
    body: '자치구마다 달라 헷갈리던 분리배출 기준! 서울시가 딱 정리했어요. 함께 알아볼까요?',
    hasImage: false,
    imageSlide: '',
  },
]

export default function CommunityPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <>
      {/* Figma 365:44: 헤더 */}
      <header className="community-header">
        <button className="community-back-btn" onClick={() => navigate('/')}>
          <img src={backIcon} alt="뒤로" className="community-back-icon" />
        </button>
        <span className="community-title">커뮤니티</span>
      </header>

      {/* Figma 375:30: 탭바 h=36, border-bottom #e2e2e2 */}
      <div className="community-tabbar">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`community-tab ${activeTab === i ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 게시글 목록 */}
      <div className="community-page">
        {POSTS.map(post => (
          <div key={post.id} className="community-post">
            {/* 작성자 Figma 365:98: avatar w=44, h=45, radius=200 */}
            <div className="post-author-row">
              <div className="post-avatar">
                <img src={profileImg} alt={post.author} className="post-avatar-img" />
              </div>
              <span className="post-author-name">{post.author}</span>
            </div>

            {/* 이미지 Figma 365:100: h=294 */}
            {post.hasImage && (
              <div className="post-image-wrap">
                <img src={postImg} alt="" className="post-image" />
                {post.imageSlide && (
                  <div className="post-slide-badge">{post.imageSlide}</div>
                )}
              </div>
            )}

            {/* 좋아요 Figma 365:93 */}
            <div className="post-likes-row">
              <img src={heartIcon} alt="좋아요" className="post-heart-icon" />
              <span className="post-likes">{post.likes}</span>
            </div>

            {/* 제목·본문 */}
            <p className="post-title">{post.title}</p>
            <p className="post-body">{post.body}</p>
            {!post.hasImage && (
              <button className="post-more-btn">더보기</button>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </>
  )
}
