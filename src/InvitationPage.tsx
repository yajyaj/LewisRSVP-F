import { siteConfig } from './siteConfig'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import { api, ApiError } from './api'
import BubbleField from './BubbleField'
import BabyPhotoCarousel from './components/BabyPhotoCarousel'
import EventHero from './components/EventHero'
import EventCountdown from './components/EventCountdown'
import EventWelcome from './components/EventWelcome'
import EventDetails from './components/EventDetails'
import { prettyDate, eventStops, deadlineDate } from './eventPresentation'
import RsvpSuccess from './components/RsvpSuccess'
import babyWaving from './assets/images/underwater/baby-waving.webp'
import type { BabyPhoto } from './components/BabyPhotoCarousel'
import babyBday from './assets/carousel/1st_birthday_&_friends.png'
import babyDestiny from './assets/carousel/destiny_baby.png'
import babySeaHorse from './assets/carousel/sea_horse_baby.png'
import babyStarFish from './assets/carousel/star_fish_baby.png'
import type { EventProject, PublicEvent } from './types'

interface InvitationPageProps {
  onEventLoaded?: (event: PublicEvent | null) => void
  onLoadError?: (error: string) => void
  previewEvent?: EventProject
  onClosePreview?: () => void
  effectsActive?: boolean
  invitationHeaderRef?: RefObject<HTMLElement | null>
}

const BABY_PHOTOS: BabyPhoto[] = [
  { src: babyBday, alt: 'Illustration of a baby celebrating with a cake and ocean friends' },
  { src: babyDestiny, alt: 'Illustration of a baby riding a friendly whale' },
  { src: babySeaHorse, alt: 'Illustration of a baby meeting a seahorse' },
  { src: babyStarFish, alt: 'Illustration of a baby hugging a starfish' },
]

