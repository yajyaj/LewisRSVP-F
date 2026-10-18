// Runs only against dedicated temporary QA servers/databases, never the normal API.
const { chromium } = require(require('node:path').join(require('node:os').tmpdir(), 'rsvp-browser-tools/node_modules/playwright'))
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const credentialsPath = process.argv[2]
if (!credentialsPath || !credentialsPath.includes('rsvp-live-qa-')) throw Error('Provide the isolated QA credentials file')
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8').replace(/^\uFEFF/, ''))
const apiOrigin = 'http://127.0.0.1:8001'
const frontendOrigin = 'http://127.0.0.1:5174'
const results = []
const record = name => { results.push(name); console.log(name + ': passed') }
async function api(page, endpoint, method = 'GET', data) {
  return page.evaluate(async ({ apiOrigin, endpoint, method, data }) => {
    const token = document.cookie.split('; ').find(cookie => cookie.startsWith('XSRF-TOKEN='))?.slice(11)
    const response = await fetch(apiOrigin + endpoint, { method, credentials: 'include', headers: {
      Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
    }, ...(data ? { body: JSON.stringify(data) } : {}) })
    const text = await response.text()
    return { status: response.status, body: text ? JSON.parse(text) : null }
  }, { apiOrigin, endpoint, method, data })
}

;(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true })
  try {
    const adminContext = await browser.newContext({ reducedMotion: 'reduce' })
    const admin = await adminContext.newPage()
    let loginHadCsrf = false
    admin.on('request', request => {
      if (request.url() === apiOrigin + '/api/auth/login') loginHadCsrf = !!request.headers()['x-xsrf-token']
    })
    await admin.goto(frontendOrigin + '/admin')
    await admin.locator('[name="identifier"]').fill(credentials.username)
    await admin.locator('[name="password"]').fill(credentials.password)
    await admin.getByRole('button', { name: /Sign in/ }).click()
    try {
      await admin.getByRole('button', { name: /Create an event/ }).waitFor({ timeout: 10000 })
    } catch {
      const message = await admin.locator('.form-error').allTextContents()
      throw Error('Isolated login did not complete: ' + message.join(' '))
    }
    assert.ok(loginHadCsrf)
    const cookies = await adminContext.cookies(apiOrigin)
    assert.ok(cookies.some(cookie => cookie.name === 'rsvp_live_qa_session' && cookie.httpOnly))
    assert.ok(cookies.some(cookie => cookie.name === 'XSRF-TOKEN'))
    record('real browser login, cross-origin credentialed requests, CSRF header and HttpOnly session cookie')
    const noCsrf = await admin.evaluate(async origin => {
      const response = await fetch(origin + '/api/auth/logout', { method: 'POST', credentials: 'include', headers: { Accept: 'application/json' } })
      return response.status
    }, apiOrigin)
    assert.equal(noCsrf, 419)
    assert.equal((await api(admin, '/api/auth/user')).status, 200)
    record('CSRF enforced on HTTP POST; rejected request leaves session intact')

    const slug = 'isolated-browser-qa-' + Date.now()
    const created = await api(admin, '/api/admin/events', 'POST', {
      internal_name: 'Isolated browser QA', public_slug: slug, combined_title: 'Local QA celebration',
      welcome_message: 'Temporary QA fixture', event_date: '2027-01-09', start_time: '10:00', end_time: '15:00', timezone: 'Asia/Manila',
      venue_name: 'QA venue', venue_address: 'QA address', map_url: null, rsvp_deadline: null, cover_image_url: null, gallery_urls: [],
      theme: 'sage', access_mode: 'public', allow_plus_ones: true, max_party_size: 4, occasion_labels: ['Christening', 'First Birthday'],
    })
    assert.equal(created.status, 201)
    const event = created.body.event
    const published = await api(admin, `/api/admin/events/${event.id}`, 'PUT', { ...event, occasion_labels: event.occasion_labels.map(label => label.label), status: 'published' })
    assert.equal(published.status, 200)
    record('real organizer session creates and publishes a temporary event')

    const guestContext = await browser.newContext({ reducedMotion: 'reduce' })
    const guest = await guestContext.newPage()
    await guest.goto(frontendOrigin + '/' + slug)
    await guest.getByRole('button', { name: 'You Are Invited', exact: true }).click()
    await guest.locator('[name="full_name"]').fill('Temporary QA Guest')
    await guest.locator('[name="party_size"]').selectOption('2')
    await guest.locator('[name="additional_guest_names"]').fill('Temporary QA Companion')
    await guest.getByRole('button', { name: /Send my RSVP/ }).click()
    await guest.locator('.ocean-rsvp-success').waitFor()
    assert.match(await guest.locator('.ocean-rsvp-success').textContent(), /saved/)
    let metrics = await api(admin, `/api/admin/events/${event.id}/metrics`)
    assert.equal(metrics.body.metrics.submissions, 1)
    assert.equal(metrics.body.metrics.confirmed_attendees, 2)
    record('real public browser RSVP and server-confirmed success persisted to isolated SQLite')
    await guest.getByRole('button', { name: 'Change my response' }).click()
    await guest.getByLabel('Regretfully declines', { exact: false }).check()
    await guest.getByRole('button', { name: /Send my RSVP/ }).click()
    await guest.locator('.ocean-rsvp-success').waitFor()
    metrics = await api(admin, `/api/admin/events/${event.id}/metrics`)
    assert.equal(metrics.body.metrics.submissions, 1)
    assert.equal(metrics.body.metrics.declined, 1)
    record('real repeat RSVP updates one stored response instead of duplicating')
    assert.equal((await api(guest, '/api/admin/events')).status, 401)
    record('guest cannot read authenticated admin API')
    assert.equal((await api(admin, `/api/admin/events/${event.id}`, 'DELETE')).status, 204)
    assert.equal((await api(admin, '/api/auth/logout', 'POST')).status, 200)
    assert.equal((await api(admin, '/api/auth/user')).status, 401)
    record('temporary event deletion and real logout/session invalidation')
    const output = path.join(__dirname, 'qa-results/live-backend.json')
    fs.writeFileSync(output, JSON.stringify({ environment: 'isolated local SQLite; not existing MySQL or production', csrfEnforced: true, checks: results }, null, 2))
    await guestContext.close()
    await adminContext.close()
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
