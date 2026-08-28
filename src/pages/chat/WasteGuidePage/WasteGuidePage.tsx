import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import mascot from '../../../assets/chat/mascot.png'
import chatBgMascot from '../../../assets/chat/chat-bg-mascot.png'
import Header from '../../../components/Header/Header'
import { getWasteSortingGuide } from '../../../api/chat'
import '../ChatPage/ChatPage.css'
import './WasteGuidePage.css'

export default function WasteGuidePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const imageUrl = (location.state as { wasteImageUrl?: string } | null)?.wasteImageUrl ?? null

  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!imageUrl) {
      setLoading(false)
      setFailed(true)
      return
    }
    let cancelled = false
    getWasteSortingGuide(imageUrl)
      .then(message => { if (!cancelled) setAnswer(message) })
      .catch(() => { if (!cancelled) setFailed(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [imageUrl])

  return (
    <>
      <Header title="분리배출 안내" onBack={() => navigate(-1)} />

      <div className="chat-messages-bg waste-guide-bg" />

      <div className="chat-bg-mascot waste-guide-mascot">
        <img src={chatBgMascot} alt="" className="chat-bg-mascot-img" />
      </div>

      <div className="chat-messages waste-guide-messages">
        {imageUrl && (
          <div className="chat-row user">
            <div className="chat-bubble-group">
              <img src={imageUrl} alt="첨부" className="chat-attached-img" />
            </div>
          </div>
        )}

        <div className="chat-row bot">
          <div className="chat-bot-avatar">
            <div className="chat-avatar-inner">
              <img src={mascot} alt="" className="chat-avatar-img" />
            </div>
          </div>
          <div className="chat-bubble bot" style={{ whiteSpace: 'pre-wrap' }}>
            {loading ? (
              <span className="chat-typing"><span /><span /><span /></span>
            ) : failed ? (
              '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.'
            ) : answer}
          </div>
        </div>
      </div>
    </>
  )
}
