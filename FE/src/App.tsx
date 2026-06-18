import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SplashPage from './pages/auth/SplashPage/SplashPage'
import LoginPage from './pages/auth/LoginPage/LoginPage'
import SignupPage from './pages/auth/SignupPage/SignupPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  )
}
