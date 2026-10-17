const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]>

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`
  const cookie = document.cookie.split('; ').find((entry) => entry.startsWith(prefix))
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null
}

async function csrfCookie(): Promise<void> {
  const response = await fetch(`${apiUrl}/sanctum/csrf-cookie`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new ApiError('Could not start a secure session. Check the API server and CORS settings.', response.status)
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase()
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    await csrfCookie()
  }

  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const xsrf = readCookie('XSRF-TOKEN')
  if (xsrf) {
    headers.set('X-XSRF-TOKEN', xsrf)
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
  })
  const bodyText = await response.text()
  const body: unknown = bodyText ? JSON.parse(bodyText) : null

  if (!response.ok) {
    const payload = body as { message?: string; errors?: Record<string, string[]> } | null
    throw new ApiError(
      payload?.message || `The request failed (${response.status}).`,
      response.status,
      payload?.errors || {},
    )
  }

  return body as T
}

export async function login(identifier: string, password: string) {
  return api<{ user: { id: number; name: string; username: string | null; email: string } }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  })
}

export async function downloadCsv(path: string, filename: string): Promise<void> {
  await csrfCookie()
  const response = await fetch(`${apiUrl}${path}`, {
    credentials: 'include',
    headers: { Accept: 'text/csv' },
  })
  if (!response.ok) {
    const body = (await response.json()) as { message?: string }
    throw new ApiError(body.message || 'Could not export RSVP responses.', response.status)
  }

  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
