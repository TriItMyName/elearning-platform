import gsap from 'gsap'
import { useEffect, useRef, type RefObject } from 'react'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function resetDashboardItems(container: HTMLElement) {
  const items = container.querySelectorAll('[data-dashboard-item]')
  gsap.killTweensOf(items)
  gsap.set(items, { opacity: 1, y: 0, clearProps: 'all' })
}

export function useDashboardEnter(containerRef: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const container = containerRef.current
    if (!enabled || !container) return

    if (prefersReducedMotion()) {
      resetDashboardItems(container)
      return
    }

    let ctx: gsap.Context | undefined
    let raf = 0

    raf = requestAnimationFrame(() => {
      resetDashboardItems(container)

      ctx = gsap.context(() => {
        gsap.fromTo(
          '[data-dashboard-item]',
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.06,
            ease: 'power3.out',
            clearProps: 'all',
            overwrite: 'auto',
          },
        )
      }, container)
    })

    return () => {
      cancelAnimationFrame(raf)
      ctx?.revert()
      if (container.isConnected) resetDashboardItems(container)
    }
  }, [containerRef, enabled])
}

export function useCountUp(value: number, enabled = true) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    el.textContent = '0'

    if (prefersReducedMotion()) {
      el.textContent = String(value)
      return
    }

    const state = { n: 0 }
    const tween = gsap.to(state, {
      n: value,
      duration: 1.35,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = String(Math.round(state.n))
      },
      onComplete: () => {
        el.textContent = String(value)
      },
    })

    return () => {
      tween.kill()
      el.textContent = String(value)
    }
  }, [value, enabled])

  return ref
}

export function useChartDraw(
  pathRef: RefObject<SVGPathElement | null>,
  areaRef: RefObject<SVGPathElement | null>,
  enabled = true,
) {
  useEffect(() => {
    const line = pathRef.current
    const area = areaRef.current
    if (!enabled || !line) return

    if (prefersReducedMotion()) {
      gsap.set(line, { clearProps: 'strokeDashoffset,strokeDasharray' })
      if (area) gsap.set(area, { opacity: 1 })
      return
    }

    const lineLen = line.getTotalLength()
    gsap.set(line, { strokeDasharray: lineLen, strokeDashoffset: lineLen })
    if (area) gsap.set(area, { opacity: 0 })

    const tl = gsap.timeline({ delay: 0.25 })
    tl.to(line, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' })
    if (area) tl.to(area, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.5')

    return () => {
      tl.kill()
      gsap.set(line, { clearProps: 'strokeDashoffset,strokeDasharray' })
      if (area) gsap.set(area, { opacity: 1 })
    }
  }, [pathRef, areaRef, enabled])
}

export function useRingProgress(
  ringRef: RefObject<SVGCircleElement | null>,
  percent: number,
  enabled = true,
) {
  useEffect(() => {
    const ring = ringRef.current
    if (!ring || !enabled) return

    const radius = Number(ring.getAttribute('r') ?? 54)
    const circumference = 2 * Math.PI * radius
    const target = circumference * (1 - percent / 100)

    ring.style.strokeDasharray = `${circumference}`

    gsap.killTweensOf(ring)

    if (prefersReducedMotion()) {
      ring.style.strokeDashoffset = `${target}`
      return
    }

    const tween = gsap.fromTo(
      ring,
      { strokeDashoffset: circumference },
      {
        strokeDashoffset: target,
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.35,
      },
    )

    return () => {
      tween.kill()
      ring.style.strokeDashoffset = `${target}`
    }
  }, [ringRef, percent, enabled])
}
