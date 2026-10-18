const { chromium } = require(require('node:path').join(require('node:os').tmpdir(), 'rsvp-browser-tools/node_modules/playwright'))
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const output = path.join(__dirname, 'qa-results')
fs.mkdirSync(output, { recursive: true })

async function measure(page) {
  return page.locator('.ocean-detail-card').evaluateAll(cards => {
    return cards.slice(1).map(card => {
      const divider = card.querySelectorAll('.detail-stop')[1]
      const style = getComputedStyle(divider)
      const cardRect = card.getBoundingClientRect()
      return { cardTop: cardRect.top, cardLeft: cardRect.left, dividerTop: divider.getBoundingClientRect().top,
        width: style.borderTopWidth, color: style.borderTopColor, style: style.borderTopStyle,
        padding: style.paddingTop, margin: style.marginTop }
    })
  })
}

;(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true })
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' })
    await page.goto('http://127.0.0.1:5173/')
    await page.getByRole('button', { name: 'You Are Invited', exact: true }).click()
    const results = []
    for (const width of [320, 375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.locator('.ocean-details').scrollIntoViewIfNeeded()
      // Measure the resting layout, not an existing per-card hover-lift animation.
      await page.mouse.move(0, 0)
      await page.waitForTimeout(50)
      const [venue, time] = await measure(page)
      const sideBySide = Math.abs(venue.cardTop - time.cardTop) < .5
      if (width > 900) assert.equal(sideBySide, true)
      const delta = Math.abs(venue.dividerTop - time.dividerTop)
      for (const property of ['width', 'color', 'style', 'padding', 'margin']) assert.equal(venue[property], time[property])
      assert.equal(venue.width, '1px')
      assert.equal(venue.style, 'solid')
      if (sideBySide) assert.ok(delta < .01, `divider mismatch at ${width}: ${delta}px`)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      const result = { viewport: width, layout: sideBySide ? 'side by side' : 'stacked', venue, time, delta: sideBySide ? delta : null }
      results.push(result)
      console.log(JSON.stringify({ width, layout: result.layout, border: venue.width, color: venue.color, delta: result.delta }))
      if (width === 1440 || width === 390) await page.locator('.ocean-details').screenshot({ path: path.join(output, `divider-alignment-${width}.png`) })
    }
    await page.setViewportSize({ width: 1024, height: 1000 })
    await page.mouse.move(0, 0)
    await page.locator('.ocean-detail-card').nth(1).locator('.detail-stop').first().locator('.detail-primary').evaluate(e => { e.textContent += ' Additional long venue text to exercise natural wrapping and shared row sizing.'.repeat(3) })
    const [venue, time] = await measure(page)
    assert.ok(Math.abs(venue.dividerTop - time.dividerTop) < .01)
    console.log('Long-content reflow remains aligned without fixed heights or offsets.')
    fs.writeFileSync(path.join(output, 'divider-alignment.json'), JSON.stringify(results, null, 2))
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
