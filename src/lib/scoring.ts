import type {
  IntentResult,
  LeadScoreResult,
  PriorityBand,
  ScoreFactor,
} from '../types'
import type { MatchResult } from './matching'
import {
  RELEVANCE_POINTS_PER_UNIT,
  RELEVANCE_POINTS_MAX,
  INTENT_POINTS,
  NO_MATCH_GENUINE_CEILING,
  RESEARCH_CEILING,
  CASUAL_CEILING,
  IRRELEVANT_CEILING,
  SCORE_MIN,
  SCORE_MAX,
  BAND_MEDIUM_MIN,
  BAND_HIGH_MIN,
} from '../config/scoringConfig'

export interface ScoringConfig {
  RELEVANCE_POINTS_PER_UNIT: number
  RELEVANCE_POINTS_MAX: number
  INTENT_POINTS: typeof INTENT_POINTS
  NO_MATCH_GENUINE_CEILING: number
  RESEARCH_CEILING: number
  CASUAL_CEILING: number
  IRRELEVANT_CEILING: number
  SCORE_MIN: number
  SCORE_MAX: number
  BAND_MEDIUM_MIN: number
  BAND_HIGH_MIN: number
}

const DEFAULT_CONFIG: ScoringConfig = {
  RELEVANCE_POINTS_PER_UNIT,
  RELEVANCE_POINTS_MAX,
  INTENT_POINTS,
  NO_MATCH_GENUINE_CEILING,
  RESEARCH_CEILING,
  CASUAL_CEILING,
  IRRELEVANT_CEILING,
  SCORE_MIN,
  SCORE_MAX,
  BAND_MEDIUM_MIN,
  BAND_HIGH_MIN,
}

/**
 * Pure, deterministic scoring engine that combines Stage 2 service matching
 * relevance and Stage 3 intent classification into a prioritized lead score.
 *
 * NOTE: The returned score is a prototype heuristic to rank opportunities for
 * manual human review. It is NOT a validated conversion prediction or
 * statistical probability of closing a customer.
 */
export function scoreLead(
  intent: IntentResult,
  matches: readonly MatchResult[],
  configOverrides?: Partial<ScoringConfig>,
): LeadScoreResult {
  const config = configOverrides ? { ...DEFAULT_CONFIG, ...configOverrides } : DEFAULT_CONFIG
  const factors: ScoreFactor[] = []
  const capsApplied: string[] = []

  // 1. Service relevance points
  // Find highest relevance across all matches; default to 0 if empty, negative, or non-finite
  let topRelevance = 0
  for (const m of matches) {
    const rel = m.match?.relevance
    if (typeof rel === 'number' && Number.isFinite(rel) && rel > topRelevance) {
      topRelevance = rel
    }
  }

  const relevancePoints = Math.min(
    Math.round(topRelevance * config.RELEVANCE_POINTS_PER_UNIT),
    config.RELEVANCE_POINTS_MAX,
  )

  factors.push({
    label: 'service-relevance',
    points: relevancePoints,
    reason:
      topRelevance > 0
        ? `Top service match relevance ${topRelevance} scaled to ${relevancePoints} points (max ${config.RELEVANCE_POINTS_MAX})`
        : 'No matching service found (0 points)',
  })

  // 2. Intent points
  const categoryIntentPoints = config.INTENT_POINTS[intent.category]
  const intentPoints = categoryIntentPoints ? categoryIntentPoints[intent.confidence] ?? 0 : 0

  factors.push({
    label: `intent-${intent.category}`,
    points: intentPoints,
    reason: `Intent classified as ${intent.category} with ${intent.confidence} confidence (+${intentPoints} points)`,
  })

  // 3. Category ceilings & caps
  const preCapScore = relevancePoints + intentPoints
  let capPoints = 0
  let ceiling: number | null = null
  let capLabel = ''
  let capReason = ''

  if (intent.category === 'genuine-need' && matches.length === 0) {
    ceiling = config.NO_MATCH_GENUINE_CEILING
    capLabel = 'no-service-match-cap'
    capReason = `Genuine-need with no service matches capped at ${ceiling}`
  } else if (intent.category === 'research') {
    ceiling = config.RESEARCH_CEILING
    capLabel = 'research-ceiling-cap'
    capReason = `Research intent capped at ${ceiling}`
  } else if (intent.category === 'casual') {
    ceiling = config.CASUAL_CEILING
    capLabel = 'casual-ceiling-cap'
    capReason = `Casual intent capped at ${ceiling}`
  } else if (intent.category === 'irrelevant') {
    ceiling = config.IRRELEVANT_CEILING
    capLabel = 'irrelevant-ceiling-cap'
    capReason = `Irrelevant intent capped at ${ceiling}`
  }

  if (ceiling !== null && preCapScore > ceiling) {
    capPoints = ceiling - preCapScore // strictly negative
    capsApplied.push(capLabel)
    factors.push({
      label: capLabel,
      points: capPoints,
      reason: capReason,
    })
  }

  // 4. Clamping to [SCORE_MIN, SCORE_MAX]
  const preClampScore = preCapScore + capPoints
  const score = Math.min(config.SCORE_MAX, Math.max(config.SCORE_MIN, preClampScore))
  const clampPoints = score - preClampScore

  if (clampPoints !== 0) {
    factors.push({
      label: 'score-clamp',
      points: clampPoints,
      reason:
        clampPoints < 0
          ? `Score clamped down to maximum of ${config.SCORE_MAX}`
          : `Score clamped up to minimum of ${config.SCORE_MIN}`,
    })
  }

  // 5. Priority band
  let band: PriorityBand = 'low'
  if (score >= config.BAND_HIGH_MIN) {
    band = 'high'
  } else if (score >= config.BAND_MEDIUM_MIN) {
    band = 'medium'
  } else {
    band = 'low'
  }

  return {
    score,
    band,
    factors,
    capsApplied,
  }
}
