import './Input.css'

interface InputProps {
  label?: string
  placeholder: string
  type?: string
  value: string
  onChange: (v: string) => void
  hint?: string
  error?: string
}

export default function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  hint,
  error,
}: InputProps) {
  return (
    <div className="input-wrap">
      {(label || hint) && (
        <div className="input-label-row">
          {label && <span className="input-label">{label}</span>}
          {hint && <span className="input-hint">{hint}</span>}
        </div>
      )}
      <input
        className={`input-field${error ? ' input-error' : ''}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="input-message">{error}</p>}
    </div>
  )
}
