import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'

type BubbleDepth = 'far' | 'mid' | 'near'

interface Bubble {
  id: number
  left: number
  leftUnit: '%' | 'px'
  top: number
  size: number
  speed: number
  duration: number
  depth: BubbleDepth
  rest: number
  temporary: boolean
  burst: boolean
  static: boolean
}

interface BubbleBurst {
  id: number
  count: number
}

interface BubbleFieldProps {
  pageRef: RefObject<HTMLElement | null>
  enabled: boolean
  burst?: BubbleBurst | null
}

interface BubbleStyle extends CSSProperties {
  '--bubble-size': string
  '--bubble-duration': string
  '--bubble-rest': string
}

const MOBILE_QUERY = '(max-width: 600px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, label, .rsvp-card, .hero-content, .detail-card, .gallery, .invite-nav, .invite-footer'

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomInteger(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1))
}

function makeBubble(
  id: number,
  height: number,
  temporary = false,
  position?: { left: number; top: number },
  isStatic = false,
): Bubble {
  const speed = randomBetween(100, 140)
  return {
    id,
    left: position?.left ?? randomBetween(2, 98),
    leftUnit: position ? 'px' : '%',
    top: position?.top ?? randomBetween(0, height),
    size: randomBetween(8, 42),
    speed,
    duration: (height + window.innerHeight) / speed,
    depth: (['far', 'mid', 'near'] as const)[randomInteger(0, 2)],
    rest: randomBetween(8, 85),
    temporary,
    burst: false,
    static: isStatic,
  }
}

