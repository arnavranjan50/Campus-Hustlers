import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import styles from './Loader.module.css'

interface LoaderProps {
  onFinished: () => void
}

const statusMessages = [
  { threshold: 0, text: 'Initializing hustle space...' },
  { threshold: 25, text: 'Connecting student portfolio networks...' },
  { threshold: 50, text: 'Syncing hackathons & live events...' },
  { threshold: 75, text: 'Optimizing workspace environment...' },
  { threshold: 92, text: 'Hustle mode activated!' }
]

export default function Loader({ onFinished }: LoaderProps) {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState(statusMessages[0].text)

  useEffect(() => {
    // Disable body scroll while loading
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    // Duration of loader in milliseconds (approx 2.5 seconds total)
    const duration = 2400
    const intervalTime = 30
    const steps = duration / intervalTime
    const stepIncrement = 100 / steps

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + stepIncrement
        if (next >= 100) {
          clearInterval(timer)
          // Small delay at 100% for smooth UX before calling onFinished
          setTimeout(() => {
            onFinished()
          }, 300)
          return 100
        }
        return next
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [onFinished])

  // Update status messages dynamically based on current progress
  useEffect(() => {
    const currentStatus = [...statusMessages]
      .reverse()
      .find((msg) => progress >= msg.threshold)
    
    if (currentStatus) {
      setStatusText(currentStatus.text)
    }
  }, [progress])

  return (
    <motion.div
      className={styles.loaderContainer}
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        y: -30,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
      }}
    >
      <div className={styles.content}>
        {/* Animated Emblem */}
        <motion.div 
          className={styles.logoWrapper}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className={styles.outerRing} />
          <div className={styles.innerRing} />
          <div className={styles.logoEmblem}>
            <Zap size={36} className={styles.logoIcon} fill="currentColor" />
          </div>
        </motion.div>

        {/* Brand/Title */}
        <div className={styles.branding}>
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Campus Hustlers
          </motion.h1>
          <motion.span 
            className={styles.subtitle}
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 0.8, letterSpacing: '0.3em' }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Empower. Hustle. Succeed.
          </motion.span>
        </div>

        {/* Progress & Status */}
        <motion.div 
          className={styles.statusContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className={styles.progressBarTrack}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <span className={styles.statusText}>
            {statusText} ({Math.round(progress)}%)
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
