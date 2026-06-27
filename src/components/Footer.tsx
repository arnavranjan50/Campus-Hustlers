import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand Column */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoCampus}>Campus</span>
              <span className={styles.logoHustlers}>Hustlers</span>
            </Link>
            <p className={styles.tagline}>
              India's premier student marketplace — connecting talented college students with opportunities that matter.
            </p>
            <div className={styles.socials}>
              <a href="https://github.com/arnavranjan50" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="GitHub">
                <Github size={16} />
              </a>
              <a href="https://x.com/arnavranjan50" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a href="https://www.linkedin.com/in/arnav-ranjan-972348207" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
              <a href="https://instagram.com/arnav_ranjan18" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Quick Links</h4>
            <ul className={styles.columnLinks}>
              <li><Link to="/" className={styles.columnLink}>Home</Link></li>
              <li><Link to="/services" className={styles.columnLink}>Browse Services</Link></li>
              <li><Link to="/hackathons" className={styles.columnLink}>Hackathons</Link></li>
              <li><Link to="/dashboard" className={styles.columnLink}>Dashboard</Link></li>
              <li><Link to="/about" className={styles.columnLink}>About Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Services</h4>
            <ul className={styles.columnLinks}>
              <li><Link to="/services?category=Design" className={styles.columnLink}>Design</Link></li>
              <li><Link to="/services?category=Development" className={styles.columnLink}>Development</Link></li>
              <li><Link to="/services?category=Writing" className={styles.columnLink}>Writing</Link></li>
              <li><Link to="/services?category=Marketing" className={styles.columnLink}>Marketing</Link></li>
              <li><Link to="/services?category=Tutoring" className={styles.columnLink}>Tutoring</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Contact</h4>
            <ul className={styles.columnLinks}>
              <li className={styles.contactItem}>
                <Mail size={14} />
                arnavranjan50@gmail.com
              </li>
              <li className={styles.contactItem}>
                <Phone size={14} />
                +91 84465 48117
              </li>
              <li className={styles.contactItem}>
                <MapPin size={14} />
                Bangalore, India
              </li>
            </ul>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 Campus Hustlers. Built by students, for students.
          </p>
        </div>
      </div>
    </footer>
  )
}
