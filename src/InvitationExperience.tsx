import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { AnimationEvent } from 'react'
import InvitationPage from './InvitationPage'
import oceanBackground from './assets/images/ocean-background.jpg'

export default function InvitationExperience() {
  const [isOpening, setIsOpening] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const openingRef = useRef(false)
  const revealCompletedRef = useRef(false)
  const revealTimerRef = useRef<number | null>(null)
  const invitationRef = useRef<HTMLDivElement>(null)
  const invitationHeaderRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!isRevealed) return
    window.scrollTo({ top: 0, behavior: 'auto' })
    const header = invitationHeaderRef.current
    if (!header) return
    header.focus({ preventScroll: true })
    header.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [isRevealed])

  useEffect(() => () => {
    if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current)
  }, [])

  useEffect(() => {
    if (isRevealed) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isRevealed])

  function openInvitation() {
    if (openingRef.current) return
    openingRef.current = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishReveal()
      return
    }

    setIsOpening(true)
    revealTimerRef.current = window.setTimeout(finishReveal, 1300)
  }

  function finishReveal() {
    if (revealCompletedRef.current) return
    revealCompletedRef.current = true
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current)
      revealTimerRef.current = null
    }
    setIsRevealed(true)
  }

  function onWaveAnimationEnd(event: AnimationEvent<HTMLSpanElement>) {
    if (event.target === event.currentTarget && event.animationName === 'wave-sweep') finishReveal()
  }

  return (
    <div className="invitation-experience">
      <div
        ref={invitationRef}
        className={`experience-content${isRevealed ? ' is-revealed' : ''}`}
        aria-hidden={!isRevealed}
        inert={!isRevealed}
        role="region"
        aria-label="Your invitation"
        tabIndex={-1}
      >
        <InvitationPage effectsActive={isRevealed} invitationHeaderRef={invitationHeaderRef} />
      </div>
      {!isRevealed && (
        <section className="invitation-landing" aria-labelledby="landing-title">
          <div
            className="landing-scene"
            style={{ backgroundImage: `linear-gradient(135deg, rgba(199, 228, 238, .34), rgba(82, 111, 166, .35)), url("${oceanBackground}")` }}
          >
            <span className="landing-bubble landing-bubble-one" aria-hidden="true" />
            <span className="landing-bubble landing-bubble-two" aria-hidden="true" />
            <span className="landing-bubble landing-bubble-three" aria-hidden="true" />
            <span className="landing-bubble landing-bubble-four" aria-hidden="true" />
            <div className="landing-card">
              <p className="landing-eyebrow">A LITTLE SOMETHING SPECIAL</p>
              <h1 id="landing-title">A celebration awaits</h1>
              <p className="landing-copy">A little celebration is waiting beneath the waves.</p>
              <button
                className="landing-button"
                type="button"
                onClick={openInvitation}
                disabled={isOpening}
              >
                You Are Invited
              </button>
              <p className="landing-hint">Click or tap to open your invitation</p>
            </div>
            {isOpening && (
              <div className="wave-reveal is-playing" aria-hidden="true">
                <span className="wave-layer wave-layer--water" />
                <span className="wave-layer wave-layer--foam" onAnimationEnd={onWaveAnimationEnd} />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
