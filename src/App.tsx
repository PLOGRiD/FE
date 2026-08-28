import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SplashPage from './pages/auth/SplashPage/SplashPage'
import LoginPage from './pages/auth/LoginPage/LoginPage'
import SignupPage from './pages/auth/SignupPage/SignupPage'
import HomePage from './pages/home/HomePage'
import ChatPage from './pages/chat/ChatPage/ChatPage'
import WasteGuidePage from './pages/chat/WasteGuidePage/WasteGuidePage'
import MapPage from './pages/map/MapPage/MapPage'
import PloggingPage from './pages/plogging/PloggingPage/PloggingPage'
import PloggingResultPage from './pages/plogging/PloggingResultPage/PloggingResultPage'
import CommunityPage from './pages/community/CommunityPage/CommunityPage'
import WeeklyRanking from './pages/mypage/WeeklyRanking/WeeklyRanking'
import Contribution from './pages/mypage/Contribution/Contribution'
import MyPageEtc from './pages/mypage/MyPage/MyPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function RootGate() {
  const [firstVisit] = useState(() => {
    if (sessionStorage.getItem('splashShown')) return false
    sessionStorage.setItem('splashShown', '1')
    return true
  })
  return firstVisit ? <SplashPage /> : <HomePage />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<RootGate />} />
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/waste-guide" element={<WasteGuidePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/plogging" element={<PloggingPage />} />
        <Route path="/plogging/result" element={<PloggingResultPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/mypage" element={<WeeklyRanking />} />
        <Route path="/mypage/contribution" element={<Contribution />} />
        <Route path="/mypage/etc" element={<MyPageEtc />} />
      </Routes>
    </BrowserRouter>
  )
}
