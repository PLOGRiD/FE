import { useLocation, useNavigate } from 'react-router-dom'
import { PLOGGING_ICON_PATH, PLOGGING_ICON_VIEWBOX } from '../../assets/icons/ploggingPath'
import './BottomNav.css'

const icons: Record<string, string> = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  community: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  my: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
}

function ChatbotIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8V4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 8H6C4.89543 8 4 8.89543 4 10V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V10C20 8.89543 19.1046 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 14H4M20 14H22M15 13V15M9 13V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PloggingIcon() {
  return (
    <svg className="nav-icon nav-icon-plogging" viewBox={PLOGGING_ICON_VIEWBOX} fill="currentColor" aria-hidden="true">
      <path d={PLOGGING_ICON_PATH} />
    </svg>
  )
}

const iconComponents: Record<string, () => JSX.Element> = {
  chatbot: ChatbotIcon,
  plogging: PloggingIcon,
}

const tabs = [
  { path: '/', label: '홈', icon: 'home' },
  { path: '/chat', label: '챗봇', icon: 'chatbot' },
  { path: '/plogging', label: '플로깅', icon: 'plogging' },
  { path: '/community', label: '커뮤니티', icon: 'community' },
  { path: '/mypage', label: '마이페이지', icon: 'my' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/')
        const CustomIcon = iconComponents[tab.icon]
        return (
          <button
            key={tab.path}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="nav-icon-box">
              {CustomIcon ? (
                <CustomIcon />
              ) : (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={icons[tab.icon]} />
                </svg>
              )}
            </span>
            <span className="nav-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
