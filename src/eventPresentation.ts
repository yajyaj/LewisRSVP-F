import type { PublicEvent } from './types'
import type { CelebrationStop } from './eventVenues'
import { eventStartTimestamp } from './eventCountdown'

export function prettyDate(date: string): string {
  return new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`))
}

export function prettyTime(time: string | null | undefined): string | null {
  if (!time) return null
  const [hour, minute] = time.split(':').map(Number)
  return new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2020, 0, 1, hour, minute)))
}

export function eventStops(event: PublicEvent): CelebrationStop[] {
  return event.event_stops?.length ? event.event_stops.map(stop => ({
    label: stop.label, name: stop.venue_name, address: stop.venue_address,
    startsAt: prettyTime(stop.start_time), endsAt: prettyTime(stop.end_time), mapUrl: stop.map_url,
  })) : [{ label: event.occasion_labels[0] || 'Celebration', name: event.venue_name, address: event.venue_address,
    startsAt: prettyTime(event.start_time), endsAt: prettyTime(event.end_time), mapUrl: event.map_url }]
}

export function countdownTarget(event: PublicEvent): number | null {
  const starts = event.event_stops?.length ? event.event_stops.map(stop => stop.start_time) : [event.start_time]
  const targets = starts.map(time => eventStartTimestamp(event.event_date, time, event.timezone)).filter((time): time is number => time !== null)
  return targets.length ? Math.min(...targets) : null
}

export function deadlineDate(event: PublicEvent): string | null {
  return event.rsvp_deadline ? new Intl.DateTimeFormat('en-PH', { timeZone: event.timezone, month: 'long', day: 'numeric', year: 'numeric' })
    .format(new Date(event.rsvp_deadline)) : null
}
