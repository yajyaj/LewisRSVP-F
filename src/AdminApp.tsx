import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, api, downloadCsv, login } from './api'
import EventEditor from './EventEditor'
import InvitationPage from './InvitationPage'
import type { EventProject, InvitationRecord, Metrics, RsvpResponse } from './types'

interface User {
  id: number
  name: string
  username: string | null
  email: string
}

interface ResponsePage {
  data: RsvpResponse[]
  current_page: number
  last_page: number
  total: number
}

const emptyMetrics: Metrics = { submissions: 0, attending_parties: 0, confirmed_attendees: 0, declined: 0, pending: 0 }

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export default function AdminApp() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [authError, setAuthError] = useState('')
  const [notice, setNotice] = useState('')
  const [events, setEvents] = useState<EventProject[]>([])
  const [selected, setSelected] = useState<EventProject | null>(null)
  const [editing, setEditing] = useState<EventProject | false | null>(null)
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api<{ events: EventProject[] }>('/api/admin/events')
      setEvents(result.events)
      setSelected((current) => current ? result.events.find((event) => event.id === current.id) || null : null)
    } catch (error) {
      setNotice(messageFrom(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    api<{ user: User }>('/api/auth/user')
      .then((result) => setUser(result.user))
      .catch((error: unknown) => {
        if (!(error instanceof ApiError && error.status === 401)) setAuthError(messageFrom(error))
      })
      .finally(() => setAuthChecked(true))
  }, [])

  useEffect(() => {
    if (user) void loadEvents()
  }, [loadEvents, user])

  async function signIn(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setAuthError('')
    const fields = new FormData(formEvent.currentTarget)
    try {
      const result = await login(String(fields.get('identifier') || ''), String(fields.get('password') || ''))
      setUser(result.user)
    } catch (error) {
      setAuthError(messageFrom(error))
    }
  }

  async function signOut() {
    try {
      await api('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setSelected(null)
      setEvents([])
    } catch (error) {
      setNotice(messageFrom(error))
    }
  }

  async function deleteEvent(event: EventProject) {
    if (!window.confirm(`Permanently delete “${event.internal_name}” and all its guest and RSVP data? This cannot be undone.`)) return
    try {
      await api(`/api/admin/events/${event.id}`, { method: 'DELETE' })
      setSelected(null)
      setNotice('Event and all associated guest data were deleted.')
      await loadEvents()
    } catch (error) {
      setNotice(messageFrom(error))
    }
  }

  async function changeStatus(event: EventProject, status: EventProject['status']) {
    try {
      const result = await api<{ event: EventProject }>(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...event,
          occasion_labels: event.occasion_labels.map((label) => label.label),
          status,
        }),
      })
      setNotice(status === 'published' ? 'Your invitation is now published.' : status === 'archived' ? 'Event archived.' : 'Event saved as a draft.')
      await loadEvents()
      setSelected(result.event)
    } catch (error) {
      setNotice(messageFrom(error))
    }
  }

  async function duplicateEvent(event: EventProject) {
    try {
      const result = await api<{ event: EventProject }>(`/api/admin/events/${event.id}/duplicate`, { method: 'POST' })
      setNotice('Draft copy created. Guest lists and RSVP records were not copied.')
      await loadEvents()
      setSelected(result.event)
    } catch (error) {
      setNotice(messageFrom(error))
    }
  }

  if (!authChecked) return <main className="loading-page"><span className="spinner" />Checking organizer access…</main>
  if (!user) {
    return (
      <main className="login-page">
        <a className="brand" href="/">gather<span>.</span></a>
        <form className="login-card" onSubmit={signIn}>
          <p className="eyebrow">ORGANIZER SIGN IN</p>
          <h1>Welcome back.</h1>
          <p>Sign in to create invitations and manage replies.</p>
          {authError && <p className="form-error" role="alert">{authError}</p>}
          <label>Username or email<input type="text" name="identifier" autoComplete="username" required /></label>
          <label>Password<input type="password" name="password" autoComplete="current-password" required /></label>
          <button className="button button-dark" type="submit">Sign in <span aria-hidden="true">↗</span></button>
        </form>
        <p className="login-help">Organizer accounts are created securely from the backend command line.</p>
      </main>
    )
  }

  if (preview && selected) {
    return <InvitationPage previewEvent={selected} onClosePreview={() => setPreview(false)} />
  }

  if (editing !== null) {
    return (
      <div className="admin-shell min-h-screen">
        <AdminHeader user={user} onSignOut={signOut} />
        <EventEditor
          event={editing || undefined}
          onCancel={() => setEditing(null)}
          onSaved={async (saved) => {
            setEditing(null)
            setSelected(saved)
            setNotice('Event details saved.')
            await loadEvents()
          }}
        />
      </div>
    )
  }

  return (
    <div className="admin-shell min-h-screen">
      <AdminHeader user={user} onSignOut={signOut} />
      {notice && <div className="notice-banner" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
      {selected
        ? <EventWorkspace
            event={selected}
            onBack={() => setSelected(null)}
            onEdit={() => setEditing(selected)}
            onPreview={() => setPreview(true)}
            onStatusChange={(status) => changeStatus(selected, status)}
            onDuplicate={() => duplicateEvent(selected)}
            onDelete={() => deleteEvent(selected)}
            notify={setNotice}
          />
        : <section className="dashboard-page">
            <div className="page-heading"><div><p className="eyebrow">YOUR INVITATION STUDIO</p><h1>Good things are worth gathering for.</h1><p>Every celebration, together in one thoughtful place.</p></div><button className="button button-dark" onClick={() => setEditing(false)} type="button">Create an event <span aria-hidden="true">↗</span></button></div>
            {loading ? <p className="empty-state">Loading your invitations…</p> : events.length === 0
              ? <div className="empty-state"><span className="empty-flower" aria-hidden="true">✳</span><h2>Your next celebration starts here.</h2><p>Create an invitation, add the occasions you’re celebrating, and share one RSVP link with your guests.</p><button className="button button-outline" type="button" onClick={() => setEditing(false)}>Create your first event</button></div>
              : <div className="project-grid">{events.map((event) => (
                  <article className="project-card" key={event.id}>
                    <div className={`project-cover theme-${event.theme}`}><span className={`status-pill status-${event.status}`}>{event.status}</span><span className="cover-mark" aria-hidden="true">✳</span><div><p className="eyebrow">{event.internal_name}</p><h2>{event.combined_title}</h2></div></div>
                    <div className="project-info"><p className="project-date">{new Date(`${event.event_date}T12:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p><div className="occasion-list small">{event.occasion_labels.map((label) => <span key={label.id}>{label.label}</span>)}</div><p className="project-count">{event.rsvp_responses_count || 0} RSVP submissions <span>·</span> {event.invitations_count || 0} invitations</p>
                      <div className="project-actions"><button className="text-link" type="button" onClick={() => setSelected(event)}>Open dashboard →</button><button className="icon-action" type="button" onClick={() => setEditing(event)} aria-label={`Edit ${event.internal_name}`}>Edit</button></div>
                    </div>
                  </article>
                ))}</div>}
          </section>}
      <footer className="admin-footer"><span className="brand">gather<span>.</span></span><span>One occasion, or many — celebrate them together.</span></footer>
    </div>
  )
}

function AdminHeader({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  return <header className="admin-header flex items-center justify-between"><a className="brand" href="/admin">gather<span>.</span></a><div><span className="organizer-name">{user.name}</span><button className="text-link" type="button" onClick={onSignOut}>Sign out</button></div></header>
}

function EventWorkspace({
  event,
  onBack,
  onEdit,
  onPreview,
  onStatusChange,
  onDuplicate,
  onDelete,
  notify,
}: {
  event: EventProject
  onBack: () => void
  onEdit: () => void
  onPreview: () => void
  onStatusChange: (status: EventProject['status']) => void
  onDuplicate: () => void
  onDelete: () => void
  notify: (message: string) => void
}) {
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics)
  const [responses, setResponses] = useState<RsvpResponse[]>([])
  const [invitations, setInvitations] = useState<InvitationRecord[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [workspaceError, setWorkspaceError] = useState('')
  const [editingResponse, setEditingResponse] = useState<RsvpResponse | null>(null)
  const [newInviteUrl, setNewInviteUrl] = useState('')
  const [creatingInvite, setCreatingInvite] = useState(false)

  const refresh = useCallback(async () => {
    setWorkspaceError('')
    try {
      const query = new URLSearchParams({ page: String(page) })
      if (search) query.set('search', search)
      if (status) query.set('status', status)
      const [metricResult, responseResult] = await Promise.all([
        api<{ metrics: Metrics }>(`/api/admin/events/${event.id}/metrics`),
        api<ResponsePage>(`/api/admin/events/${event.id}/responses?${query}`),
      ])
      setMetrics(metricResult.metrics)
      setResponses(responseResult.data)
      setLastPage(responseResult.last_page)
      if (event.access_mode === 'private') {
        const inviteResult = await api<{ invitations: InvitationRecord[] }>(`/api/admin/events/${event.id}/invitations`)
        setInvitations(inviteResult.invitations)
      } else {
        setInvitations([])
      }
    } catch (error) {
      setWorkspaceError(messageFrom(error))
    }
  }, [event.access_mode, event.id, page, search, status])

  useEffect(() => { void refresh() }, [refresh])

  async function createInvitation(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setCreatingInvite(true)
    setWorkspaceError('')
    const formElement = formEvent.currentTarget
    const form = new FormData(formElement)
    try {
      const result = await api<{ invitation: { id: number; url: string } }>(`/api/admin/events/${event.id}/invitations`, {
        method: 'POST',
        body: JSON.stringify({
          full_name: form.get('full_name'),
          email: form.get('email') || null,
          phone: form.get('phone') || null,
        }),
      })
      setNewInviteUrl(result.invitation.url)
      formElement.reset()
      notify('Private invitation created. Copy its link now; it will not be shown again.')
      await refresh()
    } catch (error) {
      setWorkspaceError(messageFrom(error))
    } finally {
      setCreatingInvite(false)
    }
  }

  async function revokeInvitation(invitationId: number) {
    if (!window.confirm('Revoke this private invitation link? The guest will no longer be able to use it.')) return
    try {
      await api(`/api/admin/invitations/${invitationId}/revoke`, { method: 'POST' })
      notify('Invitation revoked.')
      await refresh()
    } catch (error) {
      setWorkspaceError(messageFrom(error))
    }
  }

  async function copyInviteLink() {
    await navigator.clipboard.writeText(newInviteUrl)
    notify('Invitation link copied.')
  }

  return (
    <section className="workspace-page">
      <button className="back-link" type="button" onClick={onBack}>← All events</button>
      <div className="page-heading workspace-heading"><div><p className="eyebrow">{event.internal_name} · {event.status.toUpperCase()}</p><h1>{event.combined_title}</h1><div className="occasion-list small">{event.occasion_labels.map((label) => <span key={label.id}>{label.label}</span>)}</div></div><div className="workspace-actions"><button className="button button-outline" type="button" onClick={onPreview}>Preview</button><button className="button button-outline" type="button" onClick={onEdit}>Edit event</button><button className="button button-dark" type="button" onClick={() => onStatusChange(event.status === 'published' ? 'draft' : 'published')}>{event.status === 'published' ? 'Unpublish' : 'Publish'} <span aria-hidden="true">↗</span></button></div></div>
      {workspaceError && <p className="form-error" role="alert">{workspaceError}</p>}
      {event.status === 'published' && event.access_mode === 'public' && <p className="published-link">Invitation link <a href={`/${event.public_slug}`} target="_blank" rel="noreferrer">{window.location.origin}/{event.public_slug} ↗</a></p>}
      <div className="metrics-grid">
        <MetricCard label="RSVP submissions" value={metrics.submissions} note="Responses received" />
        <MetricCard label="Attending parties" value={metrics.attending_parties} note="Attending RSVPs" />
        <MetricCard label="Confirmed attendees" value={metrics.confirmed_attendees} note="Individual people" />
        <MetricCard label="Declined" value={metrics.declined} note="Unable to attend" />
        <MetricCard label="Pending invitations" value={metrics.pending} note="Active, awaiting reply" />
      </div>

      <section className="response-section">
        <div className="section-heading"><div><p className="eyebrow">GUEST BOOK</p><h2>Responses</h2></div><button className="button button-outline" type="button" onClick={() => void downloadCsv(`/api/admin/events/${event.id}/export`, `${event.public_slug}-rsvps.csv`).catch((error: unknown) => setWorkspaceError(messageFrom(error)))}>Export CSV ↓</button></div>
        <div className="filter-bar"><label className="search-field"><span aria-hidden="true">⌕</span><input value={search} onChange={(change) => { setSearch(change.target.value); setPage(1) }} placeholder="Search name, email, or phone" aria-label="Search responses" /></label><select value={status} onChange={(change) => { setStatus(change.target.value); setPage(1) }} aria-label="Filter by response"><option value="">All replies</option><option value="attending">Attending</option><option value="declined">Unable to attend</option></select><span>{responses.length} shown · {metrics.submissions} total</span></div>
        {responses.length === 0 ? <p className="empty-inline">No RSVP responses yet. Replies will appear here as guests respond.</p> : <div className="table-wrap"><table><thead><tr><th>Guest</th><th>Reply</th><th>Party size</th><th>Contact</th><th>Received</th><th></th></tr></thead><tbody>{responses.map((response) => <tr key={response.id}><td><strong>{response.guest.full_name}</strong>{response.additional_guest_names.length > 0 && <small>{response.additional_guest_names.join(', ')}</small>}</td><td><span className={`reply-pill ${response.attendance_status}`}>{response.attendance_status === 'attending' ? 'Attending' : 'Declined'}</span></td><td>{response.party_size}</td><td>{response.guest.email || response.guest.phone || '—'}</td><td>{new Date(response.submitted_at).toLocaleDateString()}</td><td><button className="text-link" type="button" onClick={() => setEditingResponse(response)}>Edit</button></td></tr>)}</tbody></table></div>}
        {lastPage > 1 && <div className="pagination"><button className="button button-outline" type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {lastPage}</span><button className="button button-outline" type="button" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>Next</button></div>}
      </section>

      {event.access_mode === 'private' && <section className="response-section invite-management">
        <div className="section-heading"><div><p className="eyebrow">PRIVATE ACCESS</p><h2>Guest invitations</h2><p>Each guest receives a private link. Revoke any link at any time.</p></div></div>
        <form className="invite-form" onSubmit={createInvitation}><label>Guest name<input name="full_name" required maxLength={255} /></label><label>Email <span className="optional">(optional)</span><input name="email" type="email" maxLength={255} /></label><label>Phone <span className="optional">(optional)</span><input name="phone" type="tel" maxLength={40} /></label><button className="button button-dark" type="submit" disabled={creatingInvite}>{creatingInvite ? 'Creating…' : 'Create private link'}</button></form>
        {newInviteUrl && <div className="new-invite"><p>Copy this one-time link and send it directly to the guest. It won't be available again after you leave this page.</p><code>{newInviteUrl}</code><button className="button button-outline" type="button" onClick={() => void copyInviteLink().catch((error: unknown) => setWorkspaceError(messageFrom(error)))}>Copy link</button></div>}
        <div className="invitation-list">{invitations.map((invitation) => <div className="invitation-row" key={invitation.id}><div><strong>{invitation.guest.full_name}</strong><p>{invitation.guest.email || invitation.guest.phone || 'No contact added'} · {invitation.has_responded ? 'Replied' : invitation.status === 'active' ? 'Awaiting reply' : 'Link revoked'}</p></div><span className={`status-pill status-${invitation.status}`}>{invitation.status}</span>{invitation.status === 'active' && <button className="text-link revoke-link" type="button" onClick={() => void revokeInvitation(invitation.id)}>Revoke</button>}</div>)}</div>
      </section>}

      <section className="danger-zone"><div><h3>Event management</h3><p>Make a separate draft copy or permanently remove this project and all associated guest information.</p></div><button className="button button-outline" type="button" onClick={onDuplicate}>Duplicate as draft</button><button className="button button-outline danger-button" type="button" onClick={() => onStatusChange(event.status === 'archived' ? 'draft' : 'archived')}>{event.status === 'archived' ? 'Restore from archive' : 'Archive event'}</button><button className="text-link danger-link" type="button" onClick={onDelete}>Delete permanently</button></section>
      {editingResponse && <ResponseEditor response={editingResponse} maxPartySize={event.max_party_size} onCancel={() => setEditingResponse(null)} onSaved={async () => { setEditingResponse(null); notify('RSVP response updated.'); await refresh() }} />}
    </section>
  )
}

function MetricCard({ label, value, note }: { label: string; value: number; note: string }) {
  return <article className="metric-card"><p>{label}</p><strong>{value}</strong><small>{note}</small></article>
}

function ResponseEditor({ response, maxPartySize, onCancel, onSaved }: { response: RsvpResponse; maxPartySize: number; onCancel: () => void; onSaved: () => void }) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setSaving(true)
    setError('')
    const form = new FormData(formEvent.currentTarget)
    try {
      await api(`/api/admin/responses/${response.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          full_name: form.get('full_name'),
          email: form.get('email') || null,
          phone: form.get('phone') || null,
          attendance_status: form.get('attendance_status'),
          party_size: Number(form.get('party_size')),
          dietary_or_accessibility_notes: form.get('dietary_or_accessibility_notes') || null,
          message: form.get('message') || null,
        }),
      })
      onSaved()
    } catch (saveError) {
      setError(messageFrom(saveError))
    } finally {
      setSaving(false)
    }
  }

  return <div className="modal-backdrop" role="presentation"><form className="response-editor" onSubmit={submit} aria-labelledby="response-editor-title"><button className="modal-close" type="button" onClick={onCancel} aria-label="Close">×</button><p className="eyebrow">ORGANIZER EDIT</p><h2 id="response-editor-title">Update RSVP</h2><label>Guest name<input name="full_name" required defaultValue={response.guest.full_name} /></label><label>Email<input type="email" name="email" defaultValue={response.guest.email || ''} /></label><label>Phone<input name="phone" defaultValue={response.guest.phone || ''} /></label><label>Reply<select name="attendance_status" defaultValue={response.attendance_status}><option value="attending">Attending</option><option value="declined">Unable to attend</option></select></label><label>Party size<input type="number" name="party_size" min={0} max={maxPartySize} defaultValue={response.party_size} /></label><label>Dietary/accessibility notes<textarea name="dietary_or_accessibility_notes" defaultValue={response.dietary_or_accessibility_notes || ''} /></label><label>Message<textarea name="message" defaultValue={response.message || ''} /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="editor-actions"><button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save response'}</button><button className="button button-outline" type="button" onClick={onCancel}>Cancel</button></div></form></div>
}
