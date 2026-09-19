'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export default function AnimatedCounter({
  end,
  duration = 1500,
  suffix = '',
  prefix = '',
  className = '',
}: Props) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!ref.current) return

    const el = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true
            animate()
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end])

  const animate = () => {
    const start = performance.now()
    const startValue = 0
    const endValue = end

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(startValue + (endValue - startValue) * eased)
      setValue(current)
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setValue(endValue)
      }
    }

    requestAnimationFrame(tick)
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString('ar-EG')}
      {suffix}
    </span>
  )
}
