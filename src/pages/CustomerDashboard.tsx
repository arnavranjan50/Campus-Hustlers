import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  HelpCircle,
  Menu,
  X,
  IndianRupee,
  Clock,
  MessageSquare,
  ExternalLink,
  User,
  Mail,
  GraduationCap,
  Phone,
  Bell,
  Save,
  CheckCircle,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  ToggleLeft,
  ToggleRight,
  Search,
  Loader2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { formatCurrency } from '../utils/formatters'
import { getCustomerBookings, type FirestoreBooking } from '../lib/firestore'
import { type Timestamp } from 'firebase/firestore'
import s from './Dashboard.module.css'

/* ── Animation Variants ──────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

/* ── Types ───────────────────────────────────────────── */
type Tab = 'dashboard' | 'bookings' | 'settings' | 'support'

interface NavItem {
  id: Tab
  label: string
  icon: React.ElementType
}

/* ── Navigation Items ────────────────────────────────── */
const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'My Bookings', icon: ShoppingBag },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'support', label: 'Support', icon: HelpCircle },
]

/* ── Helpers ─────────────────────────────────────────── */
const statusBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    completed: s.badgeCompleted,
    progress: s.badgeProgress,
    new: s.badgeNew,
    pending: s.badgePending,
    cancelled: s.badgeCancelled,
  }
  return `${s.badge} ${map[status] || ''}`
}

const statusLabel = (status: string): string => {
  const map: Record<string, string> = {
    completed: 'Completed',
    progress: 'In Progress',
    new: 'New',
    pending: 'Pending',
    cancelled: 'Cancelled',
  }
  return map[status] || status
}

