/**
 * Reusable text-processing utilities for Reddit lead intelligence.
 *
 * Note: Normalization is ASCII-oriented ([a-z0-9\s&]); non-Latin scripts
 * are outside Stage 1 scope.
 */

/**
 * Normalizes input text:
 * - Converts to lowercase.
 * - Replaces characters that are not letters, digits, whitespace, or '&' with spaces.
 * - Collapses repeated whitespace.
 * - Trims leading and trailing whitespace.
 * - Returns an empty string for empty input.
 */
export function normalize(input: string): string {
  if (!input) {
    return ''
  }
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tokenizes input text by normalizing it and splitting on spaces.
 * Returns an empty array for empty input or input that normalizes to empty.
 */
export function tokenize(input: string): string[] {
  const normalized = normalize(input)
  if (!normalized) {
    return []
  }
  return normalized.split(' ')
}

/**
 * Checks whether haystack contains the given phrase as a whole phrase match.
 * Normalizes both arguments. Uses padded strings to match whole phrases and
 * prevent accidental substring matches inside words.
 * Returns false if the normalized phrase is empty.
 *
 * Known limitation: Weak-keyword handling (e.g. containsPhrase("cricket ICC final", "ICC")
 * returns true) is deferred to Stage 2.
 */
export function containsPhrase(haystack: string, phrase: string): boolean {
  const normPhrase = normalize(phrase)
  if (!normPhrase) {
    return false
  }
  const normHaystack = normalize(haystack)
  if (!normHaystack) {
    return false
  }
  const paddedHaystack = ` ${normHaystack} `
  const paddedPhrase = ` ${normPhrase} `
  return paddedHaystack.includes(paddedPhrase)
}

/**
 * Scans haystack for the given list of candidate phrases.
 * Returns matching phrases in their original form.
 * Preserves the original order.
 * Returns each matching phrase only once.
 * Ignores phrases that normalize to empty.
 */
export function countPhraseHits(haystack: string, phrases: string[]): string[] {
  const normHaystack = normalize(haystack)
  if (!normHaystack) {
    return []
  }
  const paddedHaystack = ` ${normHaystack} `
  const results: string[] = []
  const seen = new Set<string>()

  for (const phrase of phrases) {
    const normPhrase = normalize(phrase)
    if (!normPhrase) {
      continue
    }
    const paddedPhrase = ` ${normPhrase} `
    if (paddedHaystack.includes(paddedPhrase)) {
      if (!seen.has(phrase)) {
        seen.add(phrase)
        results.push(phrase)
      }
    }
  }

  return results
}

