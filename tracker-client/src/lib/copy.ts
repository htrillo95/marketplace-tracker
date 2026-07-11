export const HELPERS = {
  newListingsOnly:
    'We only show listings that appeared after your last check.',
  notFacebook:
    "We never replace Facebook—we simply tell you when something changes.",
} as const

export const CHECK_PROGRESS_MESSAGES = [
  'Checking Facebook Marketplace…',
  'Looking for new listings…',
  'Comparing against previous results…',
] as const

export function getHomeSummary(
  totalNew: number,
  watchesWithNew: number,
): string {
  if (totalNew > 0) {
    const watchPart =
      watchesWithNew === 1
        ? '1 watch has new listings'
        : `${watchesWithNew} watches have new listings`
    const listingPart =
      totalNew === 1 ? '1 new listing' : `${totalNew} new listings`
    return `${watchPart} — ${listingPart} waiting.`
  }

  return 'Nothing new since your last visit.'
}

export function getWatchStatusLabel(
  count: number,
  isChecking: boolean,
): string {
  if (isChecking) return 'Checking Facebook Marketplace…'
  if (count > 0) {
    return count === 1 ? '1 new listing' : `${count} new listings`
  }
  return 'Up to date'
}

export function getWorkspaceResultSummary(newCount: number): string {
  if (newCount === 0) return 'Nothing new since your last check.'
  return newCount === 1
    ? '1 new listing since your last check'
    : `${newCount} new listings since your last check`
}

export function getCheckCompleteMessage(newCount: number): string {
  if (newCount === 0) return "You're caught up."
  return newCount === 1
    ? 'Found 1 new listing.'
    : `Found ${newCount} new listings.`
}
