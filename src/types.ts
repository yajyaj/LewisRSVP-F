export type AttendanceStatus = 'attending' | 'declined'
export type EventStatus = 'draft' | 'published' | 'archived'

export interface PublicEvent {
  id: number
  public_slug: string
  combined_title: string
  welcome_message: string | null
  event_date: string
  start_time: string | null
  end_time: string | null
  timezone: string
  venue_name: string | null
  venue_address: string | null
  map_url: string | null
  rsvp_deadline: string | null
  cover_image_url: string | null
  gallery_urls: string[]
  theme: string
  allow_plus_ones: boolean
  max_party_size: number
  occasion_labels: string[]
}

export interface OccasionLabel {
  id: number
  label: string
  display_order: number
}

export interface EventProject extends Omit<PublicEvent, 'occasion_labels'> {
  occasion_labels: OccasionLabel[]
  internal_name: string
  status: EventStatus
  access_mode: 'public' | 'private'
  created_at: string
  updated_at: string
  rsvp_responses_count?: number
  invitations_count?: number
}

export interface Guest {
  id: number
  full_name: string
  email: string | null
  phone: string | null
}

export interface RsvpResponse {
  id: number
  guest: Guest
  attendance_status: AttendanceStatus
  party_size: number
  additional_guest_names: string[]
  dietary_or_accessibility_notes: string | null
  message: string | null
  submitted_at: string
}

export interface InvitationRecord {
  id: number
  status: 'active' | 'revoked'
  created_at: string
  guest: Guest
  has_responded: boolean
}

export interface Metrics {
  submissions: number
  attending_parties: number
  confirmed_attendees: number
  declined: number
  pending: number
}
