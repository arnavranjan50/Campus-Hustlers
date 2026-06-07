import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Receipt, ArrowLeft, Download, Clock, User, Mail, IndianRupee } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import s from './BookingSuccess.module.css'

/* ── Animation Variants ──────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

/* ── Generate Receipt Number ─────────────────────────── */
function generateReceiptNumber(paymentId: string): string {
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const shortId = paymentId.replace('pay_', '').slice(0, 8).toUpperCase()
  return `CH-${dateStr}-${shortId}`
}

/* ══════════════════════════════════════════════════════ */

interface BookingState {
  paymentId: string
  orderId: string
  serviceTitle: string
  serviceProvider: string
  serviceCollege: string
  servicePrice: number
  platformFee: number
  totalAmount: number
  customerName: string
  customerEmail: string
}

export default function BookingSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const booking = location.state as BookingState | null

  if (!booking) {
    return (
      <motion.div
        className="page"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.4 }}
      >
        <section className={s.emptyState}>
          <div className="container">
            <Receipt size={48} className={s.emptyIcon} />
            <h2 className={s.emptyTitle}>No Booking Found</h2>
            <p className={s.emptyDesc}>
              It looks like you navigated here directly. Complete a booking to see your receipt.
            </p>
            <button className={s.backBtn} onClick={() => navigate('/services')}>
              <ArrowLeft size={16} />
              Browse Services
            </button>
          </div>
        </section>
      </motion.div>
    )
  }

  const receiptNumber = generateReceiptNumber(booking.paymentId)
  const bookingDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const bookingTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <motion.div
      className="page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      <section className={s.wrapper}>
        <div className={`container ${s.container}`}>
          {/* ────── Success Header ────── */}
          <motion.div
            className={s.header}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div className={s.successIcon} variants={staggerChild}>
              <CheckCircle size={64} />
            </motion.div>
            <motion.h1 className={s.title} variants={staggerChild}>
              Booking <span className="gradient-text">Successful!</span>
            </motion.h1>
            <motion.p className={s.subtitle} variants={staggerChild}>
              Your payment has been verified and your booking is confirmed.
            </motion.p>
          </motion.div>

          {/* ────── Receipt Card ────── */}
          <motion.div
            className={`${s.receiptCard} glass-card`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Receipt Header */}
            <div className={s.receiptHeader}>
              <div className={s.receiptBadge}>
                <Receipt size={16} />
                <span>Booking Receipt</span>
              </div>
              <div className={s.receiptNumber}>
                {receiptNumber}
              </div>
            </div>

            <div className={s.divider} />

            {/* Service Details */}
            <div className={s.section}>
              <h3 className={s.sectionTitle}>Service Details</h3>
              <div className={s.detailRow}>
                <span className={s.detailLabel}>Service</span>
                <span className={s.detailValue}>{booking.serviceTitle}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailLabel}>Provider</span>
                <span className={s.detailValue}>
                  {booking.serviceProvider} · {booking.serviceCollege}
                </span>
              </div>
            </div>

            <div className={s.divider} />

            {/* Customer Details */}
            <div className={s.section}>
              <h3 className={s.sectionTitle}>Customer Details</h3>
              <div className={s.detailRow}>
                <span className={s.detailLabel}>
                  <User size={14} /> Name
                </span>
                <span className={s.detailValue}>{booking.customerName}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailLabel}>
                  <Mail size={14} /> Email
                </span>
                <span className={s.detailValue}>{booking.customerEmail}</span>
              </div>
            </div>

            <div className={s.divider} />

            {/* Payment Details */}
            <div className={s.section}>
              <h3 className={s.sectionTitle}>Payment Details</h3>
              <div className={s.detailRow}>
                <span className={s.detailLabel}>Service Price</span>
                <span className={s.detailValue}>{formatCurrency(booking.servicePrice)}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailLabel}>Platform Fee (5%)</span>
                <span className={s.detailValue}>{formatCurrency(booking.platformFee)}</span>
              </div>
              <div className={`${s.detailRow} ${s.totalRow}`}>
                <span className={s.detailLabel}>
                  <IndianRupee size={14} /> Total Paid
                </span>
                <span className={s.totalValue}>{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>

            <div className={s.divider} />

            {/* Transaction Info */}
            <div className={s.section}>
              <h3 className={s.sectionTitle}>Transaction Info</h3>
              <div className={s.detailRow}>
                <span className={s.detailLabel}>Payment ID</span>
                <code className={s.codeValue}>{booking.paymentId}</code>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailLabel}>Order ID</span>
                <code className={s.codeValue}>{booking.orderId}</code>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailLabel}>
                  <Clock size={14} /> Date & Time
                </span>
                <span className={s.detailValue}>{bookingDate} at {bookingTime}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailLabel}>Status</span>
                <span className={s.statusBadge}>✓ Verified & Paid</span>
              </div>
            </div>

            <div className={s.divider} />

            {/* Footer Note */}
            <p className={s.footerNote}>
              The service provider will reach out to you at <strong>{booking.customerEmail}</strong>.
              Save this receipt for your records.
            </p>
          </motion.div>

          {/* ────── Actions ────── */}
          <motion.div
            className={s.actions}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button className={s.primaryBtn} onClick={() => navigate('/services')}>
              Browse More Services
            </button>
            <button className={s.secondaryBtn} onClick={() => navigate('/')}>
              <ArrowLeft size={16} />
              Back to Home
            </button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
