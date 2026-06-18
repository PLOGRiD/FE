import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bird from '../../../assets/auth/bird-angry.png'
import chevronLeft from '../../../assets/icons/chevron-left.png'
import Input from '../../../components/ui/Input/Input'
import './SignupPage.css'

export default function SignupPage() {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [email, setEmail] = useState('')

  const idError = id.length > 0 && !/^[a-zA-Z0-9]{6,10}$/.test(id)
    ? '띄어쓰기 없이 영/숫자 6-10자로 입력해주세요' : ''
  const pwError = pw.length > 0 && !/^(?=.*[a-zA-Z])(?=.*[\d\W]).{8,15}$/.test(pw)
    ? '8~15자의 영문, 숫자 또는 특수문자 조합으로 입력해주세요' : ''
  const pwConfirmError = pwConfirm.length > 0 && pw !== pwConfirm
    ? '비밀번호가 일치하지 않습니다' : ''
  const emailError = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? '올바른 이메일 형식을 입력해주세요' : ''

  const isValid =
    id.length > 0 && pw.length > 0 && pwConfirm.length > 0 && email.length > 0 &&
    !idError && !pwError && !pwConfirmError && !emailError

  return (
    <div className="signup-page">
      <div className="signup-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <img src={chevronLeft} alt="뒤로가기" className="back-icon" />
        </button>
      </div>

      <div className="signup-bird">
        <img src={bird} alt="캐릭터" className="signup-bird-img" />
      </div>

      <h2 className="signup-title">회원정보를 입력해주세요</h2>

      <div className="signup-form">
        <Input
          label="아이디"
          placeholder="아이디"
          value={id}
          onChange={setId}
          hint="*띄어쓰기 없이 영/숫자 6-10자"
          error={idError}
        />
        <Input
          label="비밀번호"
          placeholder="비밀번호"
          type="password"
          value={pw}
          onChange={setPw}
          hint="*8~15자의 영문, 숫자 또는 특수문자 조합"
          error={pwError}
        />
        <div className="pw-confirm">
          <Input
            placeholder="비밀번호 확인"
            type="password"
            value={pwConfirm}
            onChange={setPwConfirm}
            error={pwConfirmError}
          />
        </div>
        <Input
          label="이메일"
          placeholder="이메일"
          type="email"
          value={email}
          onChange={setEmail}
          error={emailError}
        />
      </div>

      <button
        className={`signup-submit${isValid ? ' active' : ''}`}
        disabled={!isValid}
        onClick={() => isValid && navigate('/')}
      >
        완료
      </button>
    </div>
  )
}
