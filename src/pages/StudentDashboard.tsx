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
  PanelLeftClose,
  PanelLeftOpen,
  Tag,
  AlignLeft,
  Type,
  Loader2,
  Inbox,
} from 'lucide-react'
import { useUser } from '../context/UserContext'
import { formatCurrency } from '../utils/formatters'
import {
  getStudentServices,
  getStudentOrders,
  addService,
  updateService,
  deleteService as deleteServiceFirestore,
  calculateEarnings,
  type FirestoreService,
  type FirestoreBooking,
} from '../lib/firestore'
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

/* ── Navigation Items ────────────────────────────────── */
const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'services', label: 'My Services', icon: Briefcase },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
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

const formatTimestamp = (ts: any): string => {
  try {
    const date = ts?.toDate?.() || new Date(ts)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

const getInitialsFromName = (name: string): string => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* ── New Service Form Defaults ────────────────────────── */
const emptyServiceForm = {
  title: '',
  category: 'Design',
  price: '',
  description: '',
}

/* ── Loading Spinner ──────────────────────────────────── */
const LoadingSpinner = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 'var(--space-16) 0', color: 'var(--text-muted)',
  }}>
    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
  </div>
)

/* ── Empty State ──────────────────────────────────────── */
const EmptyState = ({ icon: Icon, title, description }: {
  icon: React.ElementType
  title: string
  description: string
}) => (
  <div className={s.sectionCard} style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-6)' }}>
    <Icon size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
    <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{description}</p>
  </div>
)

