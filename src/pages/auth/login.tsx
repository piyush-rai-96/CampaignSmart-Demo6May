import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Card } from '@/components/ui/card'
import {
  COMPANY_NAME,
  IA_LOGO_COLORED_URL,
  PRODUCT_NAME,
  PRODUCT_NAME_LINE1,
  PRODUCT_NAME_LINE2,
  PRODUCT_TAGLINE,
} from '@/config/brand'
import './login.css'

const DEMO_EMAIL = 'admin_dummy@impactanalytics.co'
const DEMO_PASSWORD = 'password'

const SIGN_IN_STEPS = [
  'Authenticating…',
  'Loading agents…',
  'Opening workspace…',
] as const

const NODES: [number, number][] = [
  [15, 20], [30, 60], [70, 15], [85, 45], [50, 80],
  [10, 75], [60, 35], [40, 50], [90, 75], [25, 35],
]

const logoMotion = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const cardMotion = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 28, delay: 0.08 },
  },
}

const formStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
}

const formItem = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function LoginPage() {
  const navigate = useNavigate()
  const bgRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signInStep, setSignInStep] = useState(0)
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const emailLooksValid = email === DEMO_EMAIL

  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) window.clearTimeout(navigateTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (!isSigningIn) {
      setSignInStep(0)
      return
    }
    const t1 = window.setTimeout(() => setSignInStep(1), 470)
    const t2 = window.setTimeout(() => setSignInStep(2), 940)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [isSigningIn])

  const handleParallaxMove = useCallback((e: MouseEvent) => {
    const el = bgRef.current
    if (!el) return
    const mx = (e.clientX / window.innerWidth - 0.5) * 2
    const my = (e.clientY / window.innerHeight - 0.5) * 2
    el.style.setProperty('--mx', String(mx))
    el.style.setProperty('--my', String(my))
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return

    let raf = 0
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => handleParallaxMove(e))
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [handleParallaxMove])

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setIsSigningIn(true)
      if (navigateTimeoutRef.current) window.clearTimeout(navigateTimeoutRef.current)
      navigateTimeoutRef.current = window.setTimeout(() => navigate('/campaigns'), 1400)
    } else {
      setError('Invalid email or password.')
    }
  }

  return (
    <motion.div
      className="login-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <AnimatePresence>
        {isSigningIn && (
          <motion.div
            className="login-signing-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="login-signing-brand">
              <div className="login-signing-pulse" aria-hidden="true" />
              <motion.div
                className="login-signing-pulse login-signing-pulse--delay"
                aria-hidden="true"
              />
              <img
                src={IA_LOGO_COLORED_URL}
                alt=""
                className="login-signing-logo"
              />
            </div>
            <motion.p
              key={signInStep}
              className="login-signing-text"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {SIGN_IN_STEPS[signInStep]}
            </motion.p>
            <p className="login-signing-sub">Preparing your workspace</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={bgRef}
        className="login-agentic-bg"
        aria-hidden="true"
        style={{ '--mx': 0, '--my': 0 } as React.CSSProperties}
      >
        <svg
          className="ln-svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="216" y1="180" x2="432" y2="540" className="ln-line" style={{ animationDelay: '0s' }} />
          <line x1="216" y1="180" x2="360" y2="315" className="ln-line" style={{ animationDelay: '-2s' }} />
          <line x1="432" y1="540" x2="144" y2="675" className="ln-line" style={{ animationDelay: '-4s' }} />
          <line x1="432" y1="540" x2="864" y2="450" className="ln-line" style={{ animationDelay: '-6s' }} />
          <line x1="1008" y1="135" x2="864" y2="315" className="ln-line" style={{ animationDelay: '-8s' }} />
          <line x1="1008" y1="135" x2="1224" y2="405" className="ln-line" style={{ animationDelay: '-10s' }} />
          <line x1="1224" y1="405" x2="864" y2="315" className="ln-line" style={{ animationDelay: '-1s' }} />
          <line x1="1224" y1="405" x2="1296" y2="675" className="ln-line" style={{ animationDelay: '-3s' }} />
          <line x1="720" y1="720" x2="1296" y2="675" className="ln-line" style={{ animationDelay: '-5s' }} />
          <line x1="720" y1="720" x2="144" y2="675" className="ln-line" style={{ animationDelay: '-7s' }} />
          <line x1="864" y1="315" x2="576" y2="450" className="ln-line" style={{ animationDelay: '-9s' }} />
          <line x1="576" y1="450" x2="360" y2="315" className="ln-line" style={{ animationDelay: '-11s' }} />
          <line x1="360" y1="315" x2="1008" y2="135" className="ln-line" style={{ animationDelay: '-5.5s' }} />

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
          <circle r="2.5" className="ln-pkt ln-pkt-violet">
            <animateMotion dur="3.9s" repeatCount="indefinite" path="M360,315 L576,450 L1008,135" />
          </circle>
          <circle r="2" className="ln-pkt ln-pkt-cyan">
            <animateMotion dur="4.4s" repeatCount="indefinite" path="M1296,675 L720,720 L432,540" />
          </circle>
          <circle r="3" className="ln-pkt ln-pkt-white">
            <animateMotion dur="5.8s" repeatCount="indefinite" path="M144,675 L216,180 L1008,135" />
          </circle>
        </svg>

        {NODES.map(([l, t], i) => (
          <motion.div
            key={i}
            className="ln-node"
            style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${-(i * 0.4)}s` }}
          />
        ))}

        <motion.div className="ln-orb ln-orb-cyan" />
        <motion.div className="ln-orb ln-orb-violet" />
        <motion.div className="ln-orb ln-orb-white" />

        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div
            key={i}
            className={`ln-particle ln-p${i % 6}`}
            style={{ left: `${6 + i * 6.5}%` }}
          />
        ))}
      </motion.div>

      <div className="login-content">
        <motion.div
          className="login-logo"
          variants={logoMotion}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="login-logo-wrap">
            <img src={IA_LOGO_COLORED_URL} alt={COMPANY_NAME} />
          </motion.div>
          <p className="login-tagline">
            Intelligent retail decisioning &amp; execution cloud
          </p>
        </motion.div>

        <motion.div
          className="login-card-glow"
          variants={cardMotion}
          initial="hidden"
          animate="visible"
        >
          <Card size="medium">
            <motion.div className="login-card">
              <div className="login-title-block">
                <p className="login-title-line1">{PRODUCT_NAME_LINE1}</p>
                <h1 className="login-title-line2">{PRODUCT_NAME_LINE2}</h1>
              </div>
              <p className="login-subtitle">{PRODUCT_TAGLINE}</p>

              <motion.form
                onSubmit={handleSubmit}
                className="login-form"
                variants={formStagger}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="form-field email-field" variants={formItem}>
                  <label className="email-label" htmlFor="email">
                    Email / User ID
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`email-input${error ? ' input-error' : ''}${emailLooksValid ? ' input-valid' : ''}`}
                    autoComplete="username"
                  />
                </motion.div>

                <motion.div className="form-field password-field" variants={formItem}>
                  <label className="password-label" htmlFor="password">
                    Password
                  </label>
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
                      {showPassword ? (
                        <EyeOff style={{ width: 20, height: 20 }} />
                      ) : (
                        <Eye style={{ width: 20, height: 20 }} />
                      )}
                    </button>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      role="alert"
                      className="error-message"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div className="forgot-password-link" variants={formItem}>
                  <span
                    className="forgot-password-disabled"
                    title="Contact your administrator to reset your password"
                  >
                    Forgot Password?
                  </span>
                </motion.div>

                <motion.div variants={formItem}>
                  <Button
                    variant="primary"
                    size="large"
                    className={`login-button${isSigningIn ? ' login-button--loading' : ''}`}
                    onClick={handleSubmit}
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="login-button-spinner" size={18} />
                        Signing in…
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>

                <motion.div className="signup-link" variants={formItem}>
                  Need access? Contact your administrator
                </motion.div>
              </motion.form>
            </motion.div>
          </Card>
        </motion.div>

        <motion.div
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <p>
            {COMPANY_NAME} {PRODUCT_NAME} v1.0.0
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
