import * as fs from 'fs'
import * as path from 'path'
import { chromium, type Page } from 'playwright'
import { ListingInput } from '../store/listings'

export const FACEBOOK_MARKETPLACE_SOURCE = 'facebook-marketplace'

const FACEBOOK_STORAGE_STATE_PATH = path.join(
  process.cwd(),
  'storage',
  'facebook-state.json',
)

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

  // Default: use anonymous Marketplace scraping.
  // If USE_FACEBOOK_AUTH=true, load the saved Facebook session instead.
  const rawUseFacebookAuth = process.env.USE_FACEBOOK_AUTH
  const useFacebookAuth = rawUseFacebookAuth === 'true'
  const stateFileExists = fs.existsSync(FACEBOOK_STORAGE_STATE_PATH)
  const loadingAuthenticatedSession = useFacebookAuth && stateFileExists

  console.log(`USE_FACEBOOK_AUTH=${rawUseFacebookAuth ?? '(unset)'}`)
  console.log(`facebook-state.json exists: ${stateFileExists}`)
  console.log(`Loading authenticated session: ${loadingAuthenticatedSession}`)
  if (loadingAuthenticatedSession) {
    console.log('Creating authenticated Playwright context (storageState will be passed)')
  } else {
    console.log('Creating anonymous Playwright context')
  }

  const context = loadingAuthenticatedSession
    ? await browser.newContext({ storageState: FACEBOOK_STORAGE_STATE_PATH })
    : await browser.newContext()

  if (loadingAuthenticatedSession) {
    console.log(
      `Using authenticated Facebook session from ${FACEBOOK_STORAGE_STATE_PATH}`,
    )
  } else if (useFacebookAuth && !stateFileExists) {
    console.log(
      'USE_FACEBOOK_AUTH=true but no storage state found — using anonymous browser session',
    )
  } else {
    console.log('Using anonymous Facebook Marketplace session')
  }

  const page = await context.newPage()

  try {
    console.log(`[marketplace] Search query: ${searchParams.query}`)
    console.log(`[marketplace] Initial URL: ${searchUrl}`)

    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })

    const finalUrl = page.url()
    const pageTitle = await page.title()
    const loginUiDetected = await detectLoginRequired(page)

    console.log(`[marketplace] Final URL: ${finalUrl}`)
    console.log(`[marketplace] Page title: ${pageTitle}`)
    console.log(`[marketplace] Login UI detected: ${loginUiDetected}`)

    if (onPageReady) {
      await onPageReady(page)
    } else if (loginUiDetected) {
      console.warn(
        'Facebook login UI detected during anonymous scrape. Continuing without waiting for manual login.',
      )
    }

    await waitForListings(page, listingWaitTimeoutMs)

    const anchorCount = await page
      .locator('a[href*="/marketplace/item/"]')
      .count()
    console.log(`[marketplace] Listing anchors found: ${anchorCount}`)

    // Must await before the finally block runs, otherwise browser.close()
    // executes while collectListings() is still using the page.
    const listings = await collectListings(page, maxListings)
    console.log(`[marketplace] Listings returned: ${listings.length}`)

    if (listings.length === 0) {
      const outDir = path.join(process.cwd(), 'storage')
      fs.mkdirSync(outDir, { recursive: true })
      const screenshotPath = path.join(outDir, 'marketplace-empty.png')
      const htmlPath = path.join(outDir, 'marketplace-empty.html')
      await page.screenshot({ path: screenshotPath, fullPage: true })
      fs.writeFileSync(htmlPath, await page.content(), 'utf8')
      console.log(`[marketplace] Saved empty-result screenshot: ${screenshotPath}`)
      console.log(`[marketplace] Saved empty-result HTML: ${htmlPath}`)
    }

    return listings
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
