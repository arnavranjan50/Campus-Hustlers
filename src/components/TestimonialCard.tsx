import { generateStars } from '../utils/formatters'
import s from './TestimonialCard.module.css'

interface TestimonialCardProps {
  name: string
  college: string
  avatar: string
  text: string
  rating: number
}

export default function TestimonialCard({
  name,
  college,
  avatar,
  text,
  rating,
}: TestimonialCardProps) {
  return (
    <div className={s.card}>
      {/* Decorative quote mark */}
      <span className={s.quoteMark} aria-hidden="true">
        &ldquo;
      </span>

      {/* Review text */}
      <p className={s.text}>{text}</p>

      {/* Star rating */}
      <div className={s.stars}>{generateStars(rating)}</div>

      {/* Divider */}
      <div className={s.divider} />

      {/* Author */}
      <div className={s.author}>
        <div className={s.avatar}>{avatar}</div>
        <div className={s.authorInfo}>
          <span className={s.name}>{name}</span>
          <span className={s.college}>{college}</span>
        </div>
      </div>
    </div>
  )
}
