import { useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, api } from './api'
import type { EventProject } from './types'

interface EventEditorProps {
  event?: EventProject
  onCancel: () => void
  onSaved: (event: EventProject) => void
}

function slugify(value: string): string {
  return value.toLowerCase().trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function localDateTime(value: string): string {
  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

export default function EventEditor({ event, onCancel, onSaved }: EventEditorProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setError('')
    const data = new FormData(formEvent.currentTarget)
    const title = String(data.get('combined_title') || '').trim()
    const internalName = String(data.get('internal_name') || '').trim()
    const deadline = String(data.get('rsvp_deadline') || '')
    const payload = {
      internal_name: internalName,
      public_slug: slugify(String(data.get('public_slug') || title)),
      combined_title: title,
      welcome_message: String(data.get('welcome_message') || '').trim() || null,
      event_date: String(data.get('event_date') || ''),
      start_time: String(data.get('start_time') || '') || null,
      end_time: String(data.get('end_time') || '') || null,
      timezone: String(data.get('timezone') || 'UTC'),
      venue_name: String(data.get('venue_name') || '').trim() || null,
      venue_address: String(data.get('venue_address') || '').trim() || null,
      map_url: String(data.get('map_url') || '').trim() || null,
      rsvp_deadline: deadline ? new Date(deadline).toISOString() : null,
      cover_image_url: String(data.get('cover_image_url') || '').trim() || null,
      gallery_urls: String(data.get('gallery_urls') || '').split('\n').map((url) => url.trim()).filter(Boolean),
      theme: String(data.get('theme') || 'sage'),
      access_mode: String(data.get('access_mode') || 'public'),
      allow_plus_ones: data.get('allow_plus_ones') === 'on',
      max_party_size: Number(data.get('max_party_size') || 1),
      occasion_labels: String(data.get('occasion_labels') || '').split('\n').map((label) => label.trim()).filter(Boolean),
    }

    setSaving(true)
    try {
      const result = await api<{ event: EventProject }>(
        event ? `/api/admin/events/${event.id}` : '/api/admin/events',
        { method: event ? 'PUT' : 'POST', body: JSON.stringify(payload) },
      )
      onSaved(result.event)
    } catch (saveError) {
      if (saveError instanceof ApiError) {
        setError(Object.values(saveError.errors).flat()[0] || saveError.message)
      } else {
        setError(saveError instanceof Error ? saveError.message : 'The event could not be saved.')
      }
    } finally {
      setSaving(false)
    }
  }

  const deadlineValue = event?.rsvp_deadline ? localDateTime(event.rsvp_deadline) : ''

  return (
    <section className="editor-page">
      <div className="page-heading"><div><p className="eyebrow">EVENT BUILDER</p><h1>{event ? 'Edit your celebration' : 'Create a new celebration'}</h1><p>One invitation, one shared RSVP, every occasion together.</p></div><button className="button button-outline" type="button" onClick={onCancel}>Cancel</button></div>
      <form className="editor-form" onSubmit={submit}>
        <div className="form-section"><h2>The celebration</h2><p>Give this project a private name, then create the invitation guests will see.</p>
          <div className="editor-grid">
            <label>Project name<input name="internal_name" required maxLength={120} defaultValue={event?.internal_name || ''} placeholder="Maya's special day" /></label>
            <label>Invitation title<input name="combined_title" required maxLength={160} defaultValue={event?.combined_title || ''} placeholder="Christening & First Birthday" /></label>
            <label>Invitation link<input name="public_slug" maxLength={100} defaultValue={event?.public_slug || ''} placeholder="christening-first-birthday" /><small>Lowercase letters, numbers, and hyphens. This link is public only when published.</small></label>
            <label>Occasion labels <span className="optional">(one per line, up to 8)</span><textarea name="occasion_labels" rows={3} defaultValue={event?.occasion_labels.map((label) => label.label).join('\n') || ''} placeholder={'Christening\nFirst Birthday'} /></label>
          </div>
          <label>Welcome message<textarea name="welcome_message" rows={3} maxLength={3000} defaultValue={event?.welcome_message || ''} placeholder="We can't wait to celebrate with you." /></label>
        </div>

        <div className="form-section"><h2>When & where</h2><p>Set one time and venue for the combined celebration.</p>
          <div className="editor-grid">
            <label>Date<input type="date" name="event_date" required defaultValue={event?.event_date || new Date().toISOString().slice(0, 10)} /></label>
            <label>Time zone<input name="timezone" required defaultValue={event?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone} /></label>
            <label>Start time<input type="time" name="start_time" defaultValue={event?.start_time || ''} /></label>
            <label>End time<input type="time" name="end_time" defaultValue={event?.end_time || ''} /></label>
            <label>Venue<input name="venue_name" maxLength={255} defaultValue={event?.venue_name || ''} /></label>
            <label>Address<input name="venue_address" maxLength={500} defaultValue={event?.venue_address || ''} /></label>
            <label>Map link<input type="url" name="map_url" maxLength={2048} defaultValue={event?.map_url || ''} placeholder="https://" /></label>
            <label>RSVP deadline<input type="datetime-local" name="rsvp_deadline" defaultValue={deadlineValue} /></label>
          </div>
        </div>

        <div className="form-section"><h2>Look & feel</h2><p>Choose a calm color palette and optional photo links.</p>
          <div className="editor-grid">
            <label>Theme<select name="theme" defaultValue={event?.theme || 'sage'}><option value="sage">Sage garden</option><option value="rose">Rose blush</option><option value="blue">Blue sky</option><option value="cream">Warm cream</option></select></label>
            <label>Cover image URL<input type="url" name="cover_image_url" maxLength={2048} defaultValue={event?.cover_image_url || ''} placeholder="https://" /></label>
            <label className="full-width">Gallery image URLs <span className="optional">(one per line, up to 12)</span><textarea name="gallery_urls" rows={3} defaultValue={event?.gallery_urls.join('\n') || ''} placeholder="https://example.com/photo.jpg" /></label>
          </div>
        </div>

        <div className="form-section"><h2>Guest replies</h2><p>Choose how guests reach the invitation and the maximum party size.</p>
          <div className="editor-grid">
            <label>Invitation access<select name="access_mode" defaultValue={event?.access_mode || 'public'}><option value="public">Public invitation link</option><option value="private">Private invitation links</option></select><small>Private links are unique and can be revoked individually.</small></label>
            <label>Maximum party size<input type="number" name="max_party_size" min={1} max={20} required defaultValue={event?.max_party_size || 4} /></label>
            <label className="checkbox-line"><input type="checkbox" name="allow_plus_ones" defaultChecked={event?.allow_plus_ones ?? true} /> Allow guests to bring additional attendees</label>
          </div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="editor-actions"><button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Saving…' : event ? 'Save changes' : 'Create event project'} <span aria-hidden="true">↗</span></button><button className="button button-outline" type="button" onClick={onCancel}>Cancel</button></div>
      </form>
    </section>
  )
}
