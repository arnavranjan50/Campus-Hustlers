import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Trophy, Compass, Wifi, MapPin, Monitor, PackageOpen } from 'lucide-react'

import HackathonCard from '../components/HackathonCard'
import { hackathons, hackathonCategories, hackathonModes } from '../data/hackathons'
import type { HackathonCategory, HackathonMode } from '../data/hackathons'
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

/* ══════════════════════════════════════════════════════ */

export default function Hackathons() {
  const [activeCategory, setActiveCategory] = useState<HackathonCategory>('All')
  const [activeMode, setActiveMode] = useState<HackathonMode>('All')

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
            <span>{hackathons.length} Hackathons Listed</span>
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

          {/* Hackathons Grid */}
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
        </div>
      </section>
    </motion.div>
  )
}
