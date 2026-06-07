import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Briefcase,
  ShoppingBag,
  DollarSign,
  Settings,
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Star,
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
  CreditCard,
  Save,
  CheckCircle,
  Smartphone,
  Building,
  FileText,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  IndianRupee as RupeeIcon,
  Tag,
  AlignLeft,
  Type,
} from 'lucide-react'
import { useUser } from '../context/UserContext'
import { formatCurrency } from '../utils/formatters'
import s from './Dashboard.module.css'

/* ── Animation Variants ──────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

/* ── Types ───────────────────────────────────────────── */
type Tab = 'dashboard' | 'services' | 'orders' | 'earnings' | 'settings' | 'support'

interface NavItem {
  id: Tab
  label: string
  icon: React.ElementType
}

interface RecentOrder {
  id: string
  title: string
  customer: string
  customerInitials: string
  amount: number
  date: string
  status: 'completed' | 'progress' | 'new' | 'pending' | 'cancelled'
}

interface UserService {
  id: string
  title: string
  category: string
  price: number
  rating: number
  reviews: number
  active: boolean
}

interface OrderRow {
  id: string
  service: string
  customer: string
  customerInitials: string
  amount: number
  date: string
  status: 'completed' | 'progress' | 'new' | 'pending' | 'cancelled'
}

interface MonthlyEarning {
  month: string
  amount: number
}

interface Payout {
  id: string
  method: string
  date: string
  amount: number
}

/* ── Navigation Items ────────────────────────────────── */
const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'services', label: 'My Services', icon: Briefcase },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'support', label: 'Support', icon: HelpCircle },
]

/* ── Mock Data ───────────────────────────────────────── */
const recentOrders: RecentOrder[] = [
  {
    id: 'ORD-1042',
    title: 'Logo Design for Tech Startup',
    customer: 'Rahul Verma',
    customerInitials: 'RV',
    amount: 4500,
    date: '29 May 2026',
    status: 'completed',
  },
  {
    id: 'ORD-1041',
    title: 'React Portfolio Website',
    customer: 'Sneha Iyer',
    customerInitials: 'SI',
    amount: 12000,
    date: '28 May 2026',
    status: 'progress',
  },
  {
    id: 'ORD-1040',
    title: 'Instagram Reel Editing (5 reels)',
    customer: 'Karan Malhotra',
    customerInitials: 'KM',
    amount: 3000,
    date: '27 May 2026',
    status: 'new',
  },
  {
    id: 'ORD-1039',
    title: 'Machine Learning Assignment Help',
    customer: 'Ananya Gupta',
    customerInitials: 'AG',
    amount: 2500,
    date: '26 May 2026',
    status: 'pending',
  },
  {
    id: 'ORD-1038',
    title: 'Brand Identity Package',
    customer: 'Vikram Singh',
    customerInitials: 'VS',
    amount: 8000,
    date: '25 May 2026',
    status: 'cancelled',
  },
]

const userServices: UserService[] = [
  {
    id: 'svc-1',
    title: 'Professional Logo & Brand Identity Design',
    category: 'Design',
    price: 4500,
    rating: 4.9,
    reviews: 128,
    active: true,
  },
  {
    id: 'svc-2',
    title: 'Full-Stack React + Node.js Web Development',
    category: 'Development',
    price: 15000,
    rating: 4.8,
    reviews: 87,
    active: true,
  },
  {
    id: 'svc-3',
    title: 'Video Editing & Motion Graphics',
    category: 'Video Editing',
    price: 3000,
    rating: 4.7,
    reviews: 54,
    active: false,
  },
  {
    id: 'svc-4',
    title: 'SEO & Social Media Marketing',
    category: 'Marketing',
    price: 5000,
    rating: 4.6,
    reviews: 32,
    active: true,
  },
  {
    id: 'svc-5',
    title: 'Academic Writing & Research Papers',
    category: 'Writing',
    price: 2000,
    rating: 4.5,
    reviews: 11,
    active: true,
  },
]

