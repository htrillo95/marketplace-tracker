import { chromium, type Page } from 'playwright'
import * as readline from 'readline'
import { prisma } from '../lib/prisma'
import { saveNewListings, type ListingInput } from '../store/listings'

const SEARCH_URL =
  'https://www.facebook.com/marketplace/philly/search/?query=gsxr%201000&exact=false&radius=65'

const SOURCE = 'facebook-marketplace'
const MAX_LISTINGS = 5

type ListingPreview = ListingInput

function waitForEnter(message: string): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.question(message, () => {
      rl.close()
      resolve()
    })
  })
}

function parseListingText(text: string): {
  title: string | null
  price: string | null
  location: string | null
} {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const price = lines.find((line) => /^\$[\d,]+/.test(line)) ?? null
  const title =
    lines.find(
      (line) =>
        line !== price &&
        !line.match(/^(Free|Just listed|Yesterday|Today|\d+ miles?)$/i) &&
        !line.includes(','),
    ) ??
    lines[0] ??
    null
  const location =
    lines.find(
      (line) =>
        line !== price &&
        line !== title &&
        (line.includes(',') || /\d+\s*miles?\b/i.test(line)),
    ) ?? null

  return { title, price, location }
}

async function detectLoginRequired(page: Page): Promise<boolean> {
  const url = page.url()

  if (url.includes('/login') || url.includes('checkpoint')) {
    return true
  }

  const emailField = page.locator('input[name="email"]')
  const passwordField = page.locator('input[name="pass"]')

  const hasEmail = await emailField.first().isVisible().catch(() => false)
  const hasPassword = await passwordField.first().isVisible().catch(() => false)

  return hasEmail && hasPassword
}

async function waitForListings(page: Page, timeoutMs: number): Promise<boolean> {
  try {
    await page.waitForSelector('a[href*="/marketplace/item/"]', {
      timeout: timeoutMs,
    })
    return true
  } catch {
    return false
  }
}

async function collectListings(page: Page): Promise<ListingPreview[]> {
  const anchors = page.locator('a[href*="/marketplace/item/"]')
  const total = await anchors.count()
  const results: ListingPreview[] = []
  const seenUrls = new Set<string>()

  for (let i = 0; i < total && results.length < MAX_LISTINGS; i++) {
    const anchor = anchors.nth(i)
    const href = await anchor.getAttribute('href')

    if (!href) {
      continue
    }

    const listingUrl = href.startsWith('http')
      ? href.split('?')[0]
      : `https://www.facebook.com${href.split('?')[0]}`

    if (seenUrls.has(listingUrl)) {
      continue
    }

    seenUrls.add(listingUrl)

    const text = (await anchor.innerText().catch(() => '')) || ''
    const { title, price, location } = parseListingText(text)
    const imageUrl =
      (await anchor.locator('img').first().getAttribute('src').catch(() => null)) ??
      null

    results.push({
      source: SOURCE,
      listingUrl,
      title,
      price,
      location,
      imageUrl,
    })
  }

  return results
}

function printListings(listings: ListingPreview[]) {
  listings.forEach((listing, index) => {
    console.log(`--- Result ${index + 1} ---`)
    console.log(`Title:    ${listing.title ?? '(not found)'}`)
    console.log(`Price:    ${listing.price ?? '(not found)'}`)
    console.log(`Location: ${listing.location ?? '(not found)'}`)
    console.log(`Image:    ${listing.imageUrl ?? '(not found)'}`)
    console.log(`URL:      ${listing.listingUrl}`)
    console.log()
  })
}

async function main() {
  console.log('Launching Chromium (visible window)...')
  console.log('This is a disposable feasibility test, not a production scraper.\n')

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    console.log(`Opening: ${SEARCH_URL}`)
    await page.goto(SEARCH_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })

    console.log(`Page title: ${await page.title()}\n`)

    const loginRequired = await detectLoginRequired(page)

    if (loginRequired) {
      console.log('Login appears to be required.')
      console.log('Use the browser window to log in manually if prompted.')
      console.log('This script will not try to bypass login, CAPTCHA, or other security checks.\n')
      await waitForEnter('Press Enter after you are logged in and listings are visible... ')
    } else {
      console.log('Waiting up to 30 seconds for listings to appear...')
      await waitForListings(page, 30_000)
    }

    const listings = await collectListings(page)

    if (listings.length === 0) {
      console.log('No listing links found yet.')
      console.log('The browser will stay open so you can inspect the page or log in manually.\n')
      await waitForEnter('Press Enter when you want to close the browser... ')
      return
    }

    console.log(`Collected ${listings.length} listing(s):\n`)
    printListings(listings)

    console.log('Saving new listings to PostgreSQL...')
    const { saved, skipped } = await saveNewListings(listings)
    console.log(`Saved ${saved} new listing(s), skipped ${skipped} duplicate(s).\n`)

    console.log('Keeping the browser open briefly for inspection...')
    await page.waitForTimeout(10_000)
  } finally {
    await browser.close()
    await prisma.$disconnect()
    console.log('Browser closed.')
  }
}

main().catch(async (error) => {
  console.error('Script failed:', error)
  await prisma.$disconnect()
  process.exit(1)
})