/* ══════════════════════════════════════════════════════ */

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const lastScrollY = useRef(0)
  const { user, getInitials, updateProfile } = useUser()

  /* ── Firestore Data State ─────────────────────────── */
  const [services, setServices] = useState<FirestoreService[]>([])
  const [orders, setOrders] = useState<FirestoreBooking[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingEarnings, setLoadingEarnings] = useState(false)

  /* ── Form State ───────────────────────────────────── */
  const [showAddForm, setShowAddForm] = useState(false)
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)
  const [formError, setFormError] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)

  /* ── Settings State ───────────────────────────────── */
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

  /* ── Earnings State ───────────────────────────────── */
  const [earningsData, setEarningsData] = useState<{
    totalEarnings: number
    thisMonth: number
    monthlyEarnings: { month: string; amount: number }[]
  } | null>(null)

  /* ── Auto-hide sidebar on scroll ──────────────────── */
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

  /* ── Sync settings form when user changes ─────────── */
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

  /* ── Listen for dashboard-tab custom events ───────── */
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<Tab>
      setActiveTab(customEvent.detail)
    }
    window.addEventListener('dashboard-tab', handler)
    return () => window.removeEventListener('dashboard-tab', handler)
  }, [])

  /* ── Fetch services from Firestore ────────────────── */
  const fetchServices = useCallback(async () => {
    if (!user?.uid) return
    setLoadingServices(true)
    try {
      const data = await getStudentServices(user.uid)
      setServices(data)
    } catch (err) {
      console.error('Failed to fetch services:', err)
    } finally {
      setLoadingServices(false)
    }
  }, [user?.uid])

  /* ── Fetch orders from Firestore ──────────────────── */
  const fetchOrders = useCallback(async () => {
    if (!user?.uid) return
    setLoadingOrders(true)
    try {
      const data = await getStudentOrders(user.uid)
      setOrders(data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoadingOrders(false)
    }
  }, [user?.uid])

  /* ── Compute earnings from orders ─────────────────── */
  const computeEarnings = useCallback(() => {
    setLoadingEarnings(true)
    try {
      const data = calculateEarnings(orders)
      setEarningsData(data)
    } catch (err) {
      console.error('Failed to calculate earnings:', err)
    } finally {
      setLoadingEarnings(false)
    }
  }, [orders])

  /* ── Fetch data on mount and tab change ───────────── */
  useEffect(() => {
    if (!user?.uid) return

    if (activeTab === 'dashboard') {
      fetchServices()
      fetchOrders()
    } else if (activeTab === 'services') {
      fetchServices()
    } else if (activeTab === 'orders') {
      fetchOrders()
    } else if (activeTab === 'earnings') {
      fetchOrders()
    }
  }, [activeTab, user?.uid, fetchServices, fetchOrders])

  /* ── Recompute earnings when orders change ────────── */
  useEffect(() => {
    if (activeTab === 'earnings' || activeTab === 'dashboard') {
      computeEarnings()
    }
  }, [orders, activeTab, computeEarnings])

  /* ── Derived Stats ────────────────────────────────── */
  const totalEarnings = earningsData?.totalEarnings ?? 0
  const activeOrders = orders.filter((o) => o.status === 'progress' || o.status === 'new').length
  const servicesCount = services.length
  const totalReviews = services.reduce((sum, svc) => sum + (svc.reviews || 0), 0)
  const recentOrders = orders.slice(0, 5)

  /* ── Handlers ─────────────────────────────────────── */
  const handleNavClick = (tab: Tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  const toggleServiceActive = async (id: string) => {
    const svc = services.find((s) => s.id === id)
    if (!svc) return
    try {
      await updateService(id, { active: !svc.active })
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
      )
    } catch (err) {
      console.error('Failed to toggle service:', err)
    }
  }

  const handleDeleteService = async (id: string) => {
    try {
      await deleteServiceFirestore(id)
      setServices((prev) => prev.filter((svc) => svc.id !== id))
    } catch (err) {
      console.error('Failed to delete service:', err)
    }
  }

  const openAddServiceForm = () => {
    setActiveTab('services')
    setShowAddForm(true)
    setEditingServiceId(null)
    setFormError('')
    setServiceForm(emptyServiceForm)
  }

  const openEditServiceForm = (svc: FirestoreService) => {
    setShowAddForm(true)
    setEditingServiceId(svc.id || null)
    setFormError('')
    setServiceForm({
      title: svc.title,
      category: svc.category,
      price: String(svc.price),
      description: svc.description || '',
    })
  }

  const handleAddServiceSubmit = async () => {
    if (!user?.uid) return

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
    setFormSubmitting(true)

    try {
      if (editingServiceId) {
        // Update existing
        await updateService(editingServiceId, {
          title: serviceForm.title.trim(),
          category: serviceForm.category,
          price: Number(serviceForm.price),
          description: serviceForm.description.trim(),
        })
      } else {
        // Add new
        await addService({
          title: serviceForm.title.trim(),
          category: serviceForm.category,
          price: Number(serviceForm.price),
          description: serviceForm.description.trim(),
          studentId: user.uid,
          studentName: user.fullName || '',
          studentCollege: user.college || '',
          active: true,
          rating: 0,
          reviews: 0,
          deliveryDays: 7,
        })
      }

      setServiceForm(emptyServiceForm)
      setShowAddForm(false)
      setEditingServiceId(null)
      await fetchServices()
    } catch (err) {
      console.error('Failed to save service:', err)
      setFormError('Failed to save service. Please try again.')
    } finally {
      setFormSubmitting(false)
    }
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
      {loadingServices || loadingOrders ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className={s.statsGrid}>
            <div className={s.statCard}>
              <div className={`${s.statIcon} ${s.statIconGold}`}>
                <IndianRupee size={22} />
              </div>
              <div>
                <p className={s.statLabel}>Total Earnings</p>
                <p className={s.statValue}>{formatCurrency(totalEarnings)}</p>
              </div>
            </div>

            <div className={s.statCard}>
              <div className={`${s.statIcon} ${s.statIconGreen}`}>
                <ShoppingBag size={22} />
              </div>
              <div>
                <p className={s.statLabel}>Active Orders</p>
                <p className={s.statValue}>{activeOrders}</p>
              </div>
            </div>

            <div className={s.statCard}>
              <div className={`${s.statIcon} ${s.statIconAmber}`}>
                <Briefcase size={22} />
              </div>
              <div>
                <p className={s.statLabel}>Services Listed</p>
                <p className={s.statValue}>{servicesCount}</p>
              </div>
            </div>

            <div className={s.statCard}>
              <div className={`${s.statIcon} ${s.statIconGold}`}>
                <Star size={22} />
              </div>
              <div>
                <p className={s.statLabel}>Total Reviews</p>
                <p className={s.statValue}>{totalReviews}</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className={s.sectionCard}>
            <h3 className={s.sectionTitle}>
              <Clock size={18} /> Recent Orders
            </h3>
            {recentOrders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                No orders yet. Your orders will appear here once customers book your services.
              </p>
            ) : (
              recentOrders.map((order) => (
                <div className={s.orderItem} key={order.id}>
                  <div className={s.orderInfo}>
                    <span className={s.orderTitle}>{order.serviceTitle}</span>
                    <span className={s.orderMeta}>
                      {order.customerName} · {formatTimestamp(order.createdAt)}
                    </span>
                  </div>
                  <div className={s.orderRight}>
                    <span className={s.orderAmount}>{formatCurrency(order.amount)}</span>
                    <span className={statusBadgeClass(order.status)}>
                      {statusLabel(order.status)}
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
              <button className="btn btn-primary" onClick={openAddServiceForm}>
                <Plus size={16} /> Add New Service
              </button>
              <button className="btn btn-outline" onClick={() => setActiveTab('orders')}>
                <ShoppingBag size={16} /> View All Orders
              </button>
              <button className="btn btn-outline" onClick={() => setActiveTab('earnings')}>
                <TrendingUp size={16} /> View Earnings
              </button>
            </div>
          </div>
        </>
      )}
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
          /* ── Add / Edit Service Form ── */
          <motion.div
            key="add-form"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              className={s.backBtn}
              onClick={() => { setShowAddForm(false); setFormError(''); setEditingServiceId(null) }}
            >
              <ChevronLeft size={18} /> Back to Services
            </button>

            <div className={s.sectionCard}>
              <h3 className={s.sectionTitle}>
                {editingServiceId ? <Edit size={18} /> : <Plus size={18} />}
                {editingServiceId ? ' Edit Service' : ' Add New Service'}
              </h3>
              <p className={s.formSubtext}>
                {editingServiceId
                  ? 'Update the details of your service below.'
                  : 'Fill in the details below to list your service on Campus Hustlers.'}
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
                  onClick={() => { setShowAddForm(false); setFormError(''); setEditingServiceId(null) }}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddServiceSubmit}
                  disabled={formSubmitting}
                >
                  {formSubmitting ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                  ) : editingServiceId ? (
                    <><Save size={16} /> Update Service</>
                  ) : (
                    <><Plus size={16} /> Publish Service</>
                  )}
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
              <button className="btn btn-primary" onClick={() => { setShowAddForm(true); setEditingServiceId(null); setFormError(''); setServiceForm(emptyServiceForm) }}>
                <Plus size={16} /> Add New Service
              </button>
            </div>

            {loadingServices ? (
              <LoadingSpinner />
            ) : services.length === 0 ? (
              <div className={s.sectionCard} style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-6)' }}>
                <Briefcase size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>No services yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
                  Start listing your skills and earn from the campus community.
                </p>
                <button className="btn btn-primary" onClick={() => { setShowAddForm(true); setEditingServiceId(null); setFormError(''); setServiceForm(emptyServiceForm) }}>
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
                      onClick={() => svc.id && toggleServiceActive(svc.id)}
                      title={svc.active ? 'Deactivate' : 'Activate'}
                    >
                      {svc.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                    <button
                      className={s.iconBtn}
                      title="Edit"
                      onClick={() => openEditServiceForm(svc)}
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      className={`${s.iconBtn} ${s.iconBtnDanger}`}
                      title="Delete"
                      onClick={() => svc.id && handleDeleteService(svc.id)}
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

      {loadingOrders ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No orders yet"
          description="When customers book your services, their orders will appear here."
        />
      ) : (
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
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {order.receiptNumber || order.id?.slice(0, 8) || '—'}
                    </td>
                    <td>{order.serviceTitle}</td>
                    <td>
                      <div className={s.customerCell}>
                        <div className={s.customerAvatar}>
                          {getInitialsFromName(order.customerName)}
                        </div>
                        {order.customerName}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatCurrency(order.amount)}
                    </td>
                    <td>{formatTimestamp(order.createdAt)}</td>
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
      )}
    </motion.div>
  )

  const renderEarnings = () => {
    const monthlyEarnings = earningsData?.monthlyEarnings ?? []
    const maxEarning = Math.max(...monthlyEarnings.map((e) => e.amount), 1)

    return (
      <motion.div
        key="earnings"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className={s.pageTitle}>Earnings</h1>
        <p className={s.pageSubtitle}>Track your revenue and payouts</p>

        {loadingOrders || loadingEarnings ? (
          <LoadingSpinner />
        ) : !earningsData || earningsData.totalEarnings === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No earnings yet"
            description="Complete orders to start earning. Your revenue breakdown will appear here."
          />
        ) : (
          <>
            {/* Earnings Cards */}
            <div className={s.earningsHeader}>
              <div className={`${s.earningsCard} ${s.earningsCardGold}`}>
                <p className={s.earningsLabel}>Total Earnings</p>
                <p className={s.earningsValue}>{formatCurrency(earningsData.totalEarnings)}</p>
                <div className={s.earningsTrend}>
                  <TrendingUp size={14} /> Lifetime
                </div>
              </div>
              <div className={s.earningsCard}>
                <p className={s.earningsLabel}>This Month</p>
                <p className={`${s.earningsValue} ${s.earningsValueSmall}`}>
                  {formatCurrency(earningsData.thisMonth)}
                </p>
                <div className={s.earningsTrend}>
                  <TrendingUp size={14} /> Current month
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className={s.sectionCard}>
              <div className={s.chartContainer}>
                <h4 className={s.chartTitle}>Monthly Earnings ({new Date().getFullYear()})</h4>
                <div className={s.barChart}>
                  {monthlyEarnings.map((item) => (
                    <div className={s.barGroup} key={item.month}>
                      <span className={s.barValue}>
                        {item.amount > 0 ? formatCurrency(item.amount) : ''}
                      </span>
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
          </>
        )}
      </motion.div>
    )
  }

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
          <a href="mailto:support@campushustlers.in" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary">
              <MessageSquare size={16} /> Contact Support
            </button>
          </a>
          <a href="/faq" style={{ textDecoration: 'none' }}>
            <button className="btn btn-outline">
              <ExternalLink size={16} /> FAQ & Docs
            </button>
          </a>
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
