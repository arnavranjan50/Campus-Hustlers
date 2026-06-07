import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Users,
  Target,
  Eye,
  Lightbulb,
  Heart,
  Shield,
  Zap,
  Globe,
  Mail,
  ArrowRight,
  GraduationCap,
  Trophy,
  IndianRupee,
  Briefcase,
} from 'lucide-react'

import { useInView } from '../hooks/useInView'
import { useCountUp } from '../hooks/useCountUp'

import s from './About.module.css'

/* ── Animation Variants ──────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
}

/* ── Data ────────────────────────────────────────────── */
const teamMembers = [
  {
    name: 'Arjun Mehta',
    role: 'Founder & CEO',
    college: 'IIT Bombay',
    avatar: 'AM',
    bio: 'Full-stack developer passionate about creating platforms that empower student talent across India.',
  },
  {
    name: 'Sneha Reddy',
    role: 'Co-Founder & CTO',
    college: 'IIT Hyderabad',
    avatar: 'SR',
    bio: 'Systems architect who believes in building technology that bridges the gap between education and opportunity.',
  },
  {
    name: 'Rahul Verma',
    role: 'Head of Design',
    college: 'NID Ahmedabad',
    avatar: 'RV',
    bio: 'UX designer crafting intuitive, beautiful experiences that make Campus Hustlers a joy to use.',
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Community',
    college: 'BITS Pilani',
    avatar: 'PS',
    bio: 'Community builder dedicated to fostering connections and helping students find their first gig.',
  },
  {
    name: 'Vikram Singh',
    role: 'Lead Developer',
    college: 'IIT Delhi',
    avatar: 'VS',
    bio: 'Backend engineer focused on scalability, ensuring the platform handles thousands of concurrent users seamlessly.',
  },
  {
    name: 'Ananya Patel',
    role: 'Marketing Lead',
    college: 'MICA Ahmedabad',
    avatar: 'AP',
    bio: 'Growth strategist driving Campus Hustlers\'s presence across 200+ colleges nationwide.',
  },
]

const values = [
  {
    icon: Zap,
    title: 'Empowerment',
    description:
      'We give students the tools and platform to monetize their skills, build portfolios, and gain real-world experience while still in college.',
  },
  {
    icon: Heart,
    title: 'Community',
    description:
      'We foster a vibrant ecosystem where students collaborate, learn from each other, and grow together — because success is better shared.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We continuously push boundaries to create cutting-edge features that make discovering talent and opportunities effortless.',
  },
  {
    icon: Shield,
    title: 'Transparency',
    description:
      'Fair pricing, honest reviews, and clear communication. We believe trust is the foundation of every great marketplace.',
  },
]

/* ══════════════════════════════════════════════════════ */

function StatBox({
  end,
  label,
  prefix = '',
  suffix = '',
  icon: Icon,
}: {
  end: number
  label: string
  prefix?: string
  suffix?: string
  icon: React.FC<{ size?: number }>
}) {
  const [ref, inView] = useInView({ threshold: 0.3 })
  const { value } = useCountUp(end, 2000, inView)

  return (
    <div className={s.statBox} ref={ref as React.RefObject<HTMLDivElement>}>
      <div className={s.statIcon}>
        <Icon size={24} />
      </div>
      <span className={s.statNumber}>
        {prefix}
        {value.toLocaleString('en-IN')}
        {suffix}
      </span>
      <span className={s.statLabel}>{label}</span>
    </div>
  )
}

