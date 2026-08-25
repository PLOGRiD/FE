import { useNavigate } from 'react-router-dom'
import defaultAvatar from '../../assets/mypage/default-avatar.png'
import leafIcon from '../../assets/mypage/leaf-icon.png'
import navNextIcon from '../../assets/home/icons/nav-next.svg'
import './MyPageProfile.css'

export default function MyPageProfile() {
  const navigate = useNavigate()
  const nickname = localStorage.getItem('nickname') ?? '사용자'
  const email = localStorage.getItem('email') ?? ''

  return (
    <div className="mypage-profile-section">
      <div className="mypage-profile-avatar">
        <img src={defaultAvatar} alt="프로필" className="mypage-profile-avatar-img" />
      </div>
      <div className="mypage-profile-info">
        <span className="mypage-profile-name-row">
          <span className="mypage-profile-name">{nickname}</span>
          <img src={leafIcon} alt="" className="mypage-profile-leaf-icon" />
        </span>
        <span className="mypage-profile-email">{email}</span>
      </div>
      <button className="mypage-profile-arrow" onClick={() => navigate('/mypage/etc')}>
        <img src={navNextIcon} alt="더보기" />
      </button>
    </div>
  )
}