const allOrders: OrderRow[] = [
  {
    id: 'ORD-1042',
    service: 'Logo Design for Tech Startup',
    customer: 'Rahul Verma',
    customerInitials: 'RV',
    amount: 4500,
    date: '29 May 2026',
    status: 'completed',
  },
  {
    id: 'ORD-1041',
    service: 'React Portfolio Website',
    customer: 'Sneha Iyer',
    customerInitials: 'SI',
    amount: 12000,
    date: '28 May 2026',
    status: 'progress',
  },
  {
    id: 'ORD-1040',
    service: 'Instagram Reel Editing (5 reels)',
    customer: 'Karan Malhotra',
    customerInitials: 'KM',
    amount: 3000,
    date: '27 May 2026',
    status: 'new',
  },
  {
    id: 'ORD-1039',
    service: 'ML Assignment Help',
    customer: 'Ananya Gupta',
    customerInitials: 'AG',
    amount: 2500,
    date: '26 May 2026',
    status: 'pending',
  },
  {
    id: 'ORD-1038',
    service: 'Brand Identity Package',
    customer: 'Vikram Singh',
    customerInitials: 'VS',
    amount: 8000,
    date: '25 May 2026',
    status: 'cancelled',
  },
  {
    id: 'ORD-1037',
    service: 'SEO Audit & Strategy Report',
    customer: 'Priya Nair',
    customerInitials: 'PN',
    amount: 5000,
    date: '24 May 2026',
    status: 'completed',
  },
  {
    id: 'ORD-1036',
    service: 'Research Paper Writing',
    customer: 'Amit Patel',
    customerInitials: 'AP',
    amount: 2000,
    date: '23 May 2026',
    status: 'completed',
  },
]

const monthlyEarnings: MonthlyEarning[] = [
  { month: 'Jan', amount: 5200 },
  { month: 'Feb', amount: 7800 },
  { month: 'Mar', amount: 6400 },
  { month: 'Apr', amount: 9100 },
  { month: 'May', amount: 11500 },
  { month: 'Jun', amount: 7500 },
]

