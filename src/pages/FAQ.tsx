import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  HelpCircle,
  ShoppingBag,
  GraduationCap,
  Shield,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Mail,
} from 'lucide-react'

import s from './FAQ.module.css'

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

/* ── FAQ Data ────────────────────────────────────────── */
interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  title: string
  icon: React.FC<{ size?: number }>
  items: FAQItem[]
}

const faqCategories: FAQCategory[] = [
  {
    title: 'General',
    icon: HelpCircle,
    items: [
      {
        question: 'What is Campus Hustlers?',
        answer:
          'Campus Hustlers is India\'s premier student-powered marketplace where college students can offer their skills as services — design, development, writing, tutoring, and more — to customers who need them. We also track hackathons across the country so students never miss an opportunity to compete and win.',
      },
      {
        question: 'Is Campus Hustlers free to use?',
        answer:
          'Yes! Creating an account and browsing services is completely free. Students can list their services at no upfront cost. We only charge a small platform fee when a transaction is successfully completed, ensuring you only pay when you earn.',
      },
      {
        question: 'Who can use Campus Hustlers?',
        answer:
          'Anyone can sign up as a customer to browse and book services. To offer services as a provider, you need to be a currently enrolled college student in India. We verify student status to maintain the quality and authenticity of our marketplace.',
      },
    ],
  },
  {
    title: 'For Customers',
    icon: ShoppingBag,
    items: [
      {
        question: 'How do I book a service?',
        answer:
          'Browse our services page, find a service that matches your needs, and click "Book Now." You\'ll be guided through a simple checkout process where you can specify your requirements, choose a delivery timeline, and complete payment securely.',
      },
      {
        question: 'What payment methods are accepted?',
        answer:
          'We accept all major payment methods including UPI, credit/debit cards, net banking, and popular wallets like Paytm and PhonePe. All payments are processed securely through our trusted payment gateway.',
      },
      {
        question: 'What if I\'m not satisfied with the service?',
        answer:
          'We have a satisfaction guarantee policy. If the delivered work doesn\'t match the agreed-upon requirements, you can request revisions. If the issue remains unresolved, our support team will mediate and you may be eligible for a partial or full refund.',
      },
      {
        question: 'How do I contact the service provider?',
        answer:
          'Once you book a service, you\'ll get access to our in-platform messaging system where you can communicate directly with the student provider. You can share files, discuss requirements, and track progress — all within Campus Hustlers.',
      },
    ],
  },
  {
    title: 'For Students',
    icon: GraduationCap,
    items: [
      {
        question: 'How do I list my service?',
        answer:
          'After signing up as a student, head to your Dashboard and click "Add Service." Fill in your service title, description, pricing, delivery time, and upload portfolio samples. Once submitted, your service will be reviewed and go live within 24 hours.',
      },
      {
        question: 'How much does Campus Hustlers charge?',
        answer:
          'We charge the lowest platform fee in the industry — just 10% of each completed transaction. This covers payment processing, platform maintenance, and customer support. You keep 90% of your earnings, with no hidden fees or monthly charges.',
      },
      {
        question: 'How do I get paid?',
        answer:
          'Earnings are deposited directly to your linked bank account or UPI ID. Payments are released within 3-5 business days after the customer confirms satisfaction with the delivered work. You can track all your earnings in the Dashboard.',
      },
      {
        question: 'Can I offer multiple services?',
        answer:
          'Absolutely! You can list as many services as you want. Many students offer a range of skills — for example, both graphic design and video editing. Each service gets its own listing with separate pricing and portfolio.',
      },
    ],
  },
  {
    title: 'Account & Security',
    icon: Shield,
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Click "Sign Up" and choose your role (Customer or Student). You can register with your email, Google account, or GitHub account. Students will need to provide their college details for verification. The process takes less than 2 minutes.',
      },
      {
        question: 'Is my payment information secure?',
        answer:
          'Yes, absolutely. We never store your card details on our servers. All payment processing is handled by PCI-DSS compliant payment gateways with bank-level 256-bit encryption. Your financial data is always protected.',
      },
      {
        question: 'How do I delete my account?',
        answer:
          'You can request account deletion from Settings → Account → Delete Account. Please note that this action is irreversible — all your data, service listings, and transaction history will be permanently removed. Any pending orders must be completed or cancelled first.',
      },
    ],
  },
]

/* ── Accordion Item Component ────────────────────────── */
function AccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`${s.accordionItem} ${isOpen ? s.accordionItemOpen : ''}`}>
      <button
        className={s.accordionTrigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={s.accordionQuestion}>{item.question}</span>
        <ChevronDown size={20} className={s.accordionChevron} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className={s.accordionContent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className={s.accordionAnswer}>{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════ */

export default function FAQ() {
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
              <span>Help Center</span>
            </motion.div>

            <motion.h1 className={s.heroTitle} variants={staggerChild}>
              Frequently Asked <span className="gradient-text">Questions</span>
            </motion.h1>

            <motion.p className={s.heroSubtitle} variants={staggerChild}>
              Everything you need to know about Campus Hustlers.
              Can&apos;t find what you&apos;re looking for? Reach out to our team.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ────── FAQ CONTENT ────── */}
      <section className={s.faqSection}>
        <div className="container">
          <motion.div
            className={s.faqGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={staggerContainer}
          >
            {faqCategories.map((category) => {
              const Icon = category.icon
              return (
                <motion.div
                  className={s.category}
                  key={category.title}
                  variants={staggerChild}
                >
                  <div className={s.categoryHeader}>
                    <div className={s.categoryIcon}>
                      <Icon size={22} />
                    </div>
                    <h2 className={s.categoryTitle}>{category.title}</h2>
                  </div>

                  {category.items.map((item) => (
                    <AccordionItem key={item.question} item={item} />
                  ))}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ────── CTA ────── */}
      <section className={s.cta}>
        <div className="container">
          <motion.div
            className={s.ctaContent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.h2 className={s.ctaTitle} variants={staggerChild}>
              Still have <span className="gradient-text">questions</span>?
            </motion.h2>
            <motion.p className={s.ctaText} variants={staggerChild}>
              Our team is happy to help. Reach out and we&apos;ll get back to you
              within 24 hours.
            </motion.p>
            <motion.div className={s.ctaActions} variants={staggerChild}>
              <a href="mailto:hello@campushustlers.in" className="btn btn-primary btn-lg">
                <Mail size={18} />
                Contact Support
              </a>
              <Link to="/about" className="btn btn-outline btn-lg">
                About Us
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
