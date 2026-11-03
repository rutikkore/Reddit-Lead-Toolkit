import type { Service, ServiceMatch, MatchInput, MatchDetail } from '../types'
import { containsPhrase, normalize } from './text'
import {
  TITLE_WEIGHT,
  BODY_WEIGHT,
  WEAK_KEYWORD_MULTIPLIER,
  MAX_MATCHES,
  MIN_RELEVANCE,
  WEAK_KEYWORDS,
} from '../config/matchingConfig'

export interface MatchResult {
  match: ServiceMatch
  details: MatchDetail[]
  warnings: string[]
}

/** Pre-computed normalized set of weak keywords for efficient, case-insensitive comparison */
const NORMALIZED_WEAK_KEYWORDS = new Set(WEAK_KEYWORDS.map((k) => normalize(k)))

/**
 * Prototype heuristic, not validated. Returns service relevance based on
 * keyword overlap with the post title and body. This is not user intent,
 * lead priority, or a prediction of customer conversion. Input is ASCII
 * only; non-Latin text is out of scope.
 */
export function matchServices(input: MatchInput, services: readonly Service[]): MatchResult[] {
  const normalizedTitle = normalize(input.title)
  const normalizedBody = normalize(input.body)

  if (!normalizedTitle && !normalizedBody) {
    return []
  }

  const results: MatchResult[] = []

  for (const service of services) {
    const details: MatchDetail[] = []
    const warnings: string[] = []

    for (const keyword of service.keywords) {
      const normalizedKeyword = normalize(keyword)
      if (!normalizedKeyword) {
        warnings.push(`empty keyword in ${service.id}`)
        continue
      }

      const isWeak = NORMALIZED_WEAK_KEYWORDS.has(normalizedKeyword)

      let location: 'title' | 'body' | null = null
      let base = 0

      if (normalizedTitle && containsPhrase(normalizedTitle, keyword)) {
        base = TITLE_WEIGHT
        location = 'title'
      } else if (normalizedBody && containsPhrase(normalizedBody, keyword)) {
        base = BODY_WEIGHT
        location = 'body'
      } else {
        continue
      }

      const contribution = base * (isWeak ? WEAK_KEYWORD_MULTIPLIER : 1)
      details.push({
        keyword,
        location,
        weight: contribution,
      })
    }

    const rawRelevance = details.reduce((sum, d) => sum + d.weight, 0)
    const relevance = Math.round(rawRelevance * 10) / 10

    if (relevance >= MIN_RELEVANCE) {
      results.push({
        match: {
          serviceId: service.id,
          relevance,
          matchedKeywords: details.map((d) => d.keyword),
        },
        details,
        warnings,
      })
    }
  }

  results.sort((a, b) => {
    if (b.match.relevance !== a.match.relevance) {
      return b.match.relevance - a.match.relevance
    }
    return a.match.serviceId.localeCompare(b.match.serviceId)
  })

  return results.slice(0, MAX_MATCHES)
}