export default function InvitationPage({ previewEvent, onClosePreview, effectsActive = false, invitationHeaderRef, onEventLoaded, onLoadError }: InvitationPageProps) {
  const params = new URLSearchParams(window.location.search)
  const invitationToken = params.get('invite')
  const slug = decodeURIComponent(window.location.pathname.slice(1))
  const preview = Boolean(previewEvent)
  const [event, setEvent] = useState<PublicEvent | null>(previewEvent ? {
    ...previewEvent,
    occasion_labels: previewEvent.occasion_labels.map((label) => label.label),
  } : null)
  const [guestName, setGuestName] = useState('')
  const [loading, setLoading] = useState(!preview)
  const [pageError, setPageError] = useState('')
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [success, setSuccess] = useState('')
  const [attendance, setAttendance] = useState<'attending' | 'declined'>('attending')
  const [submitting, setSubmitting] = useState(false)
  const [bubbleBurst, setBubbleBurst] = useState<{ id: number; count: number } | null>(null)
  const bubbleBurstId = useRef(0)
  const pageRef = useRef<HTMLElement>(null)
  const submissionPending = useRef(false)
  const responseIdentity = useRef<{ slug: string; key: string } | null>(null)
  const errorSummary = useRef<HTMLParagraphElement>(null)

  useEffect(() => { if (formError) errorSummary.current?.focus({ preventScroll: true }) }, [formError])

  useEffect(() => {
    if (previewEvent) return
    const controller = new AbortController()

    const load = async () => {
      try {
        const result = invitationToken
          ? await api<{ event: PublicEvent; guest_name: string }>(`/api/invitations/${encodeURIComponent(invitationToken)}`, { signal: controller.signal })
          : await api<{ event: PublicEvent }>(slug ? `/api/events/${encodeURIComponent(slug)}` : '/api/website-event', { signal: controller.signal })
        setEvent(result.event)
        if ('guest_name' in result && typeof result.guest_name === 'string') setGuestName(result.guest_name)
      } catch (error) {
        if (controller.signal.aborted) return
        setPageError(error instanceof ApiError && error.status === 404
          ? 'This invitation is unavailable. It may be unpublished, expired, or revoked.'
          : error instanceof Error ? error.message : 'We could not load this invitation.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [invitationToken, previewEvent, slug])

  useEffect(() => { onEventLoaded?.(event) }, [event, onEventLoaded])
  useEffect(() => { onLoadError?.(pageError) }, [pageError, onLoadError])

  useLayoutEffect(() => {
    if (!effectsActive || !event || !invitationHeaderRef?.current) return

    window.scrollTo({ top: 0, behavior: 'auto' })
    const header = invitationHeaderRef.current
    header.focus({ preventScroll: true })
    header.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [effectsActive, event, invitationHeaderRef])

  useEffect(() => {
    if (!effectsActive || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const page = pageRef.current
    if (!page || typeof IntersectionObserver === 'undefined') return

    const sections = Array.from(page.querySelectorAll<HTMLElement>(':scope > section'))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12 })

    sections.forEach((section) => observer.observe(section))
    page.classList.add('has-scroll-reveal')

    return () => {
      observer.disconnect()
      page.classList.remove('has-scroll-reveal')
      sections.forEach((section) => section.classList.remove('is-visible'))
    }
  }, [effectsActive, event])

  async function submitRsvp(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault()
    if (submissionPending.current) return
    setFormError('')
    setFieldErrors({})
    setSuccess('')

    if (preview || !event) {
      setFormError('This preview is not connected to a live RSVP. Open a published invitation link to respond.')
      return
    }

    const formElement = eventForm.currentTarget
    const form = new FormData(formElement)
    let responseKey: string | undefined
    if (!invitationToken) {
      let storedKey: string | null = null
      try { storedKey = localStorage.getItem(`rsvp-response:${event.public_slug}`) } catch { /* Keep a stable in-memory identity if storage is unavailable. */ }
      responseKey = storedKey || (responseIdentity.current?.slug === event.public_slug ? responseIdentity.current.key : crypto.randomUUID())
      responseIdentity.current = { slug: event.public_slug, key: responseKey }
    }
    const payload = {
      full_name: String(form.get('full_name') || '').trim(),
      attendance_status: attendance,
      party_size: attendance === 'attending' ? 1 : 0,
      email: String(form.get('email') || '').trim() || null,
      phone: String(form.get('phone') || '').trim() || null,
      additional_guest_names: [],
      dietary_or_accessibility_notes: String(form.get('dietary_or_accessibility_notes') || '').trim() || null,
      message: String(form.get('message') || '').trim() || null,
      ...(responseKey ? { response_key: responseKey } : {}),
    }

    submissionPending.current = true
    setSubmitting(true)
    try {
      const path = invitationToken
        ? `/api/invitations/${encodeURIComponent(invitationToken)}/rsvp`
        : `/api/events/${encodeURIComponent(event.public_slug)}/rsvps`
      const result = await api<{ message: string }>(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (responseKey) {
        try { localStorage.setItem(`rsvp-response:${event.public_slug}`, responseKey) } catch { /* Storage restrictions must not turn a confirmed response into failure. */ }
      }
      setSuccess(result.message)
      setBubbleBurst({ id: ++bubbleBurstId.current, count: attendance === 'attending' ? 35 : 3 })
      formElement.reset()
      setAttendance('attending')
    } catch (error) {
      if (error instanceof ApiError) {
        const groupedErrors: Record<string, string[]> = {}
        for (const [key, messages] of Object.entries(error.errors)) {
          const field = key.split('.')[0]
          groupedErrors[field] = [...(groupedErrors[field] || []), ...messages]
        }
        setFieldErrors(groupedErrors)
        const firstError = Object.values(error.errors).flat()[0]
        setFormError(firstError || error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'We could not save your RSVP. Please try again.')
      }
    } finally {
      submissionPending.current = false
      setSubmitting(false)
    }
  }

  if (loading) {
    return <main className="loading-page"><span className="spinner" />Loading your invitation…</main>
  }
  if (!event) {
    return <main className="message-page"><a className="brand" href="/">{siteConfig.name}</a><h1>Invitation not found</h1><p>{pageError}</p></main>
  }

  const stops = eventStops(event)
  const fieldAttributes = (name: string) => ({
    'aria-invalid': fieldErrors[name]?.length ? true as const : undefined,
    'aria-describedby': fieldErrors[name]?.length ? `rsvp-${name}-error` : undefined,
  })
  const fieldError = (name: string) => fieldErrors[name]?.length
    ? <span className="rsvp-field-error" id={`rsvp-${name}-error`}>{fieldErrors[name].join(' ')}</span> : null

  return (
    <main ref={pageRef} className={`invitation min-h-screen theme-${event.theme}`}>
      <BubbleField pageRef={pageRef} enabled={effectsActive && !preview} burst={bubbleBurst} />
      <nav ref={invitationHeaderRef} className="invite-nav flex items-center justify-between" tabIndex={-1}>
        <a className="brand" href="/">{siteConfig.name}</a>
        <div className="invite-section-links">
          {/* <a href="#welcome-heading">Our little one</a> */}
          <a href="#details-heading">Details</a>
          <a href="#baby-carousel-heading">Images</a>
          <a href="#rsvp">RSVP</a>
        </div>
        {preview && onClosePreview
          ? <button className="preview-close" type="button" onClick={onClosePreview}>← Back to dashboard</button>
          : <span className="nav-note">YOU ARE INVITED</span>}
      </nav>
      <EventHero event={event} formattedDate={prettyDate(event.event_date)} />
      <EventCountdown event={event} />

      <EventWelcome message={event.welcome_message} />
      <EventDetails event={event} date={prettyDate(event.event_date)} stops={stops} />
      <BabyPhotoCarousel photos={BABY_PHOTOS} illustrations />


      <section className="rsvp-section ocean-rsvp-section" id="rsvp" tabIndex={-1} aria-labelledby="rsvp-heading">
        <div className="ocean-rsvp-layout">
        <div className="ocean-rsvp-art" aria-hidden="true">
          <img src={babyWaving} alt="" width={1254} height={1254} loading="lazy" decoding="async" />
        </div>
        <div className="rsvp-card">
          <p className="eyebrow">WE HOPE YOU CAN JOIN US</p>
          <h2 id="rsvp-heading" tabIndex={-1}>Will you be there?</h2>
          {event.rsvp_deadline && <p className="deadline">Please reply by {deadlineDate(event)}.</p>}
          {preview && <p className="sample-notice">Preview mode - RSVPs are disabled.</p>}
          {success ? (
            <RsvpSuccess message={success} onChange={() => setSuccess('')} />
          ) : (
            <form className="rsvp-form" onSubmit={submitRsvp} aria-busy={submitting}>
              <label><span>Full name <span className="required-note">(required)</span></span><input {...fieldAttributes('full_name')} name="full_name" autoComplete="name" required maxLength={255} value={guestName} onChange={(eventInput) => setGuestName(eventInput.target.value)} />{fieldError('full_name')}</label>
              <fieldset className="attendance-options" {...fieldAttributes('attendance_status')}>
                <legend>Your reply</legend>
                <label className={`choice ${attendance === 'attending' ? 'selected' : ''}`}><input type="radio" name="attendance" checked={attendance === 'attending'} onChange={() => setAttendance('attending')} /><span>Joyfully accepts</span></label>
                <label className={`choice ${attendance === 'declined' ? 'selected' : ''}`}><input type="radio" name="attendance" checked={attendance === 'declined'} onChange={() => setAttendance('declined')} /><span>Regretfully declines</span></label>
              </fieldset>
              {fieldError('attendance_status')}
              {attendance === 'attending' && (
                <label>Number attending
                  <input {...fieldAttributes('party_size')} name="party_size" value="1 guest" readOnly />
                  {fieldError('party_size')}
                </label>
              )}
              <div className="contact-row">
                <label>Email <span className="optional">(optional)</span><input {...fieldAttributes('email')} type="email" name="email" autoComplete="email" maxLength={255} />{fieldError('email')}</label>
                <label>Phone <span className="optional">(optional)</span><input {...fieldAttributes('phone')} type="tel" name="phone" autoComplete="tel" maxLength={40} />{fieldError('phone')}</label>
              </div>
              {formError && <p ref={errorSummary} className="form-error" role="alert" tabIndex={-1}>{formError}</p>}
              <button className="button button-dark" type="submit" disabled={submitting || preview}>{submitting ? 'Saving your reply…' : 'Send my RSVP'} <span aria-hidden="true">↗</span></button>
            </form>
          )}
        </div>
        </div>
      </section>
      <footer className="invite-footer"><a className="brand" href="/">{siteConfig.name}</a><p>Made with care, for moments that matter.</p><a href="#rsvp">Reply to invitation ↑</a></footer>
    </main>
  )
}
