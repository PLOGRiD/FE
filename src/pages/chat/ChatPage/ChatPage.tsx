import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import mascot from '../../../assets/chat/mascot.png'
import chatBgMascot from '../../../assets/chat/chat-bg-mascot.png'
import backIcon from '../../../assets/chat/back.svg'
import attachIcon from '../../../assets/chat/attach.svg'
import sendBtn from '../../../assets/chat/send-btn.svg'
import sessionIcon from '../../../assets/chat/session-icon.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import { sendChat } from '../../../api/chat'
import './ChatPage.css'

interface Message {
  id: number
  role: 'bot' | 'user'
  text: string
  imageUrl?: string
}

export default function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<number | undefined>(undefined)
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function send(text: string, image?: File) {
    if ((!text.trim() && !image) || isTyping) return

    const userMsg: Message = { id: Date.now(), role: 'user', text, imageUrl: image ? URL.createObjectURL(image) : undefined }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setPendingImage(null)
    setIsTyping(true)

    try {
      const res = await sendChat(text, sessionId, image)
      if (!sessionId) setSessionId(res.chatSessionId)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: res.message }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.' }])
    } finally {
      setIsTyping(false)
    }
  }

  function handleAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPendingImage(file)
    e.target.value = ''
  }

  const isEmpty = messages.length === 0 && !isTyping

  return (
    <>
      <header className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate('/')}>
          <img src={backIcon} alt="뒤로" className="chat-back-icon" />
        </button>
        <span className="chat-title">플로비</span>
        <button className="chat-session-btn">
          <img src={sessionIcon} alt="" className="chat-session-icon" />
        </button>
      </header>

      <div className="chat-messages-bg" />

      {!isEmpty && (
        <div className="chat-bg-mascot">
          <img src={chatBgMascot} alt="" className="chat-bg-mascot-img" />
        </div>
      )}

      <div className="chat-messages">
        {isEmpty && (
          <div className="chat-empty">
            <p className="chat-empty-title">플로비에게 물어보세요</p>
            <p className="chat-empty-sub">분리배출 방법이 궁금한 품목을 입력해보세요</p>
            <div className="chat-empty-chips">
              {['페트병', '비닐 봉지', '유리병', '건전지', '스티로폼'].map(chip => (
                <button key={chip} className="chat-chip" onClick={() => send(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`chat-row ${msg.role}`}>
            {msg.role === 'bot' && (
              <div className="chat-bot-avatar">
                <div className="chat-avatar-inner">
                  <img src={mascot} alt="" className="chat-avatar-img" />
                </div>
              </div>
            )}
            <div className={`chat-bubble ${msg.role}`} style={{ whiteSpace: 'pre-wrap' }}>
              {msg.imageUrl && <img src={msg.imageUrl} alt="첨부" className="chat-attached-img" />}
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-row bot">
            <div className="chat-bot-avatar">
              <div className="chat-avatar-inner">
                <img src={mascot} alt="" className="chat-avatar-img" />
              </div>
            </div>
            <div className="chat-bubble bot chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrap">
          <button className="chat-attach-btn" onClick={() => fileInputRef.current?.click()}>
            <img src={attachIcon} alt="" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAttach} />
          {pendingImage && <span className="chat-pending-img">📎 {pendingImage.name}</span>}
          <input
            className="chat-input"
            placeholder="메시지를 입력하세요"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input, pendingImage ?? undefined)}
          />
        </div>
        <button
          className="chat-send-btn"
          onClick={() => send(input, pendingImage ?? undefined)}
          disabled={(!input.trim() && !pendingImage) || isTyping}
        >
          <img src={sendBtn} alt="전송" />
        </button>
      </div>

      <BottomNav />
    </>
  )
}
