import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Sparkles, PackageOpen, Plus, X, LogIn, UserPlus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import ServiceCard from '../components/ServiceCard'
import { services, categories } from '../data/services'
import type { Category } from '../data/services'
import { useSearch } from '../hooks/useSearch'
import { useUser } from '../context/UserContext'

import s from './Services.module.css'

/* ── Animation Variants ──────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
}

/* ══════════════════════════════════════════════════════ */

export default function Services() {
  const [searchParams] = useSearchParams()
  const urlCategory = searchParams.get('category') as Category | null
  const [activeCategory, setActiveCategory] = useState<Category>(
    urlCategory && categories.includes(urlCategory) ? urlCategory : 'All'
  )
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { isLoggedIn } = useUser()
  const navigate = useNavigate()

  const handleAddService = () => {
    if (isLoggedIn) {
      navigate('/dashboard')
    } else {
      setShowAuthModal(true)
    }
  }

  /* search hook — searches title, description, tags, provider */
  const { query, setQuery, filteredItems: searchFiltered } = useSearch(
    services,
    ['title', 'description', 'tags', 'provider', 'category'],
    250
  )

  /* combine search + category filter */
  const displayedServices = useMemo(() => {
    if (activeCategory === 'All') return searchFiltered
    return searchFiltered.filter((svc) => svc.category === activeCategory)
  }, [searchFiltered, activeCategory])

  const featuredCount = displayedServices.filter((svc) => svc.featured).length

  return (
    <motion.div
      className="page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      {/* ────── HERO / HEADER ────── */}
      <section className={s.hero}>
        <div className={s.heroOrbs}>
          <div className={s.orbLeft} />
          <div className={s.orbRight} />
        </div>

        <div className={`container ${s.heroContent}`}>
          <motion.div
            className={s.heroBadge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Sparkles size={14} />
            <span>{services.length} Services Available</span>
          </motion.div>

          <motion.h1
            className={s.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Explore <span className={s.gradientText}>Services</span>
          </motion.h1>

          <motion.p
            className={s.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            Discover talented students offering premium services — from design and development to tutoring and content creation.
          </motion.p>

          {/* Search Bar + Add Service Button */}
          <motion.div
            className={s.searchWrapper}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <div className={s.searchBar}>
              <Search size={20} className={s.searchIcon} />
              <input
                type="text"
                placeholder="Search services, skills, or providers..."
                className={s.searchInput}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className={s.searchHint}>
                <SlidersHorizontal size={14} />
              </div>
            </div>
          </motion.div>

          <motion.button
            className={s.addServiceBtn}
            onClick={handleAddService}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} />
            Add Your Service
          </motion.button>
        </div>
      </section>

      {/* ────── FILTERS & CONTENT ────── */}
      <section className={s.content}>
        <div className="container">
          {/* Category Pills */}
          <motion.div
            className={s.filters}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <div className={s.categoryPills}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`${s.pill} ${activeCategory === cat ? s.pillActive : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Result Count */}
          <motion.div
            className={s.resultBar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <p className={s.resultCount}>
              Showing <span className={s.resultHighlight}>{displayedServices.length}</span>{' '}
              {displayedServices.length === 1 ? 'service' : 'services'}
              {activeCategory !== 'All' && (
                <span className={s.resultCategory}> in {activeCategory}</span>
              )}
              {query && (
                <span className={s.resultQuery}> for "{query}"</span>
              )}
            </p>
            {featuredCount > 0 && (
              <span className={s.featuredBadge}>
                <Sparkles size={12} />
                {featuredCount} Featured
              </span>
            )}
          </motion.div>

          {/* Services Grid */}
          <AnimatePresence mode="wait">
            {displayedServices.length > 0 ? (
              <motion.div
                className={s.grid}
                key={`${activeCategory}-${query}`}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {displayedServices.map((svc) => (
                  <motion.div key={svc.id} variants={staggerChild}>
                    <ServiceCard service={svc} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className={s.emptyState}
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className={s.emptyIcon}>
                  <PackageOpen size={48} />
                </div>
                <h3 className={s.emptyTitle}>No services found</h3>
                <p className={s.emptyDesc}>
                  Try adjusting your search or filters to discover more services.
                </p>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setActiveCategory('All')
                    setQuery('')
                  }}
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ────── AUTH MODAL ────── */}
      <AnimatePresence>
        {showAuthModal && (
          <>
            <motion.div
              className={s.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowAuthModal(false)}
            />
            <motion.div
              className={s.modal}
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                className={s.modalClose}
                onClick={() => setShowAuthModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className={s.modalIcon}>
                <UserPlus size={32} />
              </div>

              <h2 className={s.modalTitle}>Join Campus Hustlers</h2>
              <p className={s.modalDesc}>
                You need to be logged in to list your service. Create an account or log in to start offering your skills to the campus community.
              </p>

              <div className={s.modalActions}>
                <button
                  className={s.modalLoginBtn}
                  onClick={() => {
                    setShowAuthModal(false)
                    navigate('/login')
                  }}
                >
                  <LogIn size={16} />
                  Login
                </button>
                <button
                  className={s.modalSignupBtn}
                  onClick={() => {
                    setShowAuthModal(false)
                    navigate('/signup')
                  }}
                >
                  <UserPlus size={16} />
                  Sign Up
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
