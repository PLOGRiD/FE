import backIcon from '../../assets/map/back.svg'
import './Header.css'

interface HeaderProps {
  title: string
  onBack?: () => void
  rightIcon?: string
  onRightClick?: () => void
}

export default function Header({ title, onBack, rightIcon, onRightClick }: HeaderProps) {
  return (
    <header className="app-header">
      {onBack && (
        <div className={`app-header-side ${rightIcon ? 'app-header-side-wide' : ''}`}>
          <button className="app-header-back-btn" onClick={onBack}>
            <img src={backIcon} alt="뒤로" className="app-header-back-icon" />
          </button>
        </div>
      )}
      <span className="app-header-title">{title}</span>
      {rightIcon && (
        <button className="app-header-right-btn" onClick={onRightClick}>
          <img src={rightIcon} alt="" className="app-header-right-icon" />
        </button>
      )}
    </header>
  )
}
