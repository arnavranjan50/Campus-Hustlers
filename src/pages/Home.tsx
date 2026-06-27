import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  Briefcase,
  Handshake,
  TrendingUp,
} from 'lucide-react'

import ServiceCard from '../components/ServiceCard'
import HackathonCard from '../components/HackathonCard'
import StatsCounter from '../components/StatsCounter'
import TestimonialCard from '../components/TestimonialCard'
import { useUser } from '../context/UserContext'

import { services } from '../data/services'
import { hackathons as staticHackathons } from '../data/hackathons'
import type { Hackathon } from '../data/hackathons'
import { getLiveHackathons } from '../lib/firestore'
import { useInView } from '../hooks/useInView'

import s from './Home.module.css'

/* ── Animation Variants ──────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

/* ── Derived Data ────────────────────────────────────── */
const featuredServices = services.filter((svc) => svc.featured)
const staticFeatured = staticHackathons.filter((h) => h.featured).slice(0, 3)

const steps = [
  {
    icon: Briefcase,
    title: 'Post Your Service',
    desc: 'Students list their skills and services for free — zero listing fee, unlimited potential.',
  },
  {
    icon: Handshake,
    title: 'Connect & Collaborate',
    desc: 'Customers discover talented students, browse portfolios, and book services they need.',
  },
  {
    icon: TrendingUp,
    title: 'Earn & Grow',
    desc: 'Get paid for your skills, collect reviews, and build a professional portfolio that shines.',
  },
]

const testimonials = [
  {
    name: 'Rohit Sharma',
    college: 'IIT Delhi',
    avatar: 'RS',
    text: 'Campus Hustlers helped me earn ₹50,000 in my first semester through freelance web development. The platform fee is minimal and the exposure is incredible.',
    rating: 5,
  },
  {
    name: 'Priya Nair',
    college: 'NIT Calicut',
    avatar: 'PN',
    text: 'I found three hackathons through this platform and won two of them! The search filters make it so easy to find relevant events.',
    rating: 5,
  },
  {
    name: 'Amit Patel',
    college: 'BITS Goa',
    avatar: 'AP2',
    text: 'As a customer, I got amazing design work from talented students at very affordable rates. The quality exceeded my expectations every time.',
    rating: 4.5,
  },
]

/* ══════════════════════════════════════════════════════ */

