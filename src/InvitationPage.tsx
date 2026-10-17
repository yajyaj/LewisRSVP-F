import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import { api, ApiError } from './api'
import BubbleField from './BubbleField'
import blueWhale from './assets/images/bluewhale.png'
import crab from './assets/images/crab.png'
import greenTurtle from './assets/images/green-turtle.png'
import jellyFish from './assets/images/jelly-fish.png'
import type { EventProject, PublicEvent } from './types'

interface InvitationPageProps {
  previewEvent?: EventProject
  onClosePreview?: () => void
  effectsActive?: boolean
  invitationHeaderRef?: RefObject<HTMLElement | null>
}

const sampleEvent: PublicEvent = {
  id: 0,
  public_slug: 'sample',
  combined_title: 'A little wonder, a whole lot of love',
  welcome_message: 'With full hearts, we invite you to celebrate a very special day with us.',
  event_date: '2027-06-12',
  start_time: '11:30',
  end_time: '15:00',
  timezone: 'Asia/Manila',
  venue_name: 'The Garden House',
  venue_address: 'Makati City, Philippines',
  map_url: null,
  rsvp_deadline: null,
  cover_image_url: null,
  gallery_urls: [],
  theme: 'sage',
  allow_plus_ones: true,
  max_party_size: 4,
  occasion_labels: ['Christening', 'First Birthday'],
}

const COUNTDOWN_TARGET = new Date(Date.UTC(2027, 0, 2, 0, 0, 0))

function prettyDate(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

function prettyTime(time: string | null): string | null {
  if (!time) return null
  const [hours, minutes] = time.split(':').map(Number)
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2020, 0, 1, hours, minutes)))
}

function getCountdownParts(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000))
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isComplete: totalSeconds === 0,
  }
}

