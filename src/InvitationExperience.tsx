import { siteConfig } from './siteConfig'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { AnimationEvent } from 'react'
import InvitationPage from './InvitationPage'
import type { PublicEvent } from './types'
import { prettyDate } from './eventPresentation'
import landingWhale from './assets/images/underwater/whale-hero.webp'

export default function InvitationExperience() {
  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [loadError, setLoadError] = useState('')
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
    if (openingRef.current || !event) return
    openingRef.current = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishReveal()
      return
    }

    setIsOpening(true)
    revealTimerRef.current = window.setTimeout(finishReveal, window.matchMedia('(max-width: 600px)').matches ? 1800 : 1300)
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
        <InvitationPage onEventLoaded={setEvent} onLoadError={setLoadError} effectsActive={isRevealed} invitationHeaderRef={invitationHeaderRef} />
      </div>
      {!isRevealed && (
        <section className="invitation-landing ocean-landing" aria-labelledby="landing-title">
          <div className="landing-scene">
            <p className="landing-wordmark"><span className="landing-brand">{siteConfig.name}</span><span className="landing-wordmark-note">A LITTLE OCEAN ADVENTURE</span></p>
            <span className="landing-bubble landing-bubble-one" aria-hidden="true" />
            <span className="landing-bubble landing-bubble-two" aria-hidden="true" />
            <span className="landing-bubble landing-bubble-three" aria-hidden="true" />
            <span className="landing-bubble landing-bubble-four" aria-hidden="true" />
            <div className="landing-stage">
            <div className="landing-art" aria-hidden="true">
              <span className="landing-art-orbit" />
              <img src={landingWhale} alt="" width={1568} height={1003} decoding="async" fetchPriority="high" />
              <p className="landing-art-note">Little moments. Big memories.</p>
            </div>
            <div className="landing-card">
              <span className="landing-card-accent" aria-hidden="true">✦</span>
              <p className="landing-eyebrow">A LITTLE SOMETHING SPECIAL</p>
              <h1 id="landing-title">{event ? event.landing_title?.trim() || siteConfig.landingTitle : (loadError ? 'Invitation unavailable' : 'Loading your invitation...')}</h1>
              {event ? <><p className="landing-copy">{event.landing_subtitle?.trim() || siteConfig.landingSubtitle}</p><p className="landing-copy">{prettyDate(event.event_date)}</p><p className="landing-copy">{event.occasion_labels.join(' & ')}</p></>
                : <p className="landing-copy" role="status">{loadError || 'Preparing your celebration details.'}</p>}
              {loadError && <button type="button" className="landing-button" onClick={() => window.location.reload()}>Try again</button>}
              <button
                className="landing-button"
                type="button"
                onClick={openInvitation}
                disabled={isOpening || !event}
                aria-describedby="landing-hint"
              >
                You Are Invited <span className="landing-button-arrow" aria-hidden="true">↗</span>
              </button>
              <p className="landing-hint" id="landing-hint">Click or tap to open your invitation</p>
              <p className="landing-opening-status" role="status">{isOpening ? 'Opening your invitation…' : ''}</p>
            </div>
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
