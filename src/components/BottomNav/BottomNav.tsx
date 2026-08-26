import { useLocation, useNavigate } from 'react-router-dom'
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
    <svg className="nav-icon nav-icon-plogging" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M4.75 0C3.49022 0 2.28204 0.500445 1.39124 1.39124C0.500445 2.28204 0 3.49022 0 4.75C0 6.00978 0.500445 7.21796 1.39124 8.10876C2.28204 8.99955 3.49022 9.5 4.75 9.5H8.75C8.94891 9.5 9.13968 9.42098 9.28033 9.28033C9.42098 9.13968 9.5 8.94891 9.5 8.75V4.75C9.5 3.49022 8.99955 2.28204 8.10876 1.39124C7.21796 0.500445 6.00978 0 4.75 0ZM4.75 20C3.49022 20 2.28204 19.4996 1.39124 18.6088C0.500445 17.718 0 16.5098 0 15.25C0 13.9902 0.500445 12.782 1.39124 11.8912C2.28204 11.0004 3.49022 10.5 4.75 10.5H8.75C8.94891 10.5 9.13968 10.579 9.28033 10.7197C9.42098 10.8603 9.5 11.0511 9.5 11.25V15.25C9.5 15.8738 9.37714 16.4915 9.13843 17.0677C8.89972 17.644 8.54984 18.1677 8.10876 18.6088C7.66768 19.0498 7.14404 19.3997 6.56775 19.6384C5.99145 19.8771 5.37378 20 4.75 20ZM15.25 0C16.5098 0 17.718 0.500445 18.6088 1.39124C19.4996 2.28204 20 3.49022 20 4.75C20 6.00978 19.4996 7.21796 18.6088 8.10876C17.718 8.99955 16.5098 9.5 15.25 9.5H11.25C11.0511 9.5 10.8603 9.42098 10.7197 9.28033C10.579 9.13968 10.5 8.94891 10.5 8.75V4.75C10.5 3.49022 11.0004 2.28204 11.8912 1.39124C12.782 0.500445 13.9902 0 15.25 0ZM15.25 20C16.5098 20 17.718 19.4996 18.6088 18.6088C19.4996 17.718 20 16.5098 20 15.25C20 13.9902 19.4996 12.782 18.6088 11.8912C17.718 11.0004 16.5098 10.5 15.25 10.5H11.25C11.0511 10.5 10.8603 10.579 10.7197 10.7197C10.579 10.8603 10.5 11.0511 10.5 11.25V15.25C10.5 15.8738 10.6229 16.4915 10.8616 17.0677C11.1003 17.644 11.4502 18.1677 11.8912 18.6088C12.782 19.4996 13.9902 20 15.25 20Z" fill="currentColor" />
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
