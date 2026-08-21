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

/* ── 키워드 응답 (백엔드 연동 시 이 함수만 API 호출로 교체) ── */
async function fetchBotResponse(text: string): Promise<string> {
  // TODO: replace with actual API call
  // const res = await fetch('/api/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message: text }),
  // })
  // return (await res.json()).reply

  await new Promise(r => setTimeout(r, 1200))
  return getKeywordReply(text)
}

function getKeywordReply(text: string): string {
  const t = text.toLowerCase()

  if (/(안녕|hi|hello|반가|처음)/.test(t))
    return '안녕하세요! 저는 분리배출 도우미 플로비예요 🐦\n궁금한 품목을 말씀해주시면 올바른 배출 방법을 알려드릴게요!'

  if (/(페트|pet병|생수병|음료병)/.test(t))
    return '페트(PET)는 이렇게 배출해요 ♻️\n\n① 뚜껑 제거 (뚜껑은 플라스틱류로 따로)\n② 라벨 제거 (비닐류로 따로)\n③ 내용물을 비우고 깨끗이 헹구기\n④ 찌그러뜨려 부피 줄이기\n⑤ 페트류 수거함에 배출'

  if (/(종이팩|두유|멸균|우유팩)/.test(t))
    return '종이팩은 일반 종이와 달라요 ♻️\n\n① 내용물 비우고 깨끗이 헹구기\n② 펼쳐서 말리기\n③ 종이팩 전용 수거함에 배출\n\n⚠️ 종이팩 전용 수거함이 없으면 주민센터에 별도 배출하세요.'

  if (/(종이|신문|박스|골판지|책|잡지|노트)/.test(t))
    return '종이류 배출 방법이에요 ♻️\n\n① 테이프·스테이플러 심 제거\n② 비닐 코팅된 종이는 일반쓰레기로\n③ 물에 젖은 종이는 일반쓰레기로\n④ 묶어서 종이류 수거함에 배출'

  if (/(유리|병|소주병|맥주병|와인)/.test(t))
    return '유리류 배출 방법이에요 ♻️\n\n① 내용물 비우고 헹구기\n② 뚜껑 제거 (재질에 따라 분리)\n③ 유리류 수거함에 배출\n\n⚠️ 깨진 유리는 신문지에 싸서 일반쓰레기로 배출하세요.'

  if (/(비닐|봉지|포장지|랩|지퍼백|비닐백)/.test(t))
    return '비닐류 배출 방법이에요 ♻️\n\n① 음식물 등 이물질 제거\n② 세척 후 말리기\n③ 비닐류 수거함에 배출\n\n⚠️ 오염이 심하거나 복합재질 비닐은 일반쓰레기로 배출하세요.'

  if (/(건전지|전지|배터리)/.test(t))
    return '폐건전지 배출 방법이에요 🔋\n\n① 마트·편의점·주민센터에 있는\n   폐건전지 전용 수거함에 배출\n② 일반쓰레기·재활용함에 절대 버리지 마세요\n\n리튬 배터리(스마트폰·노트북)는 전자제품 판매점에서 수거합니다.'

  if (/(금속|캔|알루미늄|철|통조림|스프레이)/.test(t))
    return '금속류 배출 방법이에요 ♻️\n\n① 내용물 완전히 비우기\n② 스프레이 캔은 구멍 뚫어 가스 제거 후 배출\n③ 찌그러뜨려 부피 줄이기\n④ 금속류 수거함에 배출'

  if (/(플라스틱|PP|PE|PVC|용기|그릇|컵|바구니)/.test(t))
    return '플라스틱류 배출 방법이에요 ♻️\n\n① 내용물 비우고 이물질 제거\n② 세척 후 배출\n③ 용기 바닥의 재활용 마크 확인\n④ 플라스틱류 수거함에 배출\n\n⚠️ 오염이 심한 플라스틱은 일반쓰레기로 배출하세요.'

  if (/(스티로폼|발포|EPS|아이스박스)/.test(t))
    return '발포합성수지(스티로폼) 배출 방법이에요 ♻️\n\n① 이물질·테이프 제거\n② 음식물 묻은 경우 깨끗이 세척\n③ 발포합성수지 수거함에 배출\n\n⚠️ 색깔 있는 스티로폼은 일반쓰레기로 배출하세요.'

  if (/(의류|옷|섬유|천|신발|가방)/.test(t))
    return '의류·원단 배출 방법이에요 ♻️\n\n① 세탁 후 깨끗한 상태로 배출\n② 아파트·주민센터 폐의류 수거함 이용\n③ 재사용 가능하면 중고 기증도 추천!\n\n⚠️ 심하게 오염된 의류는 일반쓰레기로 배출하세요.'

  if (/(전자|가전|컴퓨터|TV|냉장고|세탁기|핸드폰|스마트폰|노트북)/.test(t))
    return '전기·전자제품 배출 방법이에요 ♻️\n\n소형(30cm 이하):\n→ 동 주민센터·마트 소형 폐가전 수거함\n\n대형(TV·냉장고 등):\n→ 한국전자제품자원순환공제조합 콜센터\n   📞 1599-0903 (무상수거 신청)\n\n⚠️ 개인정보는 꼭 삭제 후 배출하세요.'

  if (/(형광등|조명|전구|LED)/.test(t))
    return '폐형광등 배출 방법이에요 💡\n\n① 깨지지 않게 조심히 보관\n② 아파트·주민센터·마트의\n   폐형광등 전용 수거함에 배출\n\n⚠️ 형광등에는 수은이 포함되어 있어\n절대 일반쓰레기로 버리지 마세요!'

  if (/(음식물|음쓰|잔반|남은 음식)/.test(t))
    return '음식물쓰레기 배출 방법이에요 🍃\n\n① 물기 꽉 짜기 (중량 기준 과금)\n② 음식물쓰레기 전용 봉투 사용\n③ 지정된 수거함에 배출\n\n⚠️ 동물 뼈, 조개껍데기, 복숭아씨,\n양파 껍질, 파뿌리는 일반쓰레기로 배출하세요.'

  if (/(뭐|어떻|어떤|알려|도움|방법|어디|배출|버리)/.test(t))
    return '어떤 품목이 궁금하신가요? 😊\n\n아래 품목 중 하나를 입력해주세요:\n\n페트 · 종이 · 종이팩 · 유리\n비닐 · 금속류 · 플라스틱\n건전지 · 스티로폼 · 의류\n형광등 · 전자제품 · 음식물'

  if (/(감사|고마|도움 됐|잘 알|이해)/.test(t))
    return '도움이 됐다니 기쁘네요! 🐦\n올바른 분리배출로 함께 지구를 지켜요 🌍\n또 궁금한 점이 생기면 언제든지 물어봐주세요!'

  return '죄송해요, 정확히 이해하지 못했어요 😅\n\n어떤 품목의 분리배출 방법이 궁금하신가요?\n예: "페트병 버리는 방법" / "비닐 분리수거" / "건전지 어디 버려요?"'
}

export default function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function send(text: string) {
    if (!text.trim() || isTyping) return

    const userMsg: Message = { id: Date.now(), role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const reply = await fetchBotResponse(text)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: reply }])
    } finally {
      setIsTyping(false)
    }
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

      <div className="chat-messages">
        {/* 빈 화면 안내 */}
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

      {!isEmpty && (
        <div className="chat-bg-mascot">
          <img src={mascot} alt="" className="chat-bg-mascot-img" />
        </div>
      )}

      <div className="chat-input-area">
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
        <button className="chat-send-btn" onClick={() => send(input)} disabled={!input.trim() || isTyping}>
          <img src={sendBtn} alt="전송" />
        </button>
      </div>

      <BottomNav />
    </>
  )
}