/** Safely format a Firestore Timestamp into a readable date string */
function formatTimestamp(ts: Timestamp | undefined | null): string {
  if (!ts) return '—'
  try {
    const date = ts.toDate()
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

/* ══════════════════════════════════════════════════════ */

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const lastScrollY = useRef(0)
  const { user, getInitials, updateProfile } = useUser()

  /* ── Bookings State ─────────────────────────────────── */
  const [bookings, setBookings] = useState<FirestoreBooking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState('')

  /* ── Fetch Bookings from Firestore ─────────────────── */
  const fetchBookings = useCallback(async () => {
    if (!user?.uid) return
    setBookingsLoading(true)
    setBookingsError('')
    try {
      const data = await getCustomerBookings(user.uid)
      setBookings(data)
    } catch (err: any) {
      console.error('Failed to load bookings:', err)
      setBookingsError('Failed to load bookings. Please try again.')
    } finally {
      setBookingsLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  /* ── Auto-hide sidebar on scroll down ──────────────── */
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current
      if (delta > 5) {
        setSidebarCollapsed(true)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* ── Settings form state ───────────────────────────── */
  const [settingsForm, setSettingsForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    college: user?.college || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    notifyOrders: user?.notifyOrders ?? true,
    notifyMessages: user?.notifyMessages ?? true,
    notifyPromotions: user?.notifyPromotions ?? false,
    notifyWeeklyDigest: user?.notifyWeeklyDigest ?? true,
  })
  const [settingsSaved, setSettingsSaved] = useState(false)

  // Sync settings form when user changes
  useEffect(() => {
    if (user) {
      setSettingsForm({
        fullName: user.fullName || '',
        email: user.email || '',
        college: user.college || '',
        bio: user.bio || '',
        phone: user.phone || '',
        notifyOrders: user.notifyOrders ?? true,
        notifyMessages: user.notifyMessages ?? true,
        notifyPromotions: user.notifyPromotions ?? false,
        notifyWeeklyDigest: user.notifyWeeklyDigest ?? true,
      })
    }
  }, [user])

  // Listen for dashboard-tab custom events (from Navbar dropdown)
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const detail = customEvent.detail
      // Only respond to tabs that exist in customer dashboard
      if (['dashboard', 'bookings', 'settings', 'support'].includes(detail)) {
        setActiveTab(detail as Tab)
      }
    }
    window.addEventListener('dashboard-tab', handler)
    return () => window.removeEventListener('dashboard-tab', handler)
  }, [])

  const handleNavClick = (tab: Tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  const handleSaveSettings = () => {
    updateProfile(settingsForm)
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2500)
  }

  const firstName = user?.fullName?.split(' ')[0] || 'User'

  /* ── Derived Stats ─────────────────────────────────── */
  const totalBookings = bookings.length
  const totalSpent = bookings.reduce((sum, b) => sum + (b.total || 0), 0)
  const activeBookings = bookings.filter(
    (b) => b.status === 'progress' || b.status === 'new'
  ).length
  const recentBookings = bookings.slice(0, 5)

  /* ── Tab Renderers ───────────────────────────────── */

  const renderDashboard = () => (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h1 className={s.pageTitle}>Welcome back, {firstName} 👋</h1>
      <p className={s.pageSubtitle}>Here's an overview of your bookings and activity.</p>

      {/* Stats Grid */}
      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <div className={`${s.statIcon} ${s.statIconGold}`}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className={s.statLabel}>Total Bookings</p>
            <p className={s.statValue}>
              {bookingsLoading ? '…' : totalBookings}
            </p>
          </div>
        </div>

        <div className={s.statCard}>
          <div className={`${s.statIcon} ${s.statIconGreen}`}>
            <IndianRupee size={22} />
          </div>
          <div>
            <p className={s.statLabel}>Total Spent</p>
            <p className={s.statValue}>
              {bookingsLoading ? '…' : formatCurrency(totalSpent)}
            </p>
          </div>
        </div>

        <div className={s.statCard}>
          <div className={`${s.statIcon} ${s.statIconAmber}`}>
            <Clock size={22} />
          </div>
          <div>
            <p className={s.statLabel}>Active Bookings</p>
            <p className={s.statValue}>
              {bookingsLoading ? '…' : activeBookings}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className={s.sectionCard}>
        <h3 className={s.sectionTitle}>
          <Clock size={18} /> Recent Bookings
        </h3>

        {bookingsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-6) 0', justifyContent: 'center' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-gold)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Loading bookings…</span>
          </div>
        ) : bookingsError ? (
          <p style={{ color: 'var(--danger)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-4) 0' }}>
            {bookingsError}
          </p>
        ) : recentBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-6)' }}>
            <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>No bookings yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
              Browse services from talented students and place your first booking.
            </p>
            <Link to="/services" className="btn btn-primary">
              <Search size={16} /> Browse Services
            </Link>
          </div>
        ) : (
          recentBookings.map((booking) => (
            <div className={s.orderItem} key={booking.id}>
              <div className={s.orderInfo}>
                <span className={s.orderTitle}>{booking.serviceTitle}</span>
                <span className={s.orderMeta}>
                  {booking.studentName} · {formatTimestamp(booking.createdAt)}
                </span>
              </div>
              <div className={s.orderRight}>
                <span className={s.orderAmount}>{formatCurrency(booking.total)}</span>
                <span className={statusBadgeClass(booking.status)}>
                  {statusLabel(booking.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className={s.sectionCard}>
        <h3 className={s.sectionTitle}>⚡ Quick Actions</h3>
        <div className={s.quickActions}>
          <Link to="/services" className="btn btn-primary">
            <Search size={16} /> Browse Services
          </Link>
          <button className="btn btn-outline" onClick={() => setActiveTab('bookings')}>
            <ShoppingBag size={16} /> View All Bookings
          </button>
          <button className="btn btn-ghost" onClick={() => setActiveTab('support')}>
            <MessageSquare size={16} /> Get Help
          </button>
        </div>
      </div>
    </motion.div>
  )

  const renderBookings = () => (
    <motion.div
      key="bookings"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h1 className={s.pageTitle}>My Bookings</h1>
      <p className={s.pageSubtitle}>Track and manage all your service bookings</p>

      <div className={s.sectionCard}>
        {bookingsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-10) 0', justifyContent: 'center' }}>
            <Loader2 size={22} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-gold)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Loading your bookings…</span>
          </div>
        ) : bookingsError ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-6)' }}>
            <p style={{ color: 'var(--danger)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
              {bookingsError}
            </p>
            <button className="btn btn-outline" onClick={fetchBookings}>
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-6)' }}>
            <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>No bookings yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
              No bookings yet — browse services to get started.
            </p>
            <Link to="/services" className="btn btn-primary">
              <Search size={16} /> Browse Services
            </Link>
          </div>
        ) : (
          <div className={s.tableWrap}>
            <table className={s.ordersTable}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service</th>
                  <th>Provider</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Receipt #</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const providerInitials = booking.studentName
                    ? booking.studentName
                        .trim()
                        .split(/\s+/)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : '?'

                  return (
                    <tr key={booking.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {booking.orderId || booking.id?.slice(0, 10) || '—'}
                      </td>
                      <td>{booking.serviceTitle}</td>
                      <td>
                        <div className={s.customerCell}>
                          <div className={s.customerAvatar}>{providerInitials}</div>
                          {booking.studentName}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatCurrency(booking.total)}
                      </td>
                      <td>{formatTimestamp(booking.createdAt)}</td>
                      <td>
                        <span className={statusBadgeClass(booking.status)}>
                          {statusLabel(booking.status)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {booking.receiptNumber || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )

  const renderSettings = () => (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h1 className={s.pageTitle}>Settings</h1>
      <p className={s.pageSubtitle}>Manage your account preferences</p>

      {/* Saved Toast */}
      {settingsSaved && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1rem', background: 'var(--success-bg)',
          border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: 'var(--radius-md)',
          color: 'var(--success)', fontSize: 'var(--font-size-sm)',
          fontWeight: 500, marginBottom: 'var(--space-6)',
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          <CheckCircle size={16} /> Settings saved successfully!
        </div>
      )}

      {/* Profile Section */}
      <div className={s.sectionCard}>
        <h3 className={s.sectionTitle}>
          <User size={18} /> Profile Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
              <User size={14} /> Full Name
            </label>
            <input
              type="text"
              value={settingsForm.fullName}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="Your full name"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              value={settingsForm.email}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@college.edu"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
              <GraduationCap size={14} /> College / University
            </label>
            <input
              type="text"
              value={settingsForm.college}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, college: e.target.value }))}
              placeholder="IIT Delhi, NIT Trichy…"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
              <Phone size={14} /> Phone Number
            </label>
            <input
              type="tel"
              value={settingsForm.phone}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
            <FileText size={14} /> Bio
          </label>
          <textarea
            value={settingsForm.bio}
            onChange={(e) => setSettingsForm((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself…"
            rows={3}
            style={{ width: '100%', resize: 'vertical', minHeight: '80px' }}
          />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className={s.sectionCard}>
        <h3 className={s.sectionTitle}>
          <Bell size={18} /> Notification Preferences
        </h3>
        {[
          { key: 'notifyOrders' as const, label: 'Booking Updates', desc: 'Get notified when your booking status changes' },
          { key: 'notifyMessages' as const, label: 'Messages', desc: 'Receive notifications for new messages from service providers' },
          { key: 'notifyPromotions' as const, label: 'Promotions & Offers', desc: 'Stay updated on platform promotions and seasonal offers' },
          { key: 'notifyWeeklyDigest' as const, label: 'Weekly Digest', desc: 'Receive a weekly summary of your activity' },
        ].map((item) => (
          <div key={item.key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'var(--space-4) 0',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {item.label}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {item.desc}
              </div>
            </div>
            <button
              className={`${s.toggleBtn} ${settingsForm[item.key] ? s.toggleActive : ''}`}
              onClick={() => setSettingsForm((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
              style={{ flexShrink: 0 }}
            >
              {settingsForm[item.key] ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSaveSettings}>
          <Save size={18} /> Save Changes
        </button>
      </div>
    </motion.div>
  )

  const renderSupport = () => (
    <motion.div
      key="support"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h1 className={s.pageTitle}>Support</h1>
      <p className={s.pageSubtitle}>Get help when you need it</p>
      <div className={s.sectionCard}>
        <h3 className={s.sectionTitle}>
          <HelpCircle size={18} /> Help Center
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
          Need help? Reach out to us and we'll get back to you within 24 hours.
        </p>
        <div className={s.quickActions}>
          <a href="mailto:arnavranjan50@gmail.com" className="btn btn-primary">
            <MessageSquare size={16} /> Contact Support
          </a>
          <Link to="/faq" className="btn btn-outline">
            <ExternalLink size={16} /> FAQ & Docs
          </Link>
        </div>
      </div>
    </motion.div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'bookings':
        return renderBookings()
      case 'settings':
        return renderSettings()
      case 'support':
        return renderSupport()
      default:
        return renderDashboard()
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
      <div className={s.dashboard}>
        {/* Mobile Overlay */}
        <div
          className={`${s.overlay} ${sidebarOpen ? s.overlayVisible : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`${s.sidebar} ${sidebarOpen ? s.sidebarOpen : ''} ${sidebarCollapsed ? s.sidebarCollapsed : ''}`}>
          <div className={s.sidebarHeader}>
            <div className={s.sidebarAvatar}>{getInitials()}</div>
            <div className={s.sidebarName}>{user?.fullName || 'Guest User'}</div>
            <div className={s.sidebarEmail}>{user?.email || 'guest@campus.edu'}</div>
          </div>

          <nav className={s.sidebarNav}>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className={`${s.navItem} ${activeTab === item.id ? s.navItemActive : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <Icon className={s.navIcon} />
                  {item.label}
                </div>
              )
            })}
          </nav>

          {/* Collapse toggle at bottom of sidebar */}
          <button
            className={s.collapseBtn}
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </aside>

        {/* Desktop sidebar toggle — visible when collapsed */}
        <button
          className={`${s.sidebarExpandBtn} ${sidebarCollapsed ? s.sidebarExpandBtnVisible : ''}`}
          onClick={() => setSidebarCollapsed(false)}
          aria-label="Show sidebar"
          title="Show sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>

        {/* Mobile Toggle */}
        <button
          className={s.mobileToggle}
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Main Content */}
        <main className={`${s.main} ${sidebarCollapsed ? s.mainExpanded : ''}`}>{renderContent()}</main>
      </div>
    </motion.div>
  )
}
