import { useState, useEffect, useRef } from 'react'

export function useCountUp(
  end: number,
  duration: number = 2000,
  startOnView: boolean = true
): { value: number; ref: React.RefObject<HTMLElement | null> } {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLElement | null>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!startOnView) {
      animate()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          animate()
        }
      },
      { threshold: 0.3 }
    )

    const el = ref.current
    if (el) observer.observe(el)
    return () => {
      if (el) observer.unobserve(el)
    }
  }, [end, duration, startOnView])

  function animate() {
    const startTime = performance.now()
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  return { value, ref }
}
