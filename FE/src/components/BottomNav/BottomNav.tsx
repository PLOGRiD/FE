import { useLocation, useNavigate } from 'react-router-dom'
import homeIcon from '../../assets/icons/home.svg'
import mapIcon from '../../assets/icons/map.svg'
import recordIcon from '../../assets/icons/record.svg'
import communityIcon from '../../assets/icons/community.svg'
import myIcon from '../../assets/icons/my.svg'
import './BottomNav.css'

const tabs = [
  { path: '/', label: '홈', icon: homeIcon },
  { path: '/map', label: '지도', icon: mapIcon },
  { path: '/record', label: '기록', icon: recordIcon },
  { path: '/community', label: '커뮤니티', icon: communityIcon },
  { path: '/mypage', label: 'MY', icon: myIcon },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <img
              src={tab.icon}
              alt={tab.label}
              className="nav-icon"
              style={{ filter: active ? 'none' : 'invert(60%)' }}
            />
            <span className="nav-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
