import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SplashPage from './pages/auth/SplashPage/SplashPage'
import LoginPage from './pages/auth/LoginPage/LoginPage'
import SignupPage from './pages/auth/SignupPage/SignupPage'
import HomePage from './pages/home/HomePage'
import ChatPage from './pages/chat/ChatPage/ChatPage'
import MapPage from './pages/map/MapPage/MapPage'
import PloggingPage from './pages/plogging/PloggingPage/PloggingPage'
import PloggingResultPage from './pages/plogging/PloggingResultPage/PloggingResultPage'
import CommunityPage from './pages/community/CommunityPage/CommunityPage'
import WeeklyRanking from './pages/mypage/WeeklyRanking/WeeklyRanking'
import Contribution from './pages/mypage/Contribution/Contribution'
import MyPageEtc from './pages/mypage/MyPage/MyPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/chat" element={<ChatPage />} />
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