export default function Home() {
  const { user } = useUser()
  const [featuredHackathons, setFeaturedHackathons] = useState<Hackathon[]>(staticFeatured)

  /* fetch live hackathons from Firestore */
  useEffect(() => {
    async function fetchLive() {
      try {
        const liveData = await getLiveHackathons()
        if (liveData.length > 0) {
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
            tags: (h.tags || []).map((t: any) => typeof t === 'string' ? t : (t?.name || String(t))),
            featured: h.featured,
            source: h.source,
          }))
          // Show featured first, then any others, limit to 3
          const featured = mapped.filter((h) => h.featured)
          const rest = mapped.filter((h) => !h.featured)
          setFeaturedHackathons([...featured, ...rest].slice(0, 3))
        }
      } catch {
        // Keep static data
      }
    }
    fetchLive()
  }, [])

  /* intersection observers for animated sections */
  const [howRef, howInView] = useInView({ threshold: 0.15 })
  const [hackRef, hackInView] = useInView({ threshold: 0.1 })
  const [testRef, testInView] = useInView({ threshold: 0.1 })

  return (
    <motion.div
      className="page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      {/* ────── HERO ────── */}
      <section className={s.hero}>
        <div className={s.heroOverlay} />
        <div className={s.heroOrbs}>
          <div className={s.heroOrbCenter} />
        </div>

        <motion.div
          className={s.heroContent}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.span className={s.heroBadge} custom={0} variants={fadeUp}>
            🚀 India's #1 Student Services Platform
          </motion.span>

          <motion.h1 className={s.heroHeading} custom={1} variants={fadeUp}>
            Empowering College Students to{' '}
            <span className={s.heroGradient}>Earn, Learn &amp; Grow</span>
          </motion.h1>

          <motion.p className={s.heroSubtitle} custom={2} variants={fadeUp}>
            A premium marketplace where college students showcase their skills, find freelance
            opportunities, and discover hackathons — all in one place.
          </motion.p>

          <motion.div className={s.heroCta} custom={3} variants={fadeUp}>
            <Link to="/services" className="btn btn-primary btn-lg">
              Explore Services
            </Link>
            <Link to="/services" className="btn btn-outline btn-lg">
              List Your Service — Free
            </Link>
          </motion.div>
        </motion.div>

        <div className={s.scrollIndicator}>
          <span>Scroll</span>
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ────── STATS ────── */}
      <section className={s.stats}>
        <div className="container">
          <div className={s.statsGrid}>
            <StatsCounter end={5000} label="Students" suffix="+" />
            <StatsCounter end={1200} label="Services" suffix="+" />
            <StatsCounter end={350} label="Hackathons Tracked" suffix="+" />
            <StatsCounter end={2500000} label="Earned" prefix="₹" suffix="+" />
          </div>
        </div>
      </section>

      {/* ────── FEATURED SERVICES ────── */}
      <section className={s.featuredServices}>
        <div className="container">
          <div className="section-header">
            <h2>Featured Services</h2>
            <p>Hand-picked talent from top colleges across India</p>
          </div>

          <motion.div
            className={s.servicesGrid}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {featuredServices.map((svc) => (
              <motion.div key={svc.id} variants={staggerChild}>
                <ServiceCard service={svc} />
              </motion.div>
            ))}
          </motion.div>

          <div className={s.servicesCta}>
            <Link to="/services" className="btn btn-outline btn-lg">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* ────── HOW IT WORKS ────── */}
      <section className={s.howItWorks} ref={howRef as React.RefObject<HTMLElement>}>
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Start earning in three simple steps</p>
          </div>

          <motion.div
            className={s.stepsGrid}
            initial="hidden"
            animate={howInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div className={s.step} key={i} variants={staggerChild}>
                  <div className={s.stepNumber}>{i + 1}</div>
                  <div className={s.stepIcon}>
                    <Icon size={32} />
                  </div>
                  <h4 className={s.stepTitle}>{step.title}</h4>
                  <p className={s.stepDesc}>{step.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ────── HACKATHON SPOTLIGHT ────── */}
      <section className={s.hackathonSpotlight} ref={hackRef as React.RefObject<HTMLElement>}>
        <div className="container">
          <div className="section-header">
            <h2>Upcoming Hackathons</h2>
            <p>Compete, collaborate, and win prizes in top hackathons</p>
          </div>

          <motion.div
            className={s.hackathonGrid}
            initial="hidden"
            animate={hackInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            {featuredHackathons.map((h) => (
              <motion.div key={h.id} variants={staggerChild}>
                <HackathonCard hackathon={h} />
              </motion.div>
            ))}
          </motion.div>

          <div className={s.hackathonCta}>
            <Link to="/hackathons" className="btn btn-outline btn-lg">
              View All Hackathons
            </Link>
          </div>
        </div>
      </section>

      {/* ────── TESTIMONIALS ────── */}
      <section className={s.testimonials} ref={testRef as React.RefObject<HTMLElement>}>
        <div className="container">
          <div className="section-header">
            <h2>What Students Say</h2>
            <p>Real stories from real hustlers on campus</p>
          </div>

          <motion.div
            className={s.testimonialGrid}
            initial="hidden"
            animate={testInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={staggerChild}>
                <TestimonialCard
                  name={t.name}
                  college={t.college}
                  avatar={t.avatar}
                  text={t.text}
                  rating={t.rating}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────── CTA BANNER (only when not logged in) ────── */}
      {!user && (
        <section className={s.ctaBanner}>
          <div className={`container ${s.ctaContent}`}>
            <h2 className={s.ctaHeading}>Ready to Start Your Hustle?</h2>
            <p className={s.ctaSubtitle}>
              Join thousands of students already earning on Campus Hustlers
            </p>
            <Link to="/signup" className={s.ctaButton}>
              Get Started Now
            </Link>
          </div>
        </section>
      )}
    </motion.div>
  )
}
