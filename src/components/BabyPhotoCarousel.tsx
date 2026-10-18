import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import BabyPhotoLightbox from './BabyPhotoLightbox'
import { usePhotoTransition } from './usePhotoTransition'

export interface BabyPhoto {
  src: string
  alt: string
  focalPosition?: string
}

interface BabyPhotoCarouselProps {
  photos: readonly BabyPhoto[]
  illustrations?: boolean
}

const AUTOPLAY_DELAY = 5000
const MANUAL_PAUSE_DELAY = 5000

export default function BabyPhotoCarousel({ photos, illustrations = false }: BabyPhotoCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const autoplayButton = useRef<HTMLButtonElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isInView, setIsInView] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const photoTrigger = useRef<HTMLButtonElement>(null)
  const suppressPhotoClick = useRef(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isSwiping, setIsSwiping] = useState(false)
  const [isDocumentHidden, setIsDocumentHidden] = useState(() => document.hidden)
  const [manualPauseKey, setManualPauseKey] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const lastInteractionAt = useRef(0)
  const swipeStartX = useRef<number | null>(null)
  const { selectedIndex, outgoing, error, announcement, requestedIndex, select, selectInViewer, finishTransition } = usePhotoTransition(photos, prefersReducedMotion, isViewerOpen)

  useEffect(() => {
    const element = carouselRef.current
    if (!element) return
    if (typeof IntersectionObserver === 'undefined') { setIsInView(true); return }
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: .1 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [photos.length])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    const updateVisibility = () => setIsDocumentHidden(document.hidden)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  useEffect(() => {
    if (photos.length === 0) setIsViewerOpen(false)
  }, [photos.length])

  useEffect(() => {
    if (
      photos.length <= 1
      || !isPlaying
      || !isInView
      || isViewerOpen
      || prefersReducedMotion
      || isHovered
      || isFocused
      || isSwiping
      || isDocumentHidden
    ) return

    const timer = window.setInterval(() => {
      if (Date.now() - lastInteractionAt.current < MANUAL_PAUSE_DELAY) return
      select(requestedIndex.current + 1, false)
    }, AUTOPLAY_DELAY)

    return () => window.clearInterval(timer)
  }, [isDocumentHidden, isFocused, isHovered, isSwiping, isViewerOpen, isPlaying, isInView, manualPauseKey, photos.length, prefersReducedMotion, select, requestedIndex])

  function recordInteraction() {
    lastInteractionAt.current = Date.now()
    setManualPauseKey((current) => current + 1)
  }

  function showPhoto(nextIndex: number) {
    if (!photos.length) return
    recordInteraction()
    select(nextIndex)
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    suppressPhotoClick.current = false
    if (event.pointerType !== 'touch') return
    swipeStartX.current = event.clientX
    recordInteraction()
    setIsSwiping(true)
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (swipeStartX.current === null) return
    const distance = event.clientX - swipeStartX.current
    suppressPhotoClick.current = suppressPhotoClick.current || Math.abs(distance) > 10
    swipeStartX.current = null
    setIsSwiping(false)
    if (Math.abs(distance) >= 48) {
      showPhoto(requestedIndex.current + (distance < 0 ? 1 : -1))
    } else {
      recordInteraction()
      if (!suppressPhotoClick.current) {
        // Touch browsers may omit the compatibility click after a captured swipe.
        suppressPhotoClick.current = true
        event.preventDefault()
        setIsViewerOpen(true)
      }
    }
  }

  if (photos.length === 0) {
    return (
      <section className="baby-carousel-section" aria-labelledby="baby-carousel-heading">
        <div className="baby-carousel-heading">
          <p className="eyebrow">LITTLE MOMENTS, BIG LOVE</p>
          <h2 id="baby-carousel-heading">Our Little Ocean Star</h2>
          <p>We&rsquo;re making a collection of memories to share with you.</p>
        </div>
        <div className="baby-carousel-empty">
          <span className="baby-carousel-empty-orbit" aria-hidden="true" />
          <span className="baby-carousel-empty-shell" aria-hidden="true">♡</span>
          <p className="baby-carousel-empty-title">Sweet memories coming soon</p>
          <p>Our little ocean star&rsquo;s story is just beginning.</p>
        </div>
      </section>
    )
  }

  const activePhoto = photos[selectedIndex]

  return (
    <section className="baby-carousel-section" aria-labelledby="baby-carousel-heading">
      <div className="baby-carousel-heading">
        <p className="eyebrow">LITTLE MOMENTS, BIG LOVE</p>
        <h2 id="baby-carousel-heading">Our Little Ocean Star</h2>
        <p>{illustrations ? 'A little ocean adventure, told through illustrations.' : 'A few treasured moments from our growing story.'}</p>
      </div>
      <div
        ref={carouselRef}
        className="baby-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label={illustrations ? 'Ocean birthday illustrations' : 'Baby photos'}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={(event) => {
          const onPlayControl = autoplayButton.current?.contains(event.target as Node) ?? false
          setIsFocused(!onPlayControl)
          if (!onPlayControl) setIsPlaying(false)
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false)
        }}
        onKeyDown={(event) => {
          if (photos.length <= 1) return
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            showPhoto(requestedIndex.current - 1)
          } else if (event.key === 'ArrowRight') {
            event.preventDefault()
            showPhoto(requestedIndex.current + 1)
          } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            showPhoto(event.key === 'Home' ? 0 : photos.length - 1)
          }
        }}
      >
        <div className="baby-carousel-frame">
          <div className="baby-carousel-slide" role="group" aria-roledescription="slide" aria-label={`${selectedIndex + 1} of ${photos.length}`}>
            <button
              ref={photoTrigger}
              type="button"
              className="baby-carousel-photo-button"
              aria-label={`Open full image: ${activePhoto.alt}`}
              aria-haspopup="dialog"
              onPointerDown={handlePointerDown}
              onPointerMove={(event) => {
                if (swipeStartX.current !== null && Math.abs(event.clientX - swipeStartX.current) > 10) {
                  event.currentTarget.setPointerCapture(event.pointerId)
                  suppressPhotoClick.current = true
                }
              }}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => {
                suppressPhotoClick.current = true
                swipeStartX.current = null
                setIsSwiping(false)
              }}
              onClick={(event) => {
                if (event.detail !== 0 && suppressPhotoClick.current) return
                recordInteraction()
                setIsViewerOpen(true)
              }}
            >
              {outgoing && <img className="baby-carousel-outgoing" src={outgoing.src} alt="" aria-hidden="true" draggable={false} />}
              <img
                key={activePhoto.src}
                className={outgoing ? 'baby-carousel-incoming' : undefined}
                src={activePhoto.src}
                alt={activePhoto.alt}
                loading="lazy"
                decoding="async"
                draggable={false}
                onAnimationEnd={(event) => {
                  if (event.animationName === 'baby-photo-crossfade-in') finishTransition()
                }}
              />
              <span className="baby-carousel-photo-hint" aria-hidden="true">View full image</span>
            </button>
          </div>
          {photos.length > 1 && (
            <>
              <button
                className="baby-carousel-arrow baby-carousel-previous"
                type="button"
                aria-label="Show previous baby photo"
                onClick={() => showPhoto(requestedIndex.current - 1)}
              >←</button>
              <button
                className="baby-carousel-arrow baby-carousel-next"
                type="button"
                aria-label="Show next baby photo"
                onClick={() => showPhoto(requestedIndex.current + 1)}
              >→</button>
            </>
          )}
        </div>
        {photos.length > 1 && (
          <div className="baby-carousel-pagination" aria-label="Choose a baby photo">
            {photos.map((photo, index) => (
              <button
                key={photo.src}
                className={`baby-carousel-dot${selectedIndex === index ? ' is-active' : ''}`}
                type="button"
                aria-label={`Show photo ${index + 1} of ${photos.length}`}
                aria-current={selectedIndex === index ? 'true' : undefined}
                onClick={() => showPhoto(index)}
              />
            ))}
          </div>
        )}
        <div className="baby-carousel-controls">
          <p>{illustrations ? 'Illustration' : 'Photo'} {selectedIndex + 1} of {photos.length}</p>
          {photos.length > 1 && <button ref={autoplayButton} type="button" className="carousel-play-control"
            disabled={prefersReducedMotion} onClick={() => { recordInteraction(); setIsFocused(false); setIsPlaying((current) => !current) }}>
            {prefersReducedMotion ? 'Automatic rotation off — reduced motion' : isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          </button>}
        </div>
        <span className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</span>
        {error && <p className="baby-carousel-error" role="status">{error} <button type="button" onClick={() => showPhoto(requestedIndex.current)}>Retry</button></p>}
      </div>
      {isViewerOpen && (
        <BabyPhotoLightbox
          photos={photos}
          selectedIndex={selectedIndex}
          onSelect={(index) => {
            recordInteraction()
            selectInViewer(index)
          }}
          returnFocusRef={photoTrigger}
          onClose={() => {
            recordInteraction()
            setIsViewerOpen(false)
          }}
        />
      )}
    </section>
  )
}
