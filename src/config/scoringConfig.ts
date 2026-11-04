import type { IntentCategory, IntentConfidence } from '../types'

/**
 * Scoring configuration for lead prioritization.
 *
 * NOTE: All values are unvalidated prototype starting values.
 * They are heuristic weights for sorting review queues, NOT calibrated
 * probabilities or predictions of real customer conversion.
 */

/** Points per unit of service relevance (unvalidated prototype starting value) */
export const RELEVANCE_POINTS_PER_UNIT = 5

/** Maximum relevance points that can contribute to the score (unvalidated prototype starting value) */
export const RELEVANCE_POINTS_MAX = 30

/**
 * Points awarded by intent category and confidence level.
 * Unvalidated prototype starting values.
 */
export const INTENT_POINTS: Record<IntentCategory, Record<IntentConfidence, number>> = {
  'genuine-need': {
    high: 40,
    medium: 30,
    low: 15,
  },
  research: {
    high: 5,
    medium: 5,
    low: 5,
  },
  casual: {
    high: 0,
    medium: 0,
    low: 0,
  },
  irrelevant: {
    high: 0,
    medium: 0,
    low: 0,
  },
}

/** Maximum score ceiling for genuine-need when no service matches exist (unvalidated prototype value) */
export const NO_MATCH_GENUINE_CEILING = 39

/** Maximum score ceiling for research intent (unvalidated prototype value) */
export const RESEARCH_CEILING = 39

/** Maximum score ceiling for casual intent (unvalidated prototype value) */
export const CASUAL_CEILING = 39

/** Maximum score ceiling for irrelevant intent (unvalidated prototype value) */
export const IRRELEVANT_CEILING = 15

/** Minimum allowed final score (unvalidated prototype clamp boundary) */
export const SCORE_MIN = 0

/** Maximum allowed final score (unvalidated prototype clamp boundary) */
export const SCORE_MAX = 100

/** Minimum score for the medium priority band (unvalidated prototype threshold) */
export const BAND_MEDIUM_MIN = 40

/** Minimum score for the high priority band (unvalidated prototype threshold) */
export const BAND_HIGH_MIN = 70

