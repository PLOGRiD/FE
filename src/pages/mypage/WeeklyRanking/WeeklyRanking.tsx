import { useNavigate } from 'react-router-dom'
import defaultAvatar from '../../../assets/mypage/default-avatar.png'
import medal1st from '../../../assets/home/icons/medal-1st.svg'
import medal2nd from '../../../assets/home/icons/medal-2nd.svg'
import medal3rd from '../../../assets/home/icons/medal-3rd.svg'
import navNextIcon from '../../../assets/home/icons/nav-next.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './WeeklyRanking.css'

const listRankers = [
  { rank: 4, name: '지구혼자쓰나', pts: 250 },
  { rank: 5, name: '야르르르', pts: 160 },
  { rank: 6, name: '돈주세요', pts: 160 },
  { rank: 7, name: '힘들어요', pts: 250 },
  { rank: 8, name: '냐냐냥', pts: 160 },
  { rank: 9, name: '도레미파', pts: 160 },
  { rank: 10, name: '멜라토닌', pts: 160 },
]

export default function WeeklyRanking() {
  const navigate = useNavigate()
  const nickname = localStorage.getItem('nickname') ?? '사용자'

  const topRankers = [
    { rank: 1, name: '지구혼자쓰나', pts: 250, medal: medal1st },
    { rank: 2, name: nickname, pts: 160, medal: medal2nd },
    { rank: 3, name: '분리수거의악마', pts: 160, medal: medal3rd },
  ]

  return (
    <>
      <header className="ranking-header">
        <span className="ranking-header-title">마이페이지</span>
      </header>

      <div className="ranking-profile-section">
        <div className="ranking-profile-avatar">
          <img src={defaultAvatar} alt="프로필" className="ranking-profile-avatar-img" />
        </div>
        <div className="ranking-profile-info">
          <span className="ranking-profile-name">{nickname}</span>
          <span className="ranking-profile-email">ddkkssj123@gmail.com</span>
        </div>
        <button className="ranking-profile-arrow" onClick={() => navigate('/mypage/etc')}>
          <img src={navNextIcon} alt="더보기" />
        </button>
      </div>

      <div className="ranking-tabbar">
        <button className="ranking-tab" onClick={() => navigate('/mypage/contribution')}>환경 기여</button>
        <button className="ranking-tab active">주간 랭킹</button>
      </div>

      <div className="ranking-page">
        <div className="ranking-my-card">
          <div className="ranking-avatar ranking-avatar--md">
            <img src={defaultAvatar} alt="" className="ranking-avatar-img" />
          </div>
          <div className="ranking-my-info">
            <span className="ranking-my-name">{nickname}</span>
            <span className="ranking-my-pts">160 pt</span>
          </div>
          <span className="ranking-my-rank">68,153 위</span>
        </div>

        <div className="ranking-top-section">
          {topRankers.map((r) => (
            <div key={r.rank} className="ranking-top-item">
              <img src={r.medal} alt={`${r.rank}위`} className="ranking-medal" />
              <div className="ranking-avatar ranking-avatar--sm">
                <img src={defaultAvatar} alt="" className="ranking-avatar-img" />
              </div>
              <span className="ranking-top-name">{r.name}</span>
              <span className="ranking-top-pts">{r.pts} pt</span>
            </div>
          ))}
        </div>

        <div className="ranking-list-section">
          {listRankers.map((r) => (
            <div key={r.rank} className="ranking-list-item">
              <span className="ranking-list-num">{r.rank}</span>
              <div className="ranking-avatar ranking-avatar--sm">
                <img src={defaultAvatar} alt="" className="ranking-avatar-img" />
              </div>
              <span className="ranking-list-name">{r.name}</span>
              <span className="ranking-list-pts">{r.pts} pt</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </>
  )
}
