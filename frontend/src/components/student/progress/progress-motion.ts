import gsap from 'gsap'
import { useEffect, useRef, type RefObject } from 'react'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useProgressPageEnter(containerRef: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const container = containerRef.current
    if (!enabled || !container) return

    if (prefersReducedMotion()) return

    let ctx: gsap.Context | undefined
    const raf = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          '[data-progress-item]',
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.07,
            ease: 'power3.out',
            clearProps: 'all',
          },
        )
      }, container)
    })

    return () => {
      cancelAnimationFrame(raf)
      ctx?.revert()
    }
  }, [containerRef, enabled])
}

export function useAnimatedBars(
  containerRef: RefObject<HTMLElement | null>,
  ready: boolean,
  dependencyKey: string,
) {
  useEffect(() => {
    const container = containerRef.current
    if (!ready || !container) return

    const bars = container.querySelectorAll<HTMLElement>('[data-progress-bar]')
    bars.forEach((bar) => {
      const target = bar.dataset.progressTarget ?? '0'
      bar.style.width = prefersReducedMotion() ? `${target}%` : '0%'
    })

    if (prefersReducedMotion()) return

    let ctx: gsap.Context | undefined
    const raf = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        bars.forEach((bar, index) => {
          gsap.to(bar, {
            width: `${bar.dataset.progressTarget ?? 0}%`,
            duration: 1.1,
            delay: 0.15 + index * 0.08,
            ease: 'power3.out',
          })
        })
      }, container)
    })

    return () => {
      cancelAnimationFrame(raf)
      ctx?.revert()
    }
  }, [containerRef, ready, dependencyKey])
}

export function useCountUpDecimal(
  value: number,
  enabled = true,
  decimals = 0,
) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    const format = (n: number) =>
      decimals > 0 ? n.toFixed(decimals) : String(Math.round(n))

    el.textContent = format(0)

    if (prefersReducedMotion()) {
      el.textContent = format(value)
      return
    }

    const state = { n: 0 }
    const tween = gsap.to(state, {
      n: value,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = format(state.n)
      },
      onComplete: () => {
        el.textContent = format(value)
      },
    })

    return () => {
      tween.kill()
      el.textContent = format(value)
    }
  }, [value, enabled, decimals])

  return ref
}

export function useRingProgress(
  ringRef: RefObject<SVGCircleElement | null>,
  percent: number,
  enabled = true,
) {
  useEffect(() => {
    const ring = ringRef.current
    if (!ring || !enabled) return

    const radius = Number(ring.getAttribute('r') ?? 52)
    const circumference = 2 * Math.PI * radius
    const target = circumference * (1 - Math.min(100, Math.max(0, percent)) / 100)

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
        duration: 1.4,
        ease: 'power3.out',
        delay: 0.2,
      },
    )

    return () => {
      tween.kill()
      ring.style.strokeDashoffset = `${target}`
    }
  }, [ringRef, percent, enabled])
}
