import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import mascot from '../../../assets/chat/mascot.png'
import chatBgMascot from '../../../assets/chat/chat-bg-mascot.png'
import attachIcon from '../../../assets/chat/attach.svg'
import sendBtn from '../../../assets/chat/send-btn.svg'
import sessionIcon from '../../../assets/chat/session-icon.svg'
import trashIcon from '../../../assets/home/icons/trash.svg'
import BottomNav from '../../../components/BottomNav/BottomNav'
import Header from '../../../components/Header/Header'
import { sendChat, getSessions, getSessionMessages, deleteSessions } from '../../../api/chat'
import type { ChatSession } from '../../../api/chat'
import './ChatPage.css'

interface Message {
  id: number
  role: 'bot' | 'user'
  text: string
  imageUrl?: string
}

export default function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'bot', text: '안녕하세요! 저는 PLOGRiD의 플로비라고 해요. 분리배출에 대해 궁금한 것이 있으면 물어봐주세요. 🌍🌱' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<number | undefined>(undefined)
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [pendingPreview, setPendingPreview] = useState<string | null>(null)
  const [showSessions, setShowSessions] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (!pendingImage) {
      setPendingPreview(null)
      return
    }
    const url = URL.createObjectURL(pendingImage)
    setPendingPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingImage])

  async function send(text: string, image?: File) {
    if (!text.trim() || isTyping) return

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

  function toggleSessions() {
    if (!showSessions) getSessions().then(setSessions).catch(() => {})
    setSelecting(false)
    setSelectedIds([])
    setShowSessions(prev => !prev)
  }

  async function openSession(id: number) {
    setShowSessions(false)
    try {
      const msgs = await getSessionMessages(id)
      setMessages(msgs.map(m => ({
        id: m.chatLogId,
        role: m.chatRole === 'USER' ? 'user' : 'bot',
        text: m.message,
        imageUrl: m.imageUrl,
      })))
      setSessionId(id)
    } catch {}
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function cancelSelecting() {
    setSelecting(false)
    setSelectedIds([])
  }

  async function handleDeleteSelected() {
    try {
      await deleteSessions(selectedIds)
      setSessions(prev => prev.filter(s => !selectedIds.includes(s.chatSessionId)))
    } catch {}
    setSelecting(false)
    setSelectedIds([])
  }

  return (
    <>
      <Header title="플로비" onBack={() => navigate('/')} rightIcon={sessionIcon} onRightClick={toggleSessions} />

      {showSessions && (
        <>
          <div className="chat-sessions-backdrop" onClick={() => setShowSessions(false)} />
          <div className="chat-sessions-panel">
            <div className="chat-sessions-header">
              <span className="chat-sessions-title">최근 채팅 세션</span>
              <button className="chat-sessions-close" onClick={() => setShowSessions(false)}>✕</button>
            </div>
            <div className="chat-sessions-list">
              {sessions.map(s => (
                <div
                  key={s.chatSessionId}
                  className="chat-session-item"
                  onClick={() => selecting ? toggleSelect(s.chatSessionId) : openSession(s.chatSessionId)}
                >
                  {selecting && (
                    <span className={`chat-session-checkbox ${selectedIds.includes(s.chatSessionId) ? 'checked' : ''}`} />
                  )}
                  <span className="chat-session-item-icon">
                    <img src={sessionIcon} alt="" />
                  </span>
                  <span className="chat-session-item-title">{s.sessionTitle}</span>
                  <span className="chat-session-item-time">{s.lastMessageAt}</span>
                </div>
              ))}
            </div>
            {sessions.length > 0 && (
              selecting ? (
                <div className="chat-sessions-actions">
                  <button className="chat-sessions-cancel" onClick={cancelSelecting}>취소</button>
                  <button
                    className="chat-sessions-delete-selected"
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0}
                  >
                    삭제{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                  </button>
                </div>
              ) : (
                <button className="chat-sessions-delete-all" onClick={() => setSelecting(true)}>
                  <img src={trashIcon} alt="" />
                  채팅 세션 삭제하기
                </button>
              )
            )}
          </div>
        </>
      )}

      <div className="chat-messages-bg" />

      <div className="chat-bg-mascot">
        <img src={chatBgMascot} alt="" className="chat-bg-mascot-img" />
      </div>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-row ${msg.role}`}>
            {msg.role === 'bot' && (
              <div className="chat-bot-avatar">
                <div className="chat-avatar-inner">
                  <img src={mascot} alt="" className="chat-avatar-img" />
                </div>
              </div>
            )}
            <div className="chat-bubble-group">
              {msg.imageUrl && <img src={msg.imageUrl} alt="첨부" className="chat-attached-img" />}
              <div className={`chat-bubble ${msg.role}`} style={{ whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>
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
        {pendingPreview && (
          <div className="chat-attach-preview">
            <img src={pendingPreview} alt="첨부 이미지" className="chat-attach-preview-img" />
            <button className="chat-attach-preview-remove" onClick={() => setPendingImage(null)}>
              ✕
            </button>
          </div>
        )}
        <div className="chat-input-row">
          <div className="chat-input-wrap">
            <button className="chat-attach-btn" onClick={() => fileInputRef.current?.click()}>
              <img src={attachIcon} alt="" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAttach} />
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
            disabled={!input.trim() || isTyping}
          >
            <img src={sendBtn} alt="전송" />
          </button>
        </div>
      </div>

      <BottomNav />
    </>
  )
}
