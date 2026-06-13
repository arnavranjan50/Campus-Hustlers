import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  ExternalLink,
} from 'lucide-react'
import type { Hackathon } from '../data/hackathons'
import {
  formatCurrency,
  formatDateRange,
  getCountdown,
} from '../utils/formatters'
import s from './HackathonCard.module.css'

interface HackathonCardProps {
  hackathon: Hackathon
}

const modeBadgeClass: Record<Hackathon['mode'], string> = {
  Online: 'badge-success',
  Offline: 'badge-info',
  Hybrid: 'badge-warning',
}

export default function HackathonCard({ hackathon }: HackathonCardProps) {
  const countdown = getCountdown(hackathon.registrationDeadline)
  const isClosed = countdown === 'Registration Closed'

  return (
    <div className={s.card}>
      {/* Header row: category + mode */}
      <div className={s.header}>
        <span className={s.category}>{hackathon.category}</span>
        <span className={`badge ${modeBadgeClass[hackathon.mode]}`}>
          {hackathon.mode}
        </span>
      </div>

      {/* Title & organizer */}
      <h3 className={s.title}>{hackathon.title}</h3>
      <p className={s.organizer}>{hackathon.organizer}</p>

      {/* Meta info grid */}
      <div className={s.meta}>
        <div className={s.metaItem}>
          <Calendar size={14} />
          <span>{formatDateRange(hackathon.startDate, hackathon.endDate)}</span>
        </div>

        {hackathon.location && (
          <div className={s.metaItem}>
            <MapPin size={14} />
            <span>{hackathon.location}</span>
          </div>
        )}

        <div className={s.metaItem}>
          <Users size={14} />
          <span>{hackathon.teamSize}</span>
        </div>

        <div className={`${s.metaItem} ${isClosed ? s.closed : s.countdown}`}>
          <Clock size={14} />
          <span>{countdown}</span>
        </div>
      </div>

      {/* Prize */}
      <div className={s.prizeRow}>
        <Trophy size={16} className={s.prizeIcon} />
        <span className={s.prizeAmount}>
          {typeof hackathon.prize === 'number'
            ? formatCurrency(hackathon.prize)
            : hackathon.prize || 'Prizes available'}
        </span>
        {typeof hackathon.prize === 'number' && (
          <span className={s.prizeLabel}>in prizes</span>
        )}
      </div>

      {/* Tags */}
      <div className={s.tags}>
        {hackathon.tags.map((tag) => (
          <span key={tag} className={s.tag}>
            {tag}
          </span>
        ))}
      </div>

      {/* Register button */}
      <a
        href={hackathon.website}
        target="_blank"
        rel="noopener noreferrer"
        className={s.registerBtn}
      >
        Register
        <ExternalLink size={14} />
      </a>
    </div>
  )
}
