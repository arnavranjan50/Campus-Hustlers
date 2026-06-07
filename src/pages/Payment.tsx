import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Lock,
  Check,
  Tag,
  Receipt,
  ChevronRight,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

import { formatCurrency } from '../utils/formatters'
import { getBreakdown } from '../utils/fees'
import { useRazorpay } from '../hooks/useRazorpay'

import s from './Payment.module.css'

/* ── Animation Variants ──────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

/* ── Mock Data ───────────────────────────────────────── */
const mockService = {
  title: 'Full-Stack Web Application Development',
  provider: 'Sneha Reddy',
  providerAvatar: 'SR',
  college: 'IIT Hyderabad',
  price: 8000,
  deliveryTime: '7 days',
  rating: 4.9,
  reviews: 47,
}

/* ══════════════════════════════════════════════════════ */

export default function Payment() {
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentId, setPaymentId] = useState('')
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const { initiatePayment, isProcessing } = useRazorpay()
  const navigate = useNavigate()

  const breakdown = getBreakdown(mockService.price)
  const discountAmount = couponApplied ? couponDiscount : 0
  const finalTotal = breakdown.total - discountAmount

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'CAMPUS20') {
      setCouponDiscount(Math.round(mockService.price * 0.2))
      setCouponApplied(true)
    } else if (couponCode.trim().toUpperCase() === 'FIRST10') {
      setCouponDiscount(Math.round(mockService.price * 0.1))
      setCouponApplied(true)
    } else {
      setCouponApplied(false)
      setCouponDiscount(0)
    }
  }

  const handlePay = async () => {
    setPaymentError(null)

    try {
      const result = await initiatePayment({
        amount: finalTotal * 100, // Convert to paise
        currency: 'INR',
        receipt: `payment_${Date.now()}`,
        description: mockService.title,
        prefill: {
          name: '',
          email: '',
        },
      })

      navigate('/booking-success', {
        state: {
          paymentId: result.payment_id,
          orderId: result.order_id,
          serviceTitle: mockService.title,
          serviceProvider: mockService.provider,
          serviceCollege: mockService.college,
          servicePrice: mockService.price,
          platformFee: breakdown.platformFee,
          totalAmount: finalTotal,
          customerName: '',
          customerEmail: '',
        },
      })
    } catch (err: any) {
      if (err.message === 'PAYMENT_CANCELLED') {
        return
      }
      setPaymentError(err.message || 'Payment failed. Please try again.')
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
      {/* ────── Hero Header ────── */}
      <section className={s.header}>
        <div className={s.headerOrbs}>
          <div className={s.headerOrbLeft} />
          <div className={s.headerOrbRight} />
        </div>
        <div className="container">
          <motion.div
            className={s.headerContent}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div className={s.headerBadge} variants={staggerChild}>
              <Lock size={14} />
              <span>Secure Checkout</span>
            </motion.div>
            <motion.h1 className={s.headerTitle} variants={staggerChild}>
              Complete Your <span className="gradient-text">Payment</span>
            </motion.h1>
            <motion.p className={s.headerSubtitle} variants={staggerChild}>
              Review your order and pay securely with Razorpay
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ────── Main Checkout Layout ────── */}
      <section className={s.checkout}>
        <div className={`container ${s.checkoutGrid}`}>
          {/* ──── LEFT: Order Summary ──── */}
          <motion.div
            className={s.orderSummary}
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className={`${s.card} glass-card`}>
              <div className={s.cardHeader}>
                <Receipt size={20} />
                <h3>Order Summary</h3>
              </div>

              <div className="divider" />

              {/* Service Info */}
              <div className={s.serviceInfo}>
                <div className={s.serviceAvatar}>
                  {mockService.providerAvatar}
                </div>
                <div className={s.serviceDetails}>
                  <h4 className={s.serviceTitle}>{mockService.title}</h4>
                  <p className={s.serviceProvider}>
                    by <span>{mockService.provider}</span> · {mockService.college}
                  </p>
                  <div className={s.serviceMeta}>
                    <span className={s.serviceRating}>
                      ★ {mockService.rating} ({mockService.reviews})
                    </span>
                    <span className={s.serviceDelivery}>
                      ⏱ {mockService.deliveryTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divider" />

              {/* Price Breakdown */}
              <div className={s.breakdown}>
                <div className={s.breakdownRow}>
                  <span>Service Price</span>
                  <span>{formatCurrency(breakdown.servicePrice)}</span>
                </div>
                <div className={s.breakdownRow}>
                  <span>
                    Platform Fee
                    <span className={s.feePercent}>
                      ({(breakdown.platformFeeRate * 100).toFixed(0)}%)
                    </span>
                  </span>
                  <span>{formatCurrency(breakdown.platformFee)}</span>
                </div>
                {couponApplied && (
                  <div className={`${s.breakdownRow} ${s.breakdownDiscount}`}>
                    <span>
                      <Check size={14} /> Coupon Discount
                    </span>
                    <span>−{formatCurrency(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="divider" />

              {/* Coupon */}
              <div className={s.coupon}>
                <label className={s.couponLabel}>
                  <Tag size={16} />
                  Have a coupon code?
                </label>
                <div className={s.couponInput}>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value)
                      if (couponApplied) {
                        setCouponApplied(false)
                        setCouponDiscount(0)
                      }
                    }}
                    disabled={paymentSuccess}
                  />
                  <button className={s.couponBtn} onClick={handleApplyCoupon} disabled={paymentSuccess}>
                    {couponApplied ? <Check size={16} /> : 'Apply'}
                  </button>
                </div>
                {couponApplied && (
                  <motion.p
                    className={s.couponSuccess}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Check size={14} /> Coupon applied! You save {formatCurrency(discountAmount)}
                  </motion.p>
                )}
              </div>

              <div className="divider" />

              {/* Total */}
              <div className={s.total}>
                <span>Total Amount</span>
                <span className={s.totalAmount}>{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </motion.div>

          {/* ──── RIGHT: Payment ──── */}
          <motion.div
            className={s.paymentForm}
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className={`${s.card} glass-card`}>
              <AnimatePresence mode="wait">
                {!paymentSuccess ? (
                  <motion.div
                    key="pay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={s.cardHeader}>
                      <CreditCard size={20} />
                      <h3>Payment</h3>
                    </div>

                    <div className="divider" />

                    {/* Razorpay info */}
                    <div className={s.razorpayInfo}>
                      <div className={s.razorpayBadge}>
                        <Shield size={18} />
                        <span>Powered by Razorpay</span>
                      </div>
                      <p className={s.razorpayDesc}>
                        Click the button below to securely pay using UPI, Cards, Net Banking, Wallets, and more — all handled by Razorpay's secure checkout.
                      </p>
                    </div>

                    {/* Payment Error */}
                    {paymentError && (
                      <motion.div
                        className={s.payError}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <AlertTriangle size={14} />
                        <span>{paymentError}</span>
                      </motion.div>
                    )}

                    <div className="divider" />

                    {/* Pay Button */}
                    <button
                      className={s.payBtn}
                      onClick={handlePay}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={18} className={s.spinner} />
                          <span>Processing…</span>
                        </>
                      ) : (
                        <>
                          <Lock size={18} />
                          <span>Pay {formatCurrency(finalTotal)}</span>
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>

                    {/* Security Badge */}
                    <div className={s.securityBadge}>
                      <Shield size={16} />
                      <span>
                        Your payment is secured with 256-bit SSL encryption via Razorpay.
                        We never store your card details.
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    className={s.successState}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={s.successIcon}>
                      <CheckCircle size={56} />
                    </div>
                    <h3 className={s.successTitle}>Payment Successful!</h3>
                    <p className={s.successDesc}>
                      Your payment of <strong>{formatCurrency(finalTotal)}</strong> for
                      <strong> {mockService.title}</strong> has been confirmed.
                    </p>
                    {paymentId && (
                      <p className={s.successPaymentId}>
                        Payment ID: <code>{paymentId}</code>
                      </p>
                    )}
                    <p className={s.successDesc}>
                      The provider <strong>{mockService.provider}</strong> will reach out to you shortly.
                    </p>
                    <div className={s.securityBadge}>
                      <Shield size={16} />
                      <span>
                        Payment verified and secured by Razorpay.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
