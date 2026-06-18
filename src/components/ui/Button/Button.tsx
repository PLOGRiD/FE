import './Button.css'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'mint' | 'green' | 'outline'
  fullWidth?: boolean
}

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'mint',
  fullWidth = true,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