export default function InvitationPage({ previewEvent, onClosePreview, effectsActive = false, invitationHeaderRef }: InvitationPageProps) {
  const params = new URLSearchParams(window.location.search)
  const invitationToken = params.get('invite')
  const slug = decodeURIComponent(window.location.pathname.slice(1))
  const sample = !previewEvent && !invitationToken && slug === ''
  const preview = Boolean(previewEvent)
  const [event, setEvent] = useState<PublicEvent | null>(previewEvent ? {
    ...previewEvent,
    occasion_labels: previewEvent.occasion_labels.map((label) => label.label),
  } : sample ? sampleEvent : null)
  const [guestName, setGuestName] = useState('')
  const [loading, setLoading] = useState(!sample && !preview)
  const [pageError, setPageError] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [attendance, setAttendance] = useState<'attending' | 'declined'>('attending')
  const [partySize, setPartySize] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [bubbleBurst, setBubbleBurst] = useState<{ id: number; count: number } | null>(null)
  const [timeLeftMs, setTimeLeftMs] = useState(() => Math.max(0, COUNTDOWN_TARGET.getTime() - Date.now()))
  const bubbleBurstId = useRef(0)
  const pageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeftMs(Math.max(0, COUNTDOWN_TARGET.getTime() - Date.now()))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (sample || previewEvent) return

    const load = async () => {
      try {
        const result = invitationToken
          ? await api<{ event: PublicEvent; guest_name: string }>(`/api/invitations/${encodeURIComponent(invitationToken)}`)
          : await api<{ event: PublicEvent }>(`/api/events/${encodeURIComponent(slug)}`)
        setEvent(result.event)
        if ('guest_name' in result && typeof result.guest_name === 'string') setGuestName(result.guest_name)
      } catch (error) {
        setPageError(error instanceof ApiError && error.status === 404
          ? 'This invitation is unavailable. It may be unpublished, expired, or revoked.'
          : error instanceof Error ? error.message : 'We could not load this invitation.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [invitationToken, previewEvent, sample, slug])

  useLayoutEffect(() => {
    if (!effectsActive || !event || !invitationHeaderRef?.current) return

    window.scrollTo({ top: 0, behavior: 'auto' })
    const header = invitationHeaderRef.current
    header.focus({ preventScroll: true })
    header.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [effectsActive, event, invitationHeaderRef])

  async function submitRsvp(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault()
    setFormError('')
    setSuccess('')

    if (sample || preview || !event) {
      setFormError('This preview is not connected to a live RSVP. Open a published invitation link to respond.')
      return
    }

    const formElement = eventForm.currentTarget
    const form = new FormData(formElement)
    const responseKey = invitationToken
      ? undefined
      : localStorage.getItem(`rsvp-response:${event.public_slug}`) || crypto.randomUUID()
    const additionalNames = String(form.get('additional_guest_names') || '')
      .split('\n')
      .map((name) => name.trim())
      .filter(Boolean)
    const payload = {
      full_name: String(form.get('full_name') || '').trim(),
      attendance_status: attendance,
      party_size: attendance === 'attending' ? partySize : 0,
      email: String(form.get('email') || '').trim() || null,
      phone: String(form.get('phone') || '').trim() || null,
      additional_guest_names: additionalNames,
      dietary_or_accessibility_notes: String(form.get('dietary_or_accessibility_notes') || '').trim() || null,
      message: String(form.get('message') || '').trim() || null,
      ...(responseKey ? { response_key: responseKey } : {}),
    }

    setSubmitting(true)
    try {
      const path = invitationToken
        ? `/api/invitations/${encodeURIComponent(invitationToken)}/rsvp`
        : `/api/events/${encodeURIComponent(event.public_slug)}/rsvps`
      const result = await api<{ message: string }>(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (responseKey) localStorage.setItem(`rsvp-response:${event.public_slug}`, responseKey)
      setSuccess(result.message)
      setBubbleBurst({ id: ++bubbleBurstId.current, count: attendance === 'attending' ? 35 : 3 })
      formElement.reset()
      setAttendance('attending')
      setPartySize(1)
    } catch (error) {
      if (error instanceof ApiError) {
        const firstError = Object.values(error.errors).flat()[0]
        setFormError(firstError || error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'We could not save your RSVP. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <main className="loading-page"><span className="spinner" />Loading your invitation…</main>
  }
  if (!event) {
    return <main className="message-page"><a className="brand" href="/">gather<span>.</span></a><h1>Invitation not found</h1><p>{pageError}</p></main>
  }

  const startsAt = prettyTime(event.start_time)
  const endsAt = prettyTime(event.end_time)
  const countdown = getCountdownParts(timeLeftMs)
  const destinationText = [event.venue_name, event.venue_address].filter(Boolean).join(', ').trim()
  const mapsSearchUrl = event.map_url && /^https?:\/\//i.test(event.map_url)
    ? event.map_url
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationText || 'event venue')}`
  const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationText || 'event venue')}`

  return (
    <main ref={pageRef} className={`invitation min-h-screen theme-${event.theme}`}>
      <BubbleField pageRef={pageRef} enabled={effectsActive && !preview} burst={bubbleBurst} />
      <nav ref={invitationHeaderRef} className="invite-nav flex items-center justify-between" tabIndex={-1}>
        <a className="brand" href="/">gather<span>.</span></a>
        {preview && onClosePreview
          ? <button className="preview-close" type="button" onClick={onClosePreview}>← Back to dashboard</button>
          : <span className="nav-note">{sample ? 'SAMPLE INVITATION · PREVIEW' : 'YOU ARE INVITED'}</span>}
      </nav>
      <section className={`hero ${event.cover_image_url ? 'hero-photo' : ''}`} style={event.cover_image_url ? { backgroundImage: `linear-gradient(180deg, rgba(49,69,104,.2), rgba(49,69,104,.68)), url("${event.cover_image_url}")` } : undefined}>
        <div className="hero-ornament" aria-hidden="true">✳</div>
        <div className="hero-content relative z-10">
          <p className="eyebrow">TOGETHER IS A BEAUTIFUL PLACE TO BE</p>
          <h1>{event.combined_title}</h1>
          <div className="occasion-list">
            {event.occasion_labels.map((label) => <span key={label}>{label}</span>)}
          </div>
          <p className="hero-date">{prettyDate(event.event_date)}</p>
          <a className="button button-light" href="#rsvp">Kindly reply <span aria-hidden="true">↗</span></a>
        </div>
        <span className="hero-caption">A DAY MADE FOR MAKING MEMORIES</span>
      </section>

      <section className="welcome-section">
        <p className="eyebrow">A NOTE FROM THE HOSTS</p>
        <p className="welcome-copy">{event.welcome_message || 'We would be delighted to celebrate this day with you.'}</p>
        <span className="flourish" aria-hidden="true">✳</span>
        <img className="underwater-art art-whale" src={blueWhale} alt="" aria-hidden="true" />
        <img className="underwater-art art-jellyfish" src={jellyFish} alt="" aria-hidden="true" />
      </section>

      <section className="countdown-section" aria-labelledby="countdown-heading">
        <div className="countdown-shell">
          <p className="eyebrow">THE OCEAN ADVENTURE BEGINS IN…</p>
          <h2 id="countdown-heading">{countdown.isComplete ? 'The celebration has arrived.' : 'The Ocean Adventure Begins In…'}</h2>
          {countdown.isComplete ? (
            <p className="countdown-celebration">We can&rsquo;t wait to celebrate with you beneath the waves.</p>
          ) : (
            <div className="countdown-grid" aria-live="polite">
              <div className="countdown-card"><span>{String(countdown.days).padStart(2, '0')}</span><small>Days</small></div>
              <div className="countdown-card"><span>{String(countdown.hours).padStart(2, '0')}</span><small>Hours</small></div>
              <div className="countdown-card"><span>{String(countdown.minutes).padStart(2, '0')}</span><small>Minutes</small></div>
              <div className="countdown-card"><span>{String(countdown.seconds).padStart(2, '0')}</span><small>Seconds</small></div>
            </div>
          )}
        </div>
      </section>

      <section className="details-section">
        <div className="details-intro">
          <p className="eyebrow">SAVE THE DATE</p>
          <h2>All the little details</h2>
          <p>One joyful gathering, shared with the people we love.</p>
        </div>
        <div className="detail-grid grid md:grid-cols-2">
          <article className="detail-card">
            <span className="detail-icon" aria-hidden="true">01</span>
            <p className="eyebrow">WHEN</p>
            <h3>{prettyDate(event.event_date)}</h3>
            <p>{startsAt}{endsAt ? ` – ${endsAt}` : ''}{event.timezone ? ` · ${event.timezone.replaceAll('_', ' ')}` : ''}</p>
          </article>
          <article className="detail-card">
            <span className="detail-icon" aria-hidden="true">02</span>
            <p className="eyebrow">WHERE</p>
            <h3>{event.venue_name || 'Venue to be announced'}</h3>
            <p>{event.venue_address || 'We will share the location soon.'}</p>
            {event.map_url && <a className="text-link" href={event.map_url} target="_blank" rel="noreferrer">Open map ↗</a>}
          </article>
        </div>
        {event.cover_image_url && <img className="cover-image" src={event.cover_image_url} alt="A glimpse of the celebration venue" />}
        {event.gallery_urls.length > 0 && <div className="gallery">{event.gallery_urls.map((url) => <img key={url} src={url} alt="A moment from the celebration" loading="lazy" />)}</div>}
        <img className="underwater-art art-turtle" src={greenTurtle} alt="" aria-hidden="true" />
      </section>

      <section className="venue-section" aria-labelledby="venue-heading">
        <div className="venue-card">
          <div className="venue-copy">
            <p className="eyebrow">FIND YOUR WAY TO THE CELEBRATION</p>
            <h2 id="venue-heading">Find Your Way to the Celebration</h2>
            <p className="venue-description">We&rsquo;re gathering with our favorite people, and we hope you&rsquo;ll join us for the day.</p>
          </div>
          <div className="venue-details">
            <p className="venue-name">{event.venue_name || 'Venue to be announced'}</p>
            <p>{event.venue_address || 'The venue address will be shared soon.'}</p>
            <p>{prettyDate(event.event_date)}{startsAt ? ` · ${startsAt}` : ''}{endsAt ? ` – ${endsAt}` : ''}{event.timezone ? ` · ${event.timezone.replaceAll('_', ' ')}` : ''}</p>
            <div className="maps-actions">
              <a className="button button-light" href={mapsSearchUrl} target="_blank" rel="noreferrer">Open Google Maps</a>
              <a className="button button-outline" href={mapsDirectionsUrl} target="_blank" rel="noreferrer">Get Directions</a>
            </div>
          </div>
        </div>
      </section>

      <section className="rsvp-section" id="rsvp">
        <div className="rsvp-card">
          <p className="eyebrow">WE HOPE YOU CAN JOIN US</p>
          <h2 id="rsvp-heading">Will you be there?</h2>
          {event.rsvp_deadline && <p className="deadline">Please reply by {new Date(event.rsvp_deadline).toLocaleDateString()}.</p>}
          {(sample || preview) && <p className="sample-notice">{preview ? 'Preview mode — RSVPs are disabled.' : 'You’re viewing a sample invitation. RSVPs are disabled in this preview.'}</p>}
          {success ? (
            <div className="success-message" role="status"><span aria-hidden="true">✓</span><p>{success}</p><small>You can submit again later to update your response.</small><button type="button" className="text-link" onClick={() => setSuccess('')}>Change my response</button></div>
          ) : (
            <form className="rsvp-form" onSubmit={submitRsvp}>
              <label>Full name<input name="full_name" autoComplete="name" required maxLength={255} value={guestName} onChange={(eventInput) => setGuestName(eventInput.target.value)} /></label>
              <fieldset className="attendance-options">
                <legend>Your reply</legend>
                <label className={`choice ${attendance === 'attending' ? 'selected' : ''}`}><input type="radio" name="attendance" checked={attendance === 'attending'} onChange={() => setAttendance('attending')} /><span>Joyfully accepts</span></label>
                <label className={`choice ${attendance === 'declined' ? 'selected' : ''}`}><input type="radio" name="attendance" checked={attendance === 'declined'} onChange={() => setAttendance('declined')} /><span>Regretfully declines</span></label>
              </fieldset>
              {attendance === 'attending' && event.allow_plus_ones && (
                <label>Number attending
                  <select value={partySize} onChange={(change) => setPartySize(Number(change.target.value))}>
                    {Array.from({ length: event.max_party_size }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}</option>)}
                  </select>
                </label>
              )}
              {attendance === 'attending' && event.allow_plus_ones && partySize > 1 && <label>Additional guest names <span className="optional">(optional, one per line)</span><textarea name="additional_guest_names" rows={3} maxLength={1000} /></label>}
              <div className="contact-row">
                <label>Email <span className="optional">(optional)</span><input type="email" name="email" autoComplete="email" maxLength={255} /></label>
                <label>Phone <span className="optional">(optional)</span><input type="tel" name="phone" autoComplete="tel" maxLength={40} /></label>
              </div>
              <label>Dietary or accessibility needs <span className="optional">(optional)</span><textarea name="dietary_or_accessibility_notes" rows={2} maxLength={2000} /></label>
              <label>A note for the hosts <span className="optional">(optional)</span><textarea name="message" rows={2} maxLength={2000} /></label>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button className="button button-dark" type="submit" disabled={submitting || sample || preview}>{submitting ? 'Saving your reply…' : 'Send my RSVP'} <span aria-hidden="true">↗</span></button>
            </form>
          )}
        </div>
        <img className="underwater-art art-crab" src={crab} alt="" aria-hidden="true" />
      </section>
      <footer className="invite-footer"><a className="brand" href="/">gather<span>.</span></a><p>Made with care, for moments that matter.</p><a href="#rsvp">Reply to invitation ↑</a></footer>
    </main>
  )
}
