import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import impactLogo from '@/assets/impact_analytics_logo_colored.png'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Card } from '@/components/ui/card'
import { COMPANY_NAME, PRODUCT_NAME } from '@/config/brand'
import './login.css'

const DEMO_EMAIL = 'admin_dummy@impactanalytics.co'
const DEMO_PASSWORD = 'password'

const NODES: [number, number][] = [
  [15, 20], [30, 60], [70, 15], [85, 45], [50, 80],
  [10, 75], [60, 35], [40, 50], [90, 75], [25, 35],
]

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail]           = useState(DEMO_EMAIL)
  const [password, setPassword]     = useState(DEMO_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]           = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Lock body scroll while on login page
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setIsSigningIn(true)
      setTimeout(() => navigate('/campaigns'), 1400)
    } else {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="login-container">

      {/* ── Sign-in loading overlay ───────────────────────── */}
      {isSigningIn && (
        <div className="login-signing-in">
          <div className="login-signing-spinner" />
          <p className="login-signing-text">Signing in...</p>
          <p className="login-signing-sub">Preparing your workspace</p>
        </div>
      )}

      {/* ── Agentic animated background ──────────────────── */}
      <div className="login-agentic-bg" aria-hidden="true">

        {/* Neural network lines + data packets */}
        <svg
          className="ln-svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Connection lines */}
          <line x1="216" y1="180" x2="432" y2="540" className="ln-line" style={{ animationDelay: '0s' }} />
          <line x1="216" y1="180" x2="360" y2="315" className="ln-line" style={{ animationDelay: '-2s' }} />
          <line x1="432" y1="540" x2="144" y2="675" className="ln-line" style={{ animationDelay: '-4s' }} />
          <line x1="432" y1="540" x2="864" y2="450" className="ln-line" style={{ animationDelay: '-6s' }} />
          <line x1="1008" y1="135" x2="864" y2="315" className="ln-line" style={{ animationDelay: '-8s' }} />
          <line x1="1008" y1="135" x2="1224" y2="405" className="ln-line" style={{ animationDelay: '-10s' }} />
          <line x1="1224" y1="405" x2="864"  y2="315" className="ln-line" style={{ animationDelay: '-1s' }} />
          <line x1="1224" y1="405" x2="1296" y2="675" className="ln-line" style={{ animationDelay: '-3s' }} />
          <line x1="720"  y1="720" x2="1296" y2="675" className="ln-line" style={{ animationDelay: '-5s' }} />
          <line x1="720"  y1="720" x2="144"  y2="675" className="ln-line" style={{ animationDelay: '-7s' }} />
          <line x1="864"  y1="315" x2="576"  y2="450" className="ln-line" style={{ animationDelay: '-9s' }} />
          <line x1="576"  y1="450" x2="360"  y2="315" className="ln-line" style={{ animationDelay: '-11s' }} />

          {/* Data packets */}
          <circle r="3.5" className="ln-pkt ln-pkt-cyan">
            <animateMotion dur="3.2s" repeatCount="indefinite" path="M216,180 L432,540 L144,675" />
          </circle>
          <circle r="3" className="ln-pkt ln-pkt-white">
            <animateMotion dur="4.1s" repeatCount="indefinite" path="M1008,135 L864,315 L1224,405 L1296,675" />
          </circle>
          <circle r="2.5" className="ln-pkt ln-pkt-violet">
            <animateMotion dur="3.7s" repeatCount="indefinite" path="M432,540 L864,450 L864,315 L576,450" />
          </circle>
          <circle r="2" className="ln-pkt ln-pkt-cyan">
            <animateMotion dur="5.3s" repeatCount="indefinite" path="M720,720 L144,675 L216,180 L360,315" />
          </circle>
          <circle r="3" className="ln-pkt ln-pkt-white">
            <animateMotion dur="4.8s" repeatCount="indefinite" path="M1224,405 L864,315 L432,540 L720,720" />
          </circle>
        </svg>

        {/* Pulsing nodes */}
        {NODES.map(([l, t], i) => (
          <div
            key={i}
            className="ln-node"
            style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${-(i * 0.4)}s` }}
          />
        ))}

        {/* Floating gradient orbs */}
        <div className="ln-orb ln-orb-cyan" />
        <div className="ln-orb ln-orb-violet" />
        <div className="ln-orb ln-orb-white" />

        {/* Rising particles */}
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className={`ln-particle ln-p${i % 6}`}
            style={{ left: `${6 + i * 6.5}%` }}
          />
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="login-content">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-panel">
            <img src={impactLogo} alt={COMPANY_NAME} />
          </div>
          <p className="login-tagline">Intelligent retail decisioning &amp; execution cloud</p>
        </div>

        {/* Login Card */}
        <Card size="medium">
          <div className="login-card">
            <h1 className="login-title">{PRODUCT_NAME}</h1>
            <p className="login-subtitle">Sign in to continue</p>

            <form onSubmit={handleSubmit} className="login-form">

              {/* Email */}
              <div className="form-field email-field">
                <label className="email-label">Email / User ID</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`email-input${error ? ' input-error' : ''}`}
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div className="form-field password-field">
                <label className="password-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`password-input${error ? ' input-error' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword
                      ? <EyeOff style={{ width: 20, height: 20 }} />
                      : <Eye     style={{ width: 20, height: 20 }} />
                    }
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="error-message">{error}</div>
              )}

              {/* Forgot password */}
              <div className="forgot-password-link">
                <span
                  className="forgot-password-disabled"
                  title="Contact your administrator to reset your password"
                >
                  Forgot Password?
                </span>
              </div>

              {/* Submit */}
              <Button
                variant="primary"
                size="large"
                className="login-button"
                onClick={handleSubmit}
              >
                Sign In
              </Button>

              {/* Sign-up note */}
              <div className="signup-link">
                Need access? Contact your administrator
              </div>

            </form>
          </div>
        </Card>

        {/* Footer */}
        <div className="login-footer">
          <p>{COMPANY_NAME} {PRODUCT_NAME} v1.0.0</p>
        </div>

      </div>{/* /login-content */}
    </div>
  )
}
