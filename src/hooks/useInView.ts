import { useEffect, useRef, useState } from 'react'

export function useInView(
  options: IntersectionObserverInit = { threshold: 0.1 }
): [React.RefObject<HTMLElement | null>, boolean] {
  const ref = useRef<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.unobserve(el)
      }
    }, options)

    observer.observe(el)
    return () => observer.unobserve(el)
  }, [])

  return [ref, isInView]
}