const recentPayouts: Payout[] = [
  { id: 'pay-1', method: 'UPI — arnav@oksbi', date: '28 May 2026', amount: 12000 },
  { id: 'pay-2', method: 'Bank Transfer — HDFC ****4521', date: '20 May 2026', amount: 8500 },
  { id: 'pay-3', method: 'UPI — arnav@oksbi', date: '12 May 2026', amount: 6000 },
  { id: 'pay-4', method: 'Bank Transfer — HDFC ****4521', date: '3 May 2026', amount: 9200 },
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

const maxEarning = Math.max(...monthlyEarnings.map((e) => e.amount))

/* ══════════════════════════════════════════════════════ */

/* ── New Service Form Defaults ────────────────────────── */
const emptyServiceForm = {
  title: '',
  category: 'Design',
  price: '',
  description: '',
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [services, setServices] = useState(userServices)
  const [showAddForm, setShowAddForm] = useState(false)
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)
  const [formError, setFormError] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const lastScrollY = useRef(0)
  const { user, getInitials, updateProfile } = useUser()

  // Auto-hide sidebar on scroll down
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

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    college: user?.college || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    upiId: user?.upiId || '',
    bankAccount: user?.bankAccount || '',
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
        upiId: user.upiId || '',
        bankAccount: user.bankAccount || '',
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
      const customEvent = e as CustomEvent<Tab>
      setActiveTab(customEvent.detail)
    }
    window.addEventListener('dashboard-tab', handler)
    return () => window.removeEventListener('dashboard-tab', handler)
  }, [])

  const handleNavClick = (tab: Tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  const toggleServiceActive = (id: string) => {
    setServices((prev) =>
      prev.map((svc) => (svc.id === id ? { ...svc, active: !svc.active } : svc))
    )
  }

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((svc) => svc.id !== id))
  }

  const openAddServiceForm = () => {
    setActiveTab('services')
    setShowAddForm(true)
    setFormError('')
    setServiceForm(emptyServiceForm)
  }

  const handleAddServiceSubmit = () => {
    // Validation
    if (!serviceForm.title.trim()) {
      setFormError('Please enter a service title.')
      return
    }
    if (!serviceForm.price || Number(serviceForm.price) <= 0) {
      setFormError('Please enter a valid price.')
      return
    }
    if (!serviceForm.description.trim()) {
      setFormError('Please add a short description.')
      return
    }
    setFormError('')

    const newService: UserService = {
      id: `svc-${Date.now()}`,
      title: serviceForm.title.trim(),
      category: serviceForm.category,
      price: Number(serviceForm.price),
      rating: 0,
      reviews: 0,
      active: true,
    }
    setServices((prev) => [newService, ...prev])
    setServiceForm(emptyServiceForm)
    setShowAddForm(false)
  }

  const handleSaveSettings = () => {
    updateProfile(settingsForm)
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2500)
  }

  const firstName = user?.fullName?.split(' ')[0] || 'User'

  /* ── Tab Renderers ───────────────────────────────── */

  const renderDashboard = () => (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h1 className={s.pageTitle}>Welcome back, {firstName} 👋</h1>
      <p className={s.pageSubtitle}>Here's what's happening with your services today.</p>

      {/* Stats Grid */}
      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <div className={`${s.statIcon} ${s.statIconGold}`}>
            <IndianRupee size={22} />
          </div>
          <div>
            <p className={s.statLabel}>Total Earnings</p>
            <p className={s.statValue}>{formatCurrency(47500)}</p>
          </div>
        </div>

        <div className={s.statCard}>
          <div className={`${s.statIcon} ${s.statIconGreen}`}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className={s.statLabel}>Active Orders</p>
            <p className={s.statValue}>8</p>
          </div>
        </div>

        <div className={s.statCard}>
          <div className={`${s.statIcon} ${s.statIconAmber}`}>
            <Briefcase size={22} />
          </div>
          <div>
            <p className={s.statLabel}>Services Listed</p>
            <p className={s.statValue}>5</p>
          </div>
        </div>

        <div className={s.statCard}>
          <div className={`${s.statIcon} ${s.statIconGold}`}>
            <Star size={22} />
          </div>
          <div>
            <p className={s.statLabel}>Total Reviews</p>
            <p className={s.statValue}>312</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={s.sectionCard}>
        <h3 className={s.sectionTitle}>
          <Clock size={18} /> Recent Orders
        </h3>
        {recentOrders.map((order) => (
          <div className={s.orderItem} key={order.id}>
            <div className={s.orderInfo}>
              <span className={s.orderTitle}>{order.title}</span>
              <span className={s.orderMeta}>
                {order.customer} · {order.date}
              </span>
            </div>
            <div className={s.orderRight}>
              <span className={s.orderAmount}>{formatCurrency(order.amount)}</span>
              <span className={statusBadgeClass(order.status)}>
                {statusLabel(order.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={s.sectionCard}>
        <h3 className={s.sectionTitle}>⚡ Quick Actions</h3>
        <div className={s.quickActions}>
          <button className="btn btn-primary" onClick={openAddServiceForm}>
            <Plus size={16} /> Add New Service
          </button>
          <button className="btn btn-outline" onClick={() => setActiveTab('orders')}>
            <ShoppingBag size={16} /> View All Orders
          </button>
          <button className="btn btn-outline" onClick={() => setActiveTab('earnings')}>
            <TrendingUp size={16} /> View Earnings
          </button>
          <button className="btn btn-ghost">
            <MessageSquare size={16} /> Messages
          </button>
        </div>
      </div>
    </motion.div>
  )

  const renderServices = () => (
    <motion.div
      key="services"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <AnimatePresence mode="wait">
        {showAddForm ? (
          /* ── Add New Service Form ── */
          <motion.div
            key="add-form"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              className={s.backBtn}
              onClick={() => { setShowAddForm(false); setFormError('') }}
            >
              <ChevronLeft size={18} /> Back to Services
            </button>

            <div className={s.sectionCard}>
              <h3 className={s.sectionTitle}>
                <Plus size={18} /> Add New Service
              </h3>
              <p className={s.formSubtext}>
                Fill in the details below to list your service on Campus Hustlers.
              </p>

              {formError && (
                <div className={s.formError}>{formError}</div>
              )}

              <div className={s.formGrid}>
                {/* Title */}
                <div className={s.formGroup + ' ' + s.formGroupFull}>
                  <label className={s.formLabel}>
                    <Type size={14} /> Service Title
                  </label>
                  <input
                    type="text"
                    className={s.formInput}
                    placeholder="e.g. Professional Logo & Brand Design"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>

                {/* Category */}
                <div className={s.formGroup}>
                  <label className={s.formLabel}>
                    <Tag size={14} /> Category
                  </label>
                  <select
                    className={s.formInput}
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="Writing">Writing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Tutoring">Tutoring</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Music">Music</option>
                    <option value="Photography">Photography</option>
                  </select>
                </div>

                {/* Price */}
                <div className={s.formGroup}>
                  <label className={s.formLabel}>
                    <IndianRupee size={14} /> Price (₹)
                  </label>
                  <input
                    type="number"
                    className={s.formInput}
                    placeholder="e.g. 2500"
                    min="0"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>

                {/* Description */}
                <div className={s.formGroup + ' ' + s.formGroupFull}>
                  <label className={s.formLabel}>
                    <AlignLeft size={14} /> Description
                  </label>
                  <textarea
                    className={s.formTextarea}
                    placeholder="Describe what you offer, your experience, and what the client will receive…"
                    rows={4}
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className={s.formActions}>
                <button
                  className="btn btn-outline"
                  onClick={() => { setShowAddForm(false); setFormError('') }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddServiceSubmit}
                >
                  <Plus size={16} /> Publish Service
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Services List ── */
          <motion.div
            key="services-list"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={s.tabHeader}>
              <div>
                <h1 className={s.pageTitle}>My Services</h1>
                <p className={s.pageSubtitle}>Manage your listed services</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setShowAddForm(true); setFormError(''); setServiceForm(emptyServiceForm) }}>
                <Plus size={16} /> Add New Service
              </button>
            </div>

            {services.length === 0 ? (
              <div className={s.sectionCard} style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-6)' }}>
                <Briefcase size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>No services yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
                  Start listing your skills and earn from the campus community.
                </p>
                <button className="btn btn-primary" onClick={() => { setShowAddForm(true); setFormError(''); setServiceForm(emptyServiceForm) }}>
                  <Plus size={16} /> Add Your First Service
                </button>
              </div>
            ) : (
              services.map((svc) => (
                <div className={s.serviceRow} key={svc.id}>
                  <div className={s.serviceInfo}>
                    <span className={s.serviceTitle}>{svc.title}</span>
                    <span className={s.serviceMeta}>
                      <span>{svc.category}</span>
                      <span>·</span>
                      <span>{formatCurrency(svc.price)}</span>
                      <span>·</span>
                      <span>★ {svc.rating} ({svc.reviews})</span>
                    </span>
                  </div>
                  <div className={s.serviceActions}>
                    <button
                      className={`${s.toggleBtn} ${svc.active ? s.toggleActive : ''}`}
                      onClick={() => toggleServiceActive(svc.id)}
                      title={svc.active ? 'Deactivate' : 'Activate'}
                    >
                      {svc.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                    <button className={s.iconBtn} title="Edit">
                      <Edit size={15} />
                    </button>
                    <button
                      className={`${s.iconBtn} ${s.iconBtnDanger}`}
                      title="Delete"
                      onClick={() => deleteService(svc.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  const renderOrders = () => (
    <motion.div
      key="orders"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h1 className={s.pageTitle}>Orders</h1>
      <p className={s.pageSubtitle}>Track and manage all your orders</p>

      <div className={s.sectionCard}>
        <div className={s.tableWrap}>
          <table className={s.ordersTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Service</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.id}</td>
                  <td>{order.service}</td>
                  <td>
                    <div className={s.customerCell}>
                      <div className={s.customerAvatar}>{order.customerInitials}</div>
                      {order.customer}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatCurrency(order.amount)}
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <span className={statusBadgeClass(order.status)}>
                      {statusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )

  const renderEarnings = () => (
    <motion.div
      key="earnings"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h1 className={s.pageTitle}>Earnings</h1>
      <p className={s.pageSubtitle}>Track your revenue and payouts</p>

      {/* Earnings Cards */}
      <div className={s.earningsHeader}>
        <div className={`${s.earningsCard} ${s.earningsCardGold}`}>
          <p className={s.earningsLabel}>Total Earnings</p>
          <p className={s.earningsValue}>{formatCurrency(47500)}</p>
          <div className={s.earningsTrend}>
            <TrendingUp size={14} /> +23% from last month
          </div>
        </div>
        <div className={s.earningsCard}>
          <p className={s.earningsLabel}>This Month</p>
          <p className={`${s.earningsValue} ${s.earningsValueSmall}`}>
            {formatCurrency(11500)}
          </p>
          <div className={s.earningsTrend}>
            <TrendingUp size={14} /> +12% from last month
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className={s.sectionCard}>
        <div className={s.chartContainer}>
          <h4 className={s.chartTitle}>Monthly Earnings (2026)</h4>
          <div className={s.barChart}>
            {monthlyEarnings.map((item) => (
              <div className={s.barGroup} key={item.month}>
                <span className={s.barValue}>{formatCurrency(item.amount)}</span>
                <div
                  className={s.bar}
                  style={{ height: `${(item.amount / maxEarning) * 100}%` }}
                />
                <span className={s.barLabel}>{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className={s.sectionCard}>
        <h3 className={s.sectionTitle}>
          <DollarSign size={18} /> Recent Payouts
        </h3>
        {recentPayouts.map((payout) => (
          <div className={s.payoutItem} key={payout.id}>
            <div className={s.payoutInfo}>
              <span className={s.payoutMethod}>{payout.method}</span>
              <span className={s.payoutDate}>{payout.date}</span>
            </div>
            <span className={s.payoutAmount}>+{formatCurrency(payout.amount)}</span>
          </div>
        ))}
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
            placeholder="Tell us a bit about yourself, your skills, and what you're hustling..."
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
          { key: 'notifyOrders' as const, label: 'Order Updates', desc: 'Get notified when you receive new orders or order status changes' },
          { key: 'notifyMessages' as const, label: 'Messages', desc: 'Receive notifications for new messages from clients' },
          { key: 'notifyPromotions' as const, label: 'Promotions & Offers', desc: 'Stay updated on platform promotions and seasonal offers' },
          { key: 'notifyWeeklyDigest' as const, label: 'Weekly Digest', desc: 'Receive a weekly summary of your activity and earnings' },
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

      {/* Payout Methods */}
      <div className={s.sectionCard}>
        <h3 className={s.sectionTitle}>
          <CreditCard size={18} /> Payout Methods
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
              <Smartphone size={14} /> UPI ID
            </label>
            <input
              type="text"
              value={settingsForm.upiId}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, upiId: e.target.value }))}
              placeholder="yourname@oksbi"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
              <Building size={14} /> Bank Account (Last 4 digits)
            </label>
            <input
              type="text"
              value={settingsForm.bankAccount}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, bankAccount: e.target.value }))}
              placeholder="HDFC ****4521"
              style={{ width: '100%' }}
            />
          </div>
        </div>
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
          <button className="btn btn-primary">
            <MessageSquare size={16} /> Contact Support
          </button>
          <button className="btn btn-outline">
            <ExternalLink size={16} /> FAQ & Docs
          </button>
        </div>
      </div>
    </motion.div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'services':
        return renderServices()
      case 'orders':
        return renderOrders()
      case 'earnings':
        return renderEarnings()
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
