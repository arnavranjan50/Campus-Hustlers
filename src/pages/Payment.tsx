import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Smartphone,
  Building,
  Shield,
  Lock,
  Check,
  Tag,
  Receipt,
  ChevronRight,
} from 'lucide-react'

import { formatCurrency } from '../utils/formatters'
import { getBreakdown } from '../utils/fees'

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

/* ── Types ───────────────────────────────────────────── */
type PaymentMethod = 'upi' | 'card' | 'netbanking'

interface CardForm {
  number: string
  expiry: string
  cvv: string
  name: string
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

const banks = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Yes Bank',
]

/* ══════════════════════════════════════════════════════ */

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [upiId, setUpiId] = useState('')
  const [card, setCard] = useState<CardForm>({ number: '', expiry: '', cvv: '', name: '' })
  const [selectedBank, setSelectedBank] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)

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

  const handleCardChange = (field: keyof CardForm, value: string) => {
    setCard((prev) => ({ ...prev, [field]: value }))
  }

  const paymentTabs: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: 'upi', label: 'UPI', icon: <Smartphone size={18} /> },
    { id: 'card', label: 'Card', icon: <CreditCard size={18} /> },
    { id: 'netbanking', label: 'Net Banking', icon: <Building size={18} /> },
  ]

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
              Review your order and choose a payment method
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
                  />
                  <button className={s.couponBtn} onClick={handleApplyCoupon}>
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

          {/* ──── RIGHT: Payment Form ──── */}
          <motion.div
            className={s.paymentForm}
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className={`${s.card} glass-card`}>
              <div className={s.cardHeader}>
                <CreditCard size={20} />
                <h3>Payment Method</h3>
              </div>

              <div className="divider" />

              {/* Payment Method Tabs */}
              <div className={s.tabs}>
                {paymentTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`${s.tab} ${paymentMethod === tab.id ? s.tabActive : ''}`}
                    onClick={() => setPaymentMethod(tab.id)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {paymentMethod === tab.id && (
                      <motion.div
                        className={s.tabIndicator}
                        layoutId="paymentTab"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <motion.div
                className={s.tabContent}
                key={paymentMethod}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* UPI Tab */}
                {paymentMethod === 'upi' && (
                  <div className={s.formGroup}>
                    <label className={s.label}>UPI ID</label>
                    <div className={s.inputWrapper}>
                      <Smartphone size={18} className={s.inputIcon} />
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className={s.input}
                      />
                    </div>
                    <p className={s.inputHint}>
                      Enter your UPI ID (e.g., name@paytm, name@okaxis)
                    </p>
                  </div>
                )}

                {/* Card Tab */}
                {paymentMethod === 'card' && (
                  <div className={s.cardFields}>
                    <div className={s.formGroup}>
                      <label className={s.label}>Card Number</label>
                      <div className={s.inputWrapper}>
                        <CreditCard size={18} className={s.inputIcon} />
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={card.number}
                          onChange={(e) => handleCardChange('number', e.target.value)}
                          className={s.input}
                          maxLength={19}
                        />
                      </div>
                    </div>

                    <div className={s.formRow}>
                      <div className={s.formGroup}>
                        <label className={s.label}>Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={card.expiry}
                          onChange={(e) => handleCardChange('expiry', e.target.value)}
                          className={s.input}
                          maxLength={5}
                        />
                      </div>
                      <div className={s.formGroup}>
                        <label className={s.label}>CVV</label>
                        <div className={s.inputWrapper}>
                          <Lock size={18} className={s.inputIcon} />
                          <input
                            type="password"
                            placeholder="•••"
                            value={card.cvv}
                            onChange={(e) => handleCardChange('cvv', e.target.value)}
                            className={s.input}
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={s.formGroup}>
                      <label className={s.label}>Name on Card</label>
                      <input
                        type="text"
                        placeholder="Full name as on card"
                        value={card.name}
                        onChange={(e) => handleCardChange('name', e.target.value)}
                        className={s.input}
                      />
                    </div>
                  </div>
                )}

                {/* Net Banking Tab */}
                {paymentMethod === 'netbanking' && (
                  <div className={s.formGroup}>
                    <label className={s.label}>Select Your Bank</label>
                    <div className={s.inputWrapper}>
                      <Building size={18} className={s.inputIcon} />
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className={s.select}
                      >
                        <option value="">Choose a bank...</option>
                        {banks.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </motion.div>

              <div className="divider" />

              {/* Pay Button */}
              <button className={s.payBtn}>
                <Lock size={18} />
                <span>Pay {formatCurrency(finalTotal)}</span>
                <ChevronRight size={18} />
              </button>

              {/* Security Badge */}
              <div className={s.securityBadge}>
                <Shield size={16} />
                <span>
                  Your payment is secured with 256-bit SSL encryption. We never store your card
                  details.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
