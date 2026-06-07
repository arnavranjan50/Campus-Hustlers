import { useCountUp } from '../hooks/useCountUp'
import s from './StatsCounter.module.css'

interface StatsCounterProps {
  end: number
  label: string
  prefix?: string
  suffix?: string
  duration?: number
}

export default function StatsCounter({
  end,
  label,
  prefix = '',
  suffix = '',
  duration = 2000,
}: StatsCounterProps) {
  const { value, ref } = useCountUp(end, duration, true)

  return (
    <div className={s.card} ref={ref as React.RefObject<HTMLDivElement>}>
      <div className={s.glowOrb} />
      <span className={s.value}>
        {prefix}
        {value.toLocaleString('en-IN')}
        {suffix}
      </span>
      <span className={s.label}>{label}</span>
    </div>
  )
}
