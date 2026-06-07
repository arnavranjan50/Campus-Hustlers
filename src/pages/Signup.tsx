import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  UserPlus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

import s from './Signup.module.css'

/* ── Animation Variants ──────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

/* ── Google SVG Icon ─────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
    </svg>
  )
}

/* ── GitHub SVG Icon ─────────────────────────────────── */
function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  )
}

/* ══════════════════════════════════════════════════════ */

export default function Signup() {
  const { signupWithEmail, loginWithGoogle, loginWithGithub } = useUser()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [college, setCollege] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [socialLoading, setSocialLoading] = useState('')

  const passwordsMatch = confirmPassword === '' || password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) return
    setError('')
    try {
      await signupWithEmail(email, password, { fullName, college })
      navigate('/dashboard')
    } catch (err: any) {
      const code = err?.code || ''
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try logging in.')
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.')
      } else {
        setError(err?.message || 'Signup failed. Please try again.')
      }
    }
  }

  const handleGoogleSignup = async () => {
    setError('')
    setSocialLoading('google')
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google sign-up failed.')
      }
    } finally {
      setSocialLoading('')
    }
  }

  const handleGithubSignup = async () => {
    setError('')
    setSocialLoading('github')
    try {
      await loginWithGithub()
      navigate('/dashboard')
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'GitHub sign-up failed.')
      }
    } finally {
      setSocialLoading('')
    }
  }

  return (
    <motion.div
      className="page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      <section className={s.signupPage}>
        {/* Background orbs */}
        <div className={s.bgOrbs}>
          <div className={s.orb1} />
          <div className={s.orb2} />
          <div className={s.orb3} />
        </div>

        {/* Grid lines decorative */}
        <div className={s.gridLines} />

        <motion.div
          className={s.card}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            {/* Branding */}
            <motion.div className={s.branding} variants={fadeUp}>
              <div className={s.logoMark}>
                <span className={s.logoIcon}>CH</span>
              </div>
              <h1 className={s.title}>Create Account</h1>
              <p className={s.subtitle}>Join the campus hustle — it&apos;s free</p>
            </motion.div>

            {/* Form */}
            <motion.form onSubmit={handleSubmit} className={s.form} variants={fadeUp}>
              {/* Full Name */}
              <div className={s.inputGroup}>
                <label className={s.label} htmlFor="fullName">Full Name</label>
                <div className={s.inputWrapper}>
                  <User size={18} className={s.inputIcon} />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={s.input}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className={s.inputGroup}>
                <label className={s.label} htmlFor="signupEmail">Email Address</label>
                <div className={s.inputWrapper}>
                  <Mail size={18} className={s.inputIcon} />
                  <input
                    id="signupEmail"
                    type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={s.input}
                    required
                  />
                </div>
              </div>

              {/* College */}
              <div className={s.inputGroup}>
                <label className={s.label} htmlFor="college">College / University</label>
                <div className={s.inputWrapper}>
                  <GraduationCap size={18} className={s.inputIcon} />
                  <input
                    id="college"
                    type="text"
                    placeholder="IIT Delhi, NIT Trichy…"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className={s.input}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className={s.row}>
                <div className={s.inputGroup}>
                  <label className={s.label} htmlFor="signupPassword">Password</label>
                  <div className={s.inputWrapper}>
                    <Lock size={18} className={s.inputIcon} />
                    <input
                      id="signupPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={s.input}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className={s.togglePassword}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className={s.inputGroup}>
                  <label className={s.label} htmlFor="confirmPassword">Confirm Password</label>
                  <div className={s.inputWrapper}>
                    <ShieldCheck size={18} className={s.inputIcon} />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${s.input} ${!passwordsMatch ? s.inputError : ''}`}
                      required
                    />
                    <button
                      type="button"
                      className={s.togglePassword}
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {!passwordsMatch && (
                    <span className={s.errorText}>Passwords do not match</span>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className={s.termsRow}>
                <label className={s.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className={s.checkbox}
                    required
                  />
                  <span className={s.checkboxCustom} />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className={s.termsLink}>Terms &amp; Conditions</Link>
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className={s.submitBtn} disabled={!agreeTerms}>
                <UserPlus size={18} />
                <span>Create Account</span>
                <ArrowRight size={16} className={s.submitArrow} />
              </button>

              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>
                  {error}
                </p>
              )}
            </motion.form>

            {/* Divider */}
            <motion.div className={s.divider} variants={fadeUp}>
              <span>or sign up with</span>
            </motion.div>

            {/* Social Auth */}
            <motion.div className={s.socialButtons} variants={fadeUp}>
              <button type="button" className={s.socialBtn} onClick={handleGoogleSignup} disabled={!!socialLoading}>
                <GoogleIcon />
                <span>{socialLoading === 'google' ? 'Signing up…' : 'Google'}</span>
              </button>
              <button type="button" className={`${s.socialBtn} ${s.socialBtnGithub}`} onClick={handleGithubSignup} disabled={!!socialLoading}>
                <GitHubIcon />
                <span>{socialLoading === 'github' ? 'Signing up…' : 'GitHub'}</span>
              </button>
            </motion.div>

            {/* Footer */}
            <motion.p className={s.footerText} variants={fadeUp}>
              Already have an account?{' '}
              <Link to="/login" className={s.footerLink}>
                Log In
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  )
}
