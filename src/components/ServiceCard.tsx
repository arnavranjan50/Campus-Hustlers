import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, CreditCard, User, Mail, MessageSquare, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import type { Service } from '../data/services'
import { truncate, formatCurrency, generateStars } from '../utils/formatters'
import { useUser } from '../context/UserContext'
import { useRazorpay } from '../hooks/useRazorpay'
import styles from './ServiceCard.module.css'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [showBooking, setShowBooking] = useState(false)
  const [bookingSubmitted, setBookingSubmitted] = useState(false)
  const [paymentId, setPaymentId] = useState('')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const { user, isLoggedIn, isStudent } = useUser()
  const { initiatePayment, isProcessing } = useRazorpay()

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })

  const platformFee = Math.round(service.price * 0.05)
  const totalAmount = service.price + platformFee

  const navigate = useNavigate()

  const handleOpenBooking = () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    setForm({
      name: user ? user.fullName : '',
      email: user ? user.email : '',
      message: '',
    })
    setBookingSubmitted(false)
    setPaymentError(null)
    setPaymentId('')
    setShowBooking(true)
  }

  const handleSubmitBooking = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    setPaymentError(null)

    try {
      const result = await initiatePayment({
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        receipt: `booking_${service.id}_${Date.now()}`,
        description: service.title,
        prefill: {
          name: form.name,
          email: form.email,
        },
      })

      setShowBooking(false)
      navigate('/booking-success', {
        state: {
          paymentId: result.payment_id,
          orderId: result.order_id,
          serviceTitle: service.title,
          serviceProvider: service.provider,
          serviceCollege: service.college,
          servicePrice: service.price,
          platformFee,
          totalAmount,
          customerName: form.name,
          customerEmail: form.email,
        },
      })
    } catch (err: any) {
      if (err.message === 'PAYMENT_CANCELLED') {
        // User closed the Razorpay modal — do nothing
        return
      }
      setPaymentError(err.message || 'Payment failed. Please try again.')
    }
  }

  return (
    <>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -6 }}
      >
        {/* Top Row: Category Badge + Delivery Time */}
        <div className={styles.topRow}>
          <span className={styles.badge}>{service.category}</span>
          <span className={styles.deliveryTime}>
            <Clock size={12} />
            {service.deliveryTime}
          </span>
        </div>

        {/* Provider Info */}
        <div className={styles.provider}>
          <div className={styles.avatar}>{service.providerAvatar}</div>
          <div className={styles.providerInfo}>
            <span className={styles.providerName}>{service.provider}</span>
            <span className={styles.providerCollege}>{service.college}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className={styles.title}>{service.title}</h3>

        {/* Description */}
        <p className={styles.description}>{truncate(service.description, 100)}</p>

        {/* Tags */}
        <div className={styles.tags}>
          {service.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>

        {/* Bottom: Rating + Price + Book */}
        <div className={styles.bottom}>
          <div className={styles.ratingPrice}>
            <div className={styles.rating}>
              <span className={styles.stars}>{generateStars(service.rating)}</span>
              <span className={styles.ratingValue}>{service.rating}</span>
              <span className={styles.reviewCount}>({service.reviews})</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.price}>{formatCurrency(service.price)}</span>
              <span className={styles.platformFee}>+5% fee</span>
            </div>
          </div>
          {!isStudent && (
            <button className={styles.bookBtn} onClick={handleOpenBooking}>Book Now</button>
          )}
        </div>
      </motion.div>

      {/* ────── BOOKING MODAL ────── */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => !isProcessing && setShowBooking(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.modalClose}
                onClick={() => !isProcessing && setShowBooking(false)}
                aria-label="Close booking"
                disabled={isProcessing}
              >
                <X size={18} />
              </button>

              <AnimatePresence mode="wait">
                {!bookingSubmitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className={styles.modalTitle}>Book Service</h2>

                    {/* Service Summary */}
                    <div className={styles.bookingSummary}>
                      <div className={styles.bookingServiceName}>{service.title}</div>
                      <div className={styles.bookingProvider}>by {service.provider} · {service.college}</div>
                    </div>

                    {/* Price Breakdown */}
                    <div className={styles.priceBreakdown}>
                      <div className={styles.priceLineItem}>
                        <span>Service Price</span>
                        <span>{formatCurrency(service.price)}</span>
                      </div>
                      <div className={styles.priceLineItem}>
                        <span>Platform Fee (5%)</span>
                        <span>{formatCurrency(platformFee)}</span>
                      </div>
                      <div className={`${styles.priceLineItem} ${styles.priceTotal}`}>
                        <span>Total</span>
                        <span>{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>

                    {/* Booking Form */}
                    <div className={styles.bookingForm}>
                      <div className={styles.bookingField}>
                        <label className={styles.bookingLabel}>
                          <User size={14} /> Your Name
                        </label>
                        <input
                          type="text"
                          className={styles.bookingInput}
                          placeholder="Full name"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          disabled={isProcessing}
                        />
                      </div>
                      <div className={styles.bookingField}>
                        <label className={styles.bookingLabel}>
                          <Mail size={14} /> Email
                        </label>
                        <input
                          type="email"
                          className={styles.bookingInput}
                          placeholder="you@college.edu"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          disabled={isProcessing}
                        />
                      </div>
                      <div className={styles.bookingField}>
                        <label className={styles.bookingLabel}>
                          <MessageSquare size={14} /> Message (optional)
                        </label>
                        <textarea
                          className={styles.bookingTextarea}
                          placeholder="Describe your requirements…"
                          rows={3}
                          value={form.message}
                          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                          disabled={isProcessing}
                        />
                      </div>
                    </div>

                    {/* Payment Error */}
                    {paymentError && (
                      <motion.div
                        className={styles.paymentError}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <AlertTriangle size={14} />
                        <span>{paymentError}</span>
                      </motion.div>
                    )}

                    <button
                      className={styles.payBtn}
                      onClick={handleSubmitBooking}
                      disabled={!form.name.trim() || !form.email.trim() || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className={styles.spinner} />
                          Processing…
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} />
                          Proceed to Payment · {formatCurrency(totalAmount)}
                        </>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    className={styles.bookingSuccess}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={styles.successIcon}>
                      <CheckCircle size={48} />
                    </div>
                    <h3 className={styles.successTitle}>Payment Successful!</h3>
                    <p className={styles.successDesc}>
                      Your booking for <strong>{service.title}</strong> has been confirmed and payment of <strong>{formatCurrency(totalAmount)}</strong> received.
                    </p>
                    {paymentId && (
                      <p className={styles.paymentIdText}>
                        Payment ID: <code>{paymentId}</code>
                      </p>
                    )}
                    <p className={styles.successDesc}>
                      The provider will reach out to you at <strong>{form.email}</strong>.
                    </p>
                    <button
                      className={styles.successBtn}
                      onClick={() => setShowBooking(false)}
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
