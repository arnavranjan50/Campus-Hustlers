import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Trophy, Compass, Wifi, MapPin, Monitor, PackageOpen, RefreshCw, Loader2 } from 'lucide-react'

import HackathonCard from '../components/HackathonCard'
import { hackathons as staticHackathons, hackathonCategories, hackathonModes } from '../data/hackathons'
import type { Hackathon, HackathonCategory, HackathonMode } from '../data/hackathons'
import { getLiveHackathons, getHackathonsMeta } from '../lib/firestore'
import { useSearch } from '../hooks/useSearch'

import s from './Hackathons.module.css'

/* ── Animation Variants ──────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
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

/* ── Mode Icon Helper ────────────────────────────────── */
const modeIcons: Record<string, React.ReactNode> = {
  All: <Compass size={14} />,
  Online: <Wifi size={14} />,
  Offline: <MapPin size={14} />,
  Hybrid: <Monitor size={14} />,
}

/* ── Time ago helper ─────────────────────────────────── */
function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/* ══════════════════════════════════════════════════════ */

export default function Hackathons() {
  const [activeCategory, setActiveCategory] = useState<HackathonCategory>('All')
  const [activeMode, setActiveMode] = useState<HackathonMode>('All')
  const [hackathons, setHackathons] = useState<Hackathon[]>(staticHackathons)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLiveData, setIsLiveData] = useState(false)

  // Fetch live hackathons from Firestore
  useEffect(() => {
    async function fetchLive() {
      try {
        const [liveData, meta] = await Promise.all([
          getLiveHackathons(),
          getHackathonsMeta(),
        ])

        if (liveData.length > 0) {
          // Map Firestore data to Hackathon type
          const mapped: Hackathon[] = liveData.map((h) => ({
            id: h.id || `live-${Math.random().toString(36).slice(2)}`,
            title: h.title,
            organizer: h.organizer,
            description: h.description,
            startDate: h.startDate,
            endDate: h.endDate,
            registrationDeadline: h.registrationDeadline || h.endDate,
            mode: h.mode,
            category: h.category,
            prize: h.prize,
            teamSize: h.teamSize,
            location: h.location,
            website: h.website,
            tags: h.tags || [],
            featured: h.featured,
            source: h.source,
          }))
          setHackathons(mapped)
          setIsLiveData(true)
        }
        // else: keep static data as fallback

        if (meta?.lastFetchedAt) {
          setLastUpdated(meta.lastFetchedAt)
        }
      } catch (err) {
        console.warn('Failed to fetch live hackathons, using static data:', err)
        // Keep static data
      } finally {
        setLoading(false)
      }
    }
    fetchLive()
  }, [])

  /* search hook — searches title, description, tags, organizer */
  const { query, setQuery, filteredItems: searchFiltered } = useSearch(
    hackathons,
    ['title', 'description', 'tags', 'organizer', 'category'],
    250
  )

  /* combine search + category + mode filters */
  const displayedHackathons = useMemo(() => {
    let result = searchFiltered

    if (activeCategory !== 'All') {
      result = result.filter((h) => h.category === activeCategory)
    }

    if (activeMode !== 'All') {
      result = result.filter((h) => h.mode === activeMode)
    }

    return result
  }, [searchFiltered, activeCategory, activeMode])

  const featuredCount = displayedHackathons.filter((h) => h.featured).length

  const clearAllFilters = () => {
    setActiveCategory('All')
    setActiveMode('All')
    setQuery('')
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
      {/* ────── HERO / HEADER ────── */}
      <section className={s.hero}>
        <div className={s.heroOrbs}>
          <div className={s.orbLeft} />
          <div className={s.orbRight} />
          <div className={s.orbCenter} />
        </div>

        <div className={`container ${s.heroContent}`}>
          <motion.div
            className={s.heroBadge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Trophy size={14} />
            <span>
              {loading ? 'Loading...' : `${hackathons.length} Hackathons Listed`}
            </span>
          </motion.div>

          <motion.h1
            className={s.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Discover <span className={s.gradientText}>Hackathons</span>
          </motion.h1>

          <motion.p
            className={s.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            Find the best hackathons from around the world — compete, collaborate, and win incredible prizes.
            {isLiveData && (
              <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginTop: 'var(--space-2)', opacity: 0.8 }}>
                <RefreshCw size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Live data • Refreshes automatically once daily
                {lastUpdated && ` • Updated ${timeAgo(lastUpdated)}`}
              </span>
            )}
          </motion.p>

          {/* Search Bar */}
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
                placeholder="Search hackathons, organizers, or topics..."
                className={s.searchInput}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────── FILTERS & CONTENT ────── */}
      <section className={s.content}>
        <div className="container">
          {/* Filter Rows */}
          <motion.div
            className={s.filters}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            {/* Category Pills */}
            <div className={s.filterRow}>
              <span className={s.filterLabel}>Category</span>
              <div className={s.categoryPills}>
                {hackathonCategories.map((cat) => (
                  <button
                    key={cat}
                    className={`${s.pill} ${activeCategory === cat ? s.pillActive : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Pills */}
            <div className={s.filterRow}>
              <span className={s.filterLabel}>Mode</span>
              <div className={s.modePills}>
                {hackathonModes.map((mode) => (
                  <button
                    key={mode}
                    className={`${s.modePill} ${activeMode === mode ? s.modePillActive : ''}`}
                    onClick={() => setActiveMode(mode)}
                  >
                    {modeIcons[mode]}
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Result Count */}
          <motion.div
            className={s.resultBar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
          >
            <p className={s.resultCount}>
              Showing <span className={s.resultHighlight}>{displayedHackathons.length}</span>{' '}
              {displayedHackathons.length === 1 ? 'hackathon' : 'hackathons'}
              {activeCategory !== 'All' && (
                <span className={s.resultCategory}> in {activeCategory}</span>
              )}
              {activeMode !== 'All' && (
                <span className={s.resultMode}> • {activeMode}</span>
              )}
              {query && (
                <span className={s.resultQuery}> for "{query}"</span>
              )}
            </p>
            {featuredCount > 0 && (
              <span className={s.featuredBadge}>
                <Trophy size={12} />
                {featuredCount} Featured
              </span>
            )}
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16) 0' }}>
              <Loader2 size={32} style={{ color: 'var(--accent-gold)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            /* Hackathons Grid */
            <AnimatePresence mode="wait">
              {displayedHackathons.length > 0 ? (
                <motion.div
                  className={s.grid}
                  key={`${activeCategory}-${activeMode}-${query}`}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {displayedHackathons.map((h) => (
                    <motion.div key={h.id} variants={staggerChild}>
                      <HackathonCard hackathon={h} />
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
                  <h3 className={s.emptyTitle}>No hackathons found</h3>
                  <p className={s.emptyDesc}>
                    Try adjusting your search, category, or mode filters to find more hackathons.
                  </p>
                  <button className="btn btn-outline" onClick={clearAllFilters}>
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>
    </motion.div>
  )
}
