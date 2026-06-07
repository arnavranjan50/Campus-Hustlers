import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogIn, LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useUser } from '../context/UserContext'
import styles from './Navbar.module.css'

const allNavItems = [
  { label: 'Home', path: '/', authOnly: false },
  { label: 'Services', path: '/services', authOnly: false },
  { label: 'Hackathons', path: '/hackathons', authOnly: false },
  { label: 'Dashboard', path: '/dashboard', authOnly: true },
  { label: 'About', path: '/about', authOnly: false },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, logout, getInitials } = useUser()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = allNavItems.filter(item => !item.authOnly || isLoggedIn)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false)
  }, [location.pathname])

  const closeMobile = () => setMobileOpen(false)

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    closeMobile()
    navigate('/')
  }

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMobile}>
          <span className={styles.logoCampus}>Campus</span>
          <span className={styles.logoHustlers}>Hustlers</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className={styles.navLinks}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.navLink} ${
                  location.pathname === item.path ? styles.active : ''
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Right Section */}
        <div className={styles.rightSection}>
          {isLoggedIn ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                className={styles.userBtn}
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="User menu"
              >
                <div className={styles.userAvatar}>{getInitials()}</div>
                <span className={styles.userName}>
                  {user?.fullName?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown size={14} style={{
                  color: 'var(--text-muted)',
                  transition: 'transform 0.2s',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)'
                }} />
              </button>

              {dropdownOpen && (
                <div className={styles.userDropdown}>
                  <Link
                    to="/dashboard"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link
                    to="/dashboard"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setDropdownOpen(false)
                      // Navigate to dashboard settings tab via URL
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('dashboard-tab', { detail: 'settings' }))
                      }, 100)
                    }}
                  >
                    <Settings size={16} /> Settings
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.loginBtn}>
                <LogIn size={16} />
                Login
              </Link>
              <Link to="/signup" className={styles.signupBtn}>
                <User size={14} />
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger (Mobile) */}
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Slide-in Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.mobileOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
            />
            <motion.div
              className={styles.mobileMenu}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className={styles.mobileHeader}>
                <Link to="/" className={styles.logo} onClick={closeMobile}>
                  <span className={styles.logoCampus}>Campus</span>
                  <span className={styles.logoHustlers}>Hustlers</span>
                </Link>
                <button
                  className={styles.closeBtn}
                  onClick={closeMobile}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile user info when logged in */}
              {isLoggedIn && user && (
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileUserAvatar}>{getInitials()}</div>
                  <div>
                    <div className={styles.mobileUserName}>{user.fullName}</div>
                    <div className={styles.mobileUserEmail}>{user.email}</div>
                  </div>
                </div>
              )}

              <ul className={styles.mobileLinks}>
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`${styles.mobileLink} ${
                        location.pathname === item.path ? styles.active : ''
                      }`}
                      onClick={closeMobile}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className={styles.mobileActions}>
                {isLoggedIn ? (
                  <button className={styles.mobileLogoutBtn} onClick={handleLogout}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link to="/login" className={styles.mobileLoginBtn} onClick={closeMobile}>
                      <LogIn size={16} />
                      Login
                    </Link>
                    <Link to="/signup" className={styles.mobileSignupBtn} onClick={closeMobile}>
                      <User size={14} />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}