export default function BubbleField({ pageRef, enabled, burst = null }: BubbleFieldProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [canvasHeight, setCanvasHeight] = useState(0)
  const bubblesRef = useRef(bubbles)
  const bubbleElements = useRef(new Map<number, HTMLSpanElement>())
  const nextBubbleId = useRef(0)
  const initialBurstLaunched = useRef(false)
  const handledBurstId = useRef<number | null>(null)

  bubblesRef.current = bubbles

  const updateBubbles = useCallback((next: Bubble[]) => {
    bubblesRef.current = next
    setBubbles(next)
  }, [])

  const replacePool = useCallback((isReducedMotion: boolean) => {
    const page = pageRef.current
    if (!page) return
    const height = Math.max(page.offsetHeight, window.innerHeight)
    setCanvasHeight(height)
    const mobile = window.matchMedia(MOBILE_QUERY).matches
    const count = isReducedMotion ? 4 : Math.max(4, Math.round((mobile ? 20 : 30) * 0.8))
    updateBubbles(Array.from({ length: count }, () =>
      makeBubble(nextBubbleId.current++, height, false, undefined, isReducedMotion)))
  }, [pageRef, updateBubbles])

  useEffect(() => {
    if (!enabled) {
      updateBubbles([])
      initialBurstLaunched.current = false
      handledBurstId.current = null
      return
    }

    const page = pageRef.current
    if (!page) return

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)
    const mobile = window.matchMedia(MOBILE_QUERY)
    const measure = () => {
      const currentPage = pageRef.current
      if (!currentPage) return
      // offsetHeight excludes this absolute layer, allowing the page to shrink on resize.
      const height = Math.max(currentPage.offsetHeight, window.innerHeight)
      setCanvasHeight(height)
      updateBubbles(bubblesRef.current.map((bubble) => ({
        ...bubble,
        duration: (height + window.innerHeight) / bubble.speed,
      })))
    }
    const rebuild = () => replacePool(reducedMotion.matches)
    const observer = new ResizeObserver(measure)
    observer.observe(page)
    window.addEventListener('resize', measure, { passive: true })
    reducedMotion.addEventListener('change', rebuild)
    mobile.addEventListener('change', rebuild)
    measure()
    rebuild()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      reducedMotion.removeEventListener('change', rebuild)
      mobile.removeEventListener('change', rebuild)
    }
  }, [enabled, pageRef, replacePool, updateBubbles])

  const launchBurst = useCallback((requestedCount: number) => {
    const page = pageRef.current
    if (!page || window.matchMedia(REDUCED_MOTION_QUERY).matches) return

    const mobile = window.matchMedia(MOBILE_QUERY).matches
    const limit = mobile ? 20 : 30
    const height = Math.max(page.offsetHeight, window.innerHeight)
    const current = bubblesRef.current.filter((bubble) => !bubble.temporary)
    const count = Math.min(Math.max(1, requestedCount), limit)
    const burstPool = current.slice(0, count)
    const extras = Math.max(0, Math.min(count - burstPool.length, limit - burstPool.length))
    const pool = [
      ...burstPool.map((bubble) => ({
        ...bubble,
        left: randomBetween(2, Math.max(2, page.clientWidth - bubble.size)),
        leftUnit: 'px' as const,
        top: height + 15,
        burst: true,
      })),
      ...current.slice(burstPool.length),
      ...Array.from({ length: extras }, () => ({
        ...makeBubble(nextBubbleId.current++, height, true, {
          left: randomBetween(2, Math.max(2, page.clientWidth - 20)),
          top: height + 15,
        }),
        burst: true,
      })),
    ]
    updateBubbles(pool)
  }, [pageRef, updateBubbles])

  useEffect(() => {
    if (!enabled || initialBurstLaunched.current || bubbles.length === 0) return
    initialBurstLaunched.current = true
    launchBurst(12)
  }, [bubbles.length, enabled, launchBurst])

  useEffect(() => {
    if (!enabled || !burst || handledBurstId.current === burst.id || bubbles.length === 0) return
    handledBurstId.current = burst.id
    launchBurst(burst.count)
  }, [burst, bubbles.length, enabled, launchBurst])

  useEffect(() => {
    if (!enabled) return
    const page = pageRef.current
    if (!page) return

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)
    let sourceTimer = 0
    let dodgeFrame = 0
    let pointerX = 0
    let pointerY = 0

    const addTemporaryBubbles = (positions: Array<{ left: number; top: number }>) => {
      if (reducedMotion.matches) return
      const mobile = window.matchMedia(MOBILE_QUERY).matches
      const limit = mobile ? 20 : 30
      const current = bubblesRef.current
      const height = Math.max(page.offsetHeight, window.innerHeight)
      const extras = positions.slice(0, Math.max(0, limit - current.length)).map((position) =>
        makeBubble(nextBubbleId.current++, height, true, position))
      if (extras.length) updateBubbles([...current, ...extras])
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (reducedMotion.matches || dodgeFrame) return
      dodgeFrame = window.requestAnimationFrame(() => {
        for (const [id, bubble] of bubbleElements.current) {
          if (bubblesRef.current.find((item) => item.id === id)?.burst) continue
          const rect = bubble.getBoundingClientRect()
          const dx = rect.left + rect.width / 2 - pointerX
          const dy = rect.top + rect.height / 2 - pointerY
          const distance = Math.hypot(dx, dy)
          if (distance < 90) {
            const direction = dx === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(dx)
            const strength = (1 - distance / 90) * 28
            bubble.style.setProperty('--dodge-x', `${direction * strength}px`)
            bubble.style.setProperty('--dodge-y', `${-Math.max(0, (1 - distance / 90) * 12)}px`)
          } else {
            bubble.style.setProperty('--dodge-x', '0px')
            bubble.style.setProperty('--dodge-y', '0px')
          }
        }
        dodgeFrame = 0
      })
    }

    const resetDodges = () => {
      for (const bubble of bubbleElements.current.values()) {
        bubble.style.setProperty('--dodge-x', '0px')
        bubble.style.setProperty('--dodge-y', '0px')
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || event.target.closest(INTERACTIVE_SELECTOR)) return
      if (!event.target.matches('.invitation, .welcome-section, .details-section, .rsvp-section')) return
      const rect = page.getBoundingClientRect()
      const count = randomInteger(3, 5)
      addTemporaryBubbles(Array.from({ length: count }, () => ({
        left: event.clientX - rect.left + randomBetween(-28, 28),
        top: event.clientY - rect.top + randomBetween(-12, 12),
      })))
    }

    const scheduleSourceBubble = () => {
      if (reducedMotion.matches || document.hidden) return
      sourceTimer = window.setTimeout(() => {
        const currentPage = pageRef.current
        if (currentPage && !document.hidden) {
          addTemporaryBubbles([{
            left: currentPage.clientWidth * randomBetween(0.86, 0.96),
            top: Math.max(0, currentPage.offsetHeight - 70),
          }])
        }
        scheduleSourceBubble()
      }, randomBetween(4000, 6000))
    }

    const onVisibilityChange = () => {
      const field = page.querySelector('.bubble-field')
      field?.classList.toggle('is-paused', document.hidden)
      if (document.hidden) {
        window.clearTimeout(sourceTimer)
        if (dodgeFrame) window.cancelAnimationFrame(dodgeFrame)
        dodgeFrame = 0
      } else {
        scheduleSourceBubble()
      }
    }

    const onPointerLeave = () => resetDodges()
    page.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibilityChange)
    scheduleSourceBubble()

    return () => {
      page.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.clearTimeout(sourceTimer)
      if (dodgeFrame) window.cancelAnimationFrame(dodgeFrame)
    }
  }, [enabled, pageRef, updateBubbles])

  function onPoolBubbleIteration(id: number) {
    const existing = bubblesRef.current.find((bubble) => bubble.id === id)
    const page = pageRef.current
    if (!existing || existing.temporary || existing.burst || !page) return
    const height = Math.max(page.offsetHeight, window.innerHeight)
    const recycled = { ...existing, left: randomBetween(2, 98), leftUnit: '%' as const, top: height + 15 }
    updateBubbles(bubblesRef.current.map((bubble) => bubble.id === id ? recycled : bubble))
  }

  function onPoolBubbleEnd(id: number) {
    const existing = bubblesRef.current.find((bubble) => bubble.id === id)
    const page = pageRef.current
    if (!existing || !page) return
    if (existing.temporary) {
      updateBubbles(bubblesRef.current.filter((bubble) => bubble.id !== id))
    } else if (existing.burst) {
      const height = Math.max(page.offsetHeight, window.innerHeight)
      const recycled = makeBubble(id, height)
      updateBubbles(bubblesRef.current.map((bubble) => bubble.id === id ? recycled : bubble))
    }
  }

  if (!enabled || bubbles.length === 0) return null

  return (
    <div
      className={`bubble-field${typeof document !== 'undefined' && document.hidden ? ' is-paused' : ''}`}
      aria-hidden="true"
      style={{ height: `${canvasHeight}px`, '--bubble-rise-distance': `${canvasHeight + window.innerHeight}px` } as CSSProperties}
    >
      {bubbles.map((bubble) => {
        const style = {
          left: `${bubble.left}${bubble.leftUnit}`,
          top: `${bubble.top}px`,
          '--bubble-size': `${bubble.size}px`,
          '--bubble-duration': `${bubble.duration}s`,
          '--bubble-rest': `${bubble.rest}%`,
        } as BubbleStyle
        return (
          <span
            key={bubble.id}
            ref={(element) => {
              if (element) bubbleElements.current.set(bubble.id, element)
              else bubbleElements.current.delete(bubble.id)
            }}
            className={`bubble${bubble.temporary ? ' is-extra' : ''}${bubble.burst ? ' is-burst' : ''}${bubble.static ? ' is-static' : ''}`}
            data-depth={bubble.depth}
            style={style}
            onAnimationIteration={() => onPoolBubbleIteration(bubble.id)}
            onAnimationEnd={() => onPoolBubbleEnd(bubble.id)}
          />
        )
      })}
    </div>
  )
}
