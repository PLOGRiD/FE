import backIcon from '../../assets/map/back.svg'
import './Header.css'

interface HeaderProps {
  title: string
  onBack?: () => void
  rightIcon?: string
  onRightClick?: () => void
  noBorder?: boolean
}

export default function Header({ title, onBack, rightIcon, onRightClick, noBorder }: HeaderProps) {
  // 양쪽 슬롯을 항상 같은 너비(31px)로 고정해야 페이지마다 뒤로가기 버튼 위치가 똑같이 맞고,
  // 타이틀도 항상 정확히 가운데에 옵니다.
  const sideWidth = onBack || rightIcon ? 31 : 0

  return (
    <header className={`app-header ${noBorder ? 'app-header-no-border' : ''}`}>
      <div className="app-header-side" style={{ width: sideWidth }}>
        {onBack && (
          <button className="app-header-back-btn" onClick={onBack}>
            <img src={backIcon} alt="뒤로" className="app-header-back-icon" />
          </button>
        )}
      </div>
      <span className="app-header-title">{title}</span>
      <div className="app-header-side" style={{ width: sideWidth }}>
        {rightIcon && (
          <button className="app-header-right-btn" onClick={onRightClick}>
            <img src={rightIcon} alt="" className="app-header-right-icon" />
          </button>
        )}
      </div>
    </header>
  )
}
