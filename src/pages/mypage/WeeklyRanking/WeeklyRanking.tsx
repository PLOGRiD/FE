import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import defaultAvatar from '../../../assets/mypage/default-avatar.png'
import medal1st from '../../../assets/home/icons/medal-1st.svg'
import medal2nd from '../../../assets/home/icons/medal-2nd.svg'
import medal3rd from '../../../assets/home/icons/medal-3rd.svg'
import navNextIcon from '../../../assets/home/icons/nav-next.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import Header from '../../../components/Header/Header'
import { getRanking } from '../../../api/member'
import type { RankItem } from '../../../api/member'
import './WeeklyRanking.css'

const MEDALS = [medal1st, medal2nd, medal3rd]

export default function WeeklyRanking() {
  const navigate = useNavigate()
  const nickname = localStorage.getItem('nickname') ?? '사용자'
  const email = localStorage.getItem('email') ?? ''

  const [topRankings, setTopRankings] = useState<RankItem[]>([])
  const [listRankings, setListRankings] = useState<RankItem[]>([])
  const [myRanking, setMyRanking] = useState<RankItem | null>(null)

  useEffect(() => {
    getRanking().then((r) => {
      setTopRankings(r.topRankings.slice(0, 3))
      setListRankings(r.topRankings.slice(3))
      setMyRanking(r.myRanking)
    }).catch(() => {})
  }, [])

  return (
    <>
      <Header title="마이페이지" />

      <div className="ranking-profile-section">
        <div className="ranking-profile-avatar">
          <img src={defaultAvatar} alt="프로필" className="ranking-profile-avatar-img" />
        </div>
        <div className="ranking-profile-info">
          <span className="ranking-profile-name">{nickname}</span>
          <span className="ranking-profile-email">{email}</span>
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
        {myRanking && (
          <div className="ranking-my-card">
            <div className="ranking-avatar ranking-avatar--md">
              <img src={defaultAvatar} alt="" className="ranking-avatar-img" />
            </div>
            <div className="ranking-my-info">
              <span className="ranking-my-name">{myRanking.nickName}</span>
              <span className="ranking-my-pts">{myRanking.contributionScore} pt</span>
            </div>
            <span className="ranking-my-rank">{myRanking.rank.toLocaleString()} 위</span>
          </div>
        )}

        <div className="ranking-top-section">
          {topRankings.map((r, i) => (
            <div key={r.memberId} className="ranking-top-item">
              <img src={MEDALS[i]} alt={`${r.rank}위`} className="ranking-medal" />
              <div className="ranking-avatar ranking-avatar--sm">
                <img src={defaultAvatar} alt="" className="ranking-avatar-img" />
              </div>
              <span className="ranking-top-name">{r.nickName}</span>
              <span className="ranking-top-pts">{r.contributionScore} pt</span>
            </div>
          ))}
        </div>

        <div className="ranking-list-section">
          {listRankings.map((r) => (
            <div key={r.memberId} className="ranking-list-item">
              <span className="ranking-list-num">{r.rank}</span>
              <div className="ranking-avatar ranking-avatar--sm">
                <img src={defaultAvatar} alt="" className="ranking-avatar-img" />
              </div>
              <span className="ranking-list-name">{r.nickName}</span>
              <span className="ranking-list-pts">{r.contributionScore} pt</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </>
  )
}