export default function About() {
  const [missionRef, missionInView] = useInView({ threshold: 0.15 })
  const [visionRef, visionInView] = useInView({ threshold: 0.15 })
  const [teamRef, teamInView] = useInView({ threshold: 0.08 })
  const [valuesRef, valuesInView] = useInView({ threshold: 0.1 })
  const [ctaRef, ctaInView] = useInView({ threshold: 0.15 })

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
        <div className={s.heroOrbs}>
          <div className={s.heroOrbLeft} />
          <div className={s.heroOrbRight} />
          <div className={s.heroOrbCenter} />
        </div>
        <div className="container">
          <motion.div
            className={s.heroContent}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div className={s.heroBadge} variants={staggerChild}>
              <Sparkles size={14} />
              <span>Our Story</span>
            </motion.div>

            <motion.h1 className={s.heroTitle} variants={staggerChild}>
              About <span className="gradient-text">Campus Hustlers</span>
            </motion.h1>

            <motion.p className={s.heroSubtitle} variants={staggerChild}>
              Empowering India's brightest college students to turn their skills into income,
              build world-class portfolios, and connect with opportunities that matter.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ────── STATS ────── */}
      <section className={s.stats}>
        <div className="container">
          <div className={s.statsGrid}>
            <StatBox end={5000} label="Students" suffix="+" icon={GraduationCap} />
            <StatBox end={1200} label="Services" suffix="+" icon={Briefcase} />
            <StatBox end={350} label="Hackathons Tracked" suffix="+" icon={Trophy} />
            <StatBox end={25} label="Lakhs Earned" prefix="₹" suffix="L+" icon={IndianRupee} />
          </div>
        </div>
      </section>

      {/* ────── MISSION ────── */}
      <section
        className={s.mission}
        ref={missionRef as React.RefObject<HTMLElement>}
      >
        <div className="container">
          <motion.div
            className={s.splitSection}
            initial="hidden"
            animate={missionInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            <motion.div className={s.splitIcon} variants={staggerChild}>
              <div className={s.iconCircle}>
                <Target size={48} />
              </div>
            </motion.div>
            <motion.div className={s.splitContent} variants={staggerChild}>
              <h6 className={s.sectionLabel}>Our Mission</h6>
              <h2 className={s.sectionTitle}>
                Connecting Student Talent with <span className="gradient-text">Opportunity</span>
              </h2>
              <p className={s.sectionText}>
                Campus Hustlers was born from a simple observation: Indian colleges are overflowing
                with incredible talent — designers, developers, writers, marketers — but most
                students have no platform to showcase their skills or earn from them.
              </p>
              <p className={s.sectionText}>
                We bridge that gap. Our marketplace connects skilled students with people who need
                their services, while our hackathon tracker ensures no student misses an opportunity
                to compete, learn, and win. With the lowest platform fees in the industry, we make
                sure students keep more of what they earn.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ────── VISION ────── */}
      <section
        className={s.vision}
        ref={visionRef as React.RefObject<HTMLElement>}
      >
        <div className="container">
          <motion.div
            className={`${s.splitSection} ${s.splitReverse}`}
            initial="hidden"
            animate={visionInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            <motion.div className={s.splitIcon} variants={staggerChild}>
              <div className={s.iconCircle}>
                <Eye size={48} />
              </div>
            </motion.div>
            <motion.div className={s.splitContent} variants={staggerChild}>
              <h6 className={s.sectionLabel}>Our Vision</h6>
              <h2 className={s.sectionTitle}>
                Building the Future of <span className="gradient-text">Student Economy</span>
              </h2>
              <p className={s.sectionText}>
                We envision a world where every college student in India has the tools and
                platform to build a professional career before they graduate. Where your portfolio
                speaks louder than your degree, and where talent knows no boundaries.
              </p>
              <p className={s.sectionText}>
                By 2027, we aim to be present in 1,000+ colleges, empower 100,000 students,
                and facilitate ₹50 crore in student earnings. We're not just building a platform
                — we're sparking a movement.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ────── VALUES ────── */}
      <section
        className={s.valuesSection}
        ref={valuesRef as React.RefObject<HTMLElement>}
      >
        <div className="container">
          <div className="section-header">
            <h2>What We Stand For</h2>
            <p>The principles that guide everything we build</p>
          </div>

          <motion.div
            className={s.valuesGrid}
            initial="hidden"
            animate={valuesInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            {values.map((value, i) => {
              const Icon = value.icon
              return (
                <motion.div className={s.valueCard} key={i} variants={staggerChild}>
                  <div className={s.valueIcon}>
                    <Icon size={28} />
                  </div>
                  <h4 className={s.valueTitle}>{value.title}</h4>
                  <p className={s.valueDesc}>{value.description}</p>
                  <div className={s.valueGlow} />
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ────── TEAM ────── */}
      <section
        className={s.teamSection}
        ref={teamRef as React.RefObject<HTMLElement>}
      >
        <div className="container">
          <div className="section-header">
            <h2>Meet the Team</h2>
            <p>The passionate students behind Campus Hustlers</p>
          </div>

          <motion.div
            className={s.teamGrid}
            initial="hidden"
            animate={teamInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            {teamMembers.map((member, i) => (
              <motion.div className={s.teamCard} key={i} variants={staggerChild}>
                <div className={s.teamAvatar}>
                  {member.avatar}
                </div>
                <h4 className={s.teamName}>{member.name}</h4>
                <span className={s.teamRole}>{member.role}</span>
                <span className={s.teamCollege}>{member.college}</span>
                <p className={s.teamBio}>{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────── CTA ────── */}
      <section
        className={s.cta}
        ref={ctaRef as React.RefObject<HTMLElement>}
      >
        <div className={s.ctaOrbs}>
          <div className={s.ctaOrbLeft} />
          <div className={s.ctaOrbRight} />
        </div>
        <div className="container">
          <motion.div
            className={s.ctaContent}
            initial="hidden"
            animate={ctaInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            <motion.div className={s.ctaIcon} variants={staggerChild}>
              <Globe size={40} />
            </motion.div>
            <motion.h2 className={s.ctaTitle} variants={staggerChild}>
              Ready to Join the <span className="gradient-text">Movement</span>?
            </motion.h2>
            <motion.p className={s.ctaSubtitle} variants={staggerChild}>
              Whether you're a student looking to earn or someone seeking talented
              individuals — Campus Hustlers is your platform.
            </motion.p>
            <motion.div className={s.ctaActions} variants={staggerChild}>
              <Link to="/services" className="btn btn-primary btn-lg">
                Explore Services
                <ArrowRight size={18} />
              </Link>
              <a href="mailto:hello@campushustlers.in" className="btn btn-outline btn-lg">
                <Mail size={18} />
                Get In Touch
              </a>
            </motion.div>
            <motion.div className={s.ctaContact} variants={staggerChild}>
              <p>
                <Mail size={14} />
                <span>hello@campushustlers.in</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
