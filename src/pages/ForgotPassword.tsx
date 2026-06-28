import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { resetPassword } from '../lib/firebase'

import s from './Login.module.css'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch (err: any) {
      const code = err?.code || ''
      if (code === 'auth/user-not-found') {
        setError('No account found with this email.')
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.')
      } else {
        setError(err?.message || 'Failed to send reset email. Please try again.')
      }
    } finally {
      setLoading(false)
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
      <div className={s.container}>
        <motion.div
          className={s.card}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Branding */}
          <div className={s.branding}>
            <div className={s.logo}>CH</div>
            <h1 className={s.title}>Reset Password</h1>
            <p className={s.subtitle}>
              {sent
                ? 'Check your inbox for reset instructions'
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {sent ? (
            /* ── Success State ── */
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle
                size={56}
                style={{ color: '#22c55e', marginBottom: '1rem' }}
              />
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}>
                We've sent a password reset link to{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                <br />
                Check your inbox and follow the instructions to reset your password.
              </p>
              <Link to="/login" className={s.submitBtn} style={{ textDecoration: 'none', display: 'inline-flex' }}>
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} className={s.form}>
              {error && (
                <div className={s.errorBox}>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className={s.formGroup}>
                <label className={s.label}>Email Address</label>
                <div className={s.inputWrapper}>
                  <Mail size={18} className={s.inputIcon} />
                  <input
                    type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={s.input}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className={s.submitBtn} disabled={loading}>
                <Send size={18} />
                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
              </button>

              {/* Back to Login */}
              <p className={s.switchText}>
                Remember your password?{' '}
                <Link to="/login" className={s.switchLink}>
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
