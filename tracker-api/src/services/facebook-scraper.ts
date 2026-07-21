console.log('9. facebook-scraper module imported')
import { chromium, type Page } from 'playwright'
import { ListingInput } from '../store/listings'

export const FACEBOOK_MARKETPLACE_SOURCE = 'facebook-marketplace'

export type ScrapeOptions = {
  headless?: boolean
  maxListings?: number
  listingWaitTimeoutMs?: number
  onPageReady?: (page: Page) => Promise<void>
}

export class ScraperError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ScraperError'
  }
}

export type MarketplaceSearchParams = {
  query: string
  location: string
  radius: number
  maxPrice?: number | null
}

export function buildMarketplaceSearchUrl(
  params: MarketplaceSearchParams,
): string {
  const locationSlug = params.location.toLowerCase().replace(/\s+/g, '')
  const searchParams = new URLSearchParams({
    query: params.query,
    exact: 'false',
    radius: String(params.radius),
  })

  if (params.maxPrice) {
    searchParams.set('maxPrice', String(params.maxPrice))
  }

  return `https://www.facebook.com/marketplace/${locationSlug}/search/?${searchParams.toString()}`
}

// TODO: Validate that scraped listing locations fall within the requested radius.

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

async function waitForListings(page: Page, timeoutMs: number): Promise<void> {
  await page
    .waitForSelector('a[href*="/marketplace/item/"]', { timeout: timeoutMs })
    .catch(() => undefined)
}

async function collectListings(
  page: Page,
  maxListings: number,
): Promise<ListingInput[]> {
  const anchors = page.locator('a[href*="/marketplace/item/"]')
  const total = await anchors.count()
  const results: ListingInput[] = []
  const seenUrls = new Set<string>()

  for (let i = 0; i < total && results.length < maxListings; i++) {
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
      source: FACEBOOK_MARKETPLACE_SOURCE,
      listingUrl,
      title,
      price,
      location,
      imageUrl,
    })
  }

  return results
}

export async function scrapeMarketplaceSearch(
  searchParams: MarketplaceSearchParams,
  options: ScrapeOptions = {},
): Promise<ListingInput[]> {
  const {
    headless = true,
    maxListings = 5,
    listingWaitTimeoutMs = 30_000,
    onPageReady,
  } = options

  const searchUrl = buildMarketplaceSearchUrl(searchParams)
  const browser = await chromium.launch({ headless })
  const page = await browser.newPage()

  try {
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })

    // TEMP DEBUG: diagnose empty scrapes — remove after investigation
    const debugLoginRequired = await detectLoginRequired(page)
    const debugListingCount = await page
      .locator('a[href*="/marketplace/item/"]')
      .count()
    console.log('[scrape debug] final URL:', page.url())
    console.log('[scrape debug] page title:', await page.title())
    console.log('[scrape debug] login detected:', debugLoginRequired)
    console.log(
      '[scrape debug] listing anchor count:',
      debugListingCount,
    )

    if (debugListingCount === 0) {
      const screenshotPath = `/tmp/scout-scrape-debug-${Date.now()}.png`
      await page.screenshot({ path: screenshotPath, fullPage: true })
      console.log('[scrape debug] screenshot saved:', screenshotPath)

      const bodyText = await page.evaluate(
        () => document.body?.innerText?.slice(0, 1000) ?? '',
      )
      console.log('[scrape debug] body.innerText (first 1000 chars):\n', bodyText)
    }

    if (onPageReady) {
      await onPageReady(page)
    } else if (await detectLoginRequired(page)) {
      console.warn(
        'Facebook login may be required. API runs cannot wait for manual login.',
      )
    }

    await waitForListings(page, listingWaitTimeoutMs)

    // Must await before the finally block runs, otherwise browser.close()
    // executes while collectListings() is still using the page.
    return await collectListings(page, maxListings)
  } catch (error) {
    throw new ScraperError(
      `Failed to scrape Marketplace for query "${searchParams.query}"`,
      { cause: error },
    )
  } finally {
    await browser.close()
  }
}

export { detectLoginRequired }
