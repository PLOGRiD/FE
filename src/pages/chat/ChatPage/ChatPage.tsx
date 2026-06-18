import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import mascot from '../../../assets/chat/mascot.png'
import backIcon from '../../../assets/chat/back.svg'
import attachIcon from '../../../assets/chat/attach.svg'
import sendBtn from '../../../assets/chat/send-btn.svg'
import sessionIcon from '../../../assets/chat/session-icon.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './ChatPage.css'

interface Message {
  id: number
  role: 'bot' | 'user'
  text: string
}

const INITIAL: Message[] = [
  { id: 1, role: 'bot', text: '안녕하세요! 저는 PLOGRiD의 플로비라고 해요. 분리배출에 대해 궁금한 것이 있으면 물어봐주세요. 🐦🌱' },
]

export default function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>(INITIAL)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function send(text: string) {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text }])
    setInput('')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: '......' }])
    }, 1500)
  }

  return (
    <>
      {/* Figma 345:519 ChatHeader */}
      <header className="chat-header">
        {/* Figma 345:520: 뒤로가기 w=11, h=22 */}
        <button className="chat-back-btn" onClick={() => navigate('/')}>
          <img src={backIcon} alt="뒤로" className="chat-back-icon" />
        </button>
        {/* Figma 345:522: "플로비" center, SUIT Bold 15px */}
        <span className="chat-title">플로비</span>
        {/* Figma 345:525: 세션 bg=#f5f5f5, w=31, h=32, radius=7 */}
        <button className="chat-session-btn">
          <img src={sessionIcon} alt="" className="chat-session-icon" />
        </button>
      </header>

      {/* 메시지 목록 */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-row ${msg.role}`}>
            {msg.role === 'bot' && (
              /* Figma 345:528: avatar size=55, radius=200, border 0.5px #d4d4d4
                 Inner div (345:529): w=73, h=66, left=-9.5, top=1.5
                 Image inside: w=544.95%, h=483.96%, left=-284.84%, top=-356.06% */
              <div className="chat-bot-avatar">
                <div className="chat-avatar-inner">
                  <img src={mascot} alt="" className="chat-avatar-img" />
                </div>
              </div>
            )}
            <div className={`chat-bubble ${msg.role}`}>{msg.text}</div>
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

      {/* Figma 345:518: BackgroundMascot w=234, h=262, opacity=50%
          left=calc(33.33%+25px), top=492 (frame 기준) */}
      <div className="chat-bg-mascot">
        <img src={mascot} alt="" className="chat-bg-mascot-img" />
      </div>

      {/* Figma 345:550: 입력창 bg=white, h=96, shadow */}
      <div className="chat-input-area">
        {/* Figma 345:552: MessageInput w=304, h=46, bg=#f8f8f8, border 0.6px #dee4e9 */}
        <div className="chat-input-wrap">
          <button className="chat-attach-btn">
            <img src={attachIcon} alt="" />
          </button>
          <input
            className="chat-input"
            placeholder="메시지를 입력하세요"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
          />
        </div>
        {/* Figma 345:1934: SendButton w=47, h=46 */}
        <button className="chat-send-btn" onClick={() => send(input)} disabled={!input.trim()}>
          <img src={sendBtn} alt="전송" />
        </button>
      </div>

      <BottomNav />
    </>
  )
}
