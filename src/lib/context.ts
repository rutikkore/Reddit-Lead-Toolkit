import type {
  MatchInput,
  OpportunityContext,
  ContextIndicator,
} from '../types'
import { normalize, containsPhrase } from './text'
import {
  TIMELINE_PHRASES,
  MONTH_NAMES,
  URGENCY_PHRASES,
  URGENCY_NEGATION_CUES,
  BUDGET_RAW_SYMBOLS,
  BUDGET_PHRASES,
  INDIAN_LOCATIONS,
} from '../config/contextConfig'

/**
 * Checks for explicit month-name dates such as "July 31" or "31 July".
 * Numeric dates like "31/07" are intentionally excluded.
 */
function extractExplicitDates(
  normText: string,
  field: 'title' | 'body',
): ContextIndicator[] {
  const indicators: ContextIndicator[] = []
  if (!normText) return indicators

  const monthRegexPart = MONTH_NAMES.join('|')

  // Pattern 1: <month> <day> (e.g., "july 31", "jul 31")
  const monthDayRegex = new RegExp(`\\b(${monthRegexPart})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'gi')
  let match: RegExpExecArray | null
  while ((match = monthDayRegex.exec(normText)) !== null) {
    const day = parseInt(match[2], 10)
    if (day >= 1 && day <= 31) {
      indicators.push({
        kind: 'timeline',
        label: 'explicit-date',
        evidence: match[0],
        field,
      })
    }
  }

  // Pattern 2: <day> <month> (e.g., "31 july", "31 jul")
  const dayMonthRegex = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthRegexPart})\\b`, 'gi')
  while ((match = dayMonthRegex.exec(normText)) !== null) {
    const day = parseInt(match[1], 10)
    if (day >= 1 && day <= 31) {
      indicators.push({
        kind: 'timeline',
        label: 'explicit-date',
        evidence: match[0],
        field,
      })
    }
  }

  return indicators
}

/**
 * Checks for urgency phrases, applying a simple local negation guard
 * within clauses so phrases like "not urgent at all" or "no rush" are not flagged.
 */
function extractUrgencyCues(
  rawText: string,
  field: 'title' | 'body',
): ContextIndicator[] {
  const indicators: ContextIndicator[] = []
  if (!rawText.trim()) return indicators

  // Split on clause boundaries (commas, semicolons, punctuation, or conjunctions like "but")
  const clauses = rawText.split(/[,;.!?\n\r]+|\bbut\b|\bhowever\b/i)

  for (const rawClause of clauses) {
    const normClause = normalize(rawClause)
    if (!normClause) continue

    const paddedClause = ` ${normClause} `
    const clauseTokens = normClause.split(' ')

    for (const urgencyPhrase of URGENCY_PHRASES) {
      const paddedUrgency = ` ${urgencyPhrase} `
      if (!paddedClause.includes(paddedUrgency)) {
        continue
      }

      // Local negation guard: check if a negation cue precedes urgency within 1 to 3 words
      const urgencyWords = urgencyPhrase.split(' ')
      const firstUrgencyWord = urgencyWords[0]
      const urgencyIdx = clauseTokens.indexOf(firstUrgencyWord)

      let isNegated = false
      if (urgencyIdx > 0) {
        // Look back up to 3 tokens
        const lookbackStart = Math.max(0, urgencyIdx - 3)
        for (let i = urgencyIdx - 1; i >= lookbackStart; i--) {
          const token = clauseTokens[i]
          if (URGENCY_NEGATION_CUES.includes(token)) {
            isNegated = true
            break
          }
          // Also check 2-word negation cues like "don t" or "do not"
          if (i > lookbackStart) {
            const twoWordCue = `${clauseTokens[i - 1]} ${token}`
            if (URGENCY_NEGATION_CUES.includes(twoWordCue)) {
              isNegated = true
              break
            }
          }
        }
      }

      if (!isNegated) {
        indicators.push({
          kind: 'urgency',
          label: 'urgency-cue',
          evidence: urgencyPhrase,
          field,
        })
      }
    }
  }

  return indicators
}

/**
 * Pure, deterministic extractor for Opportunity Context clues.
 * Analyzes title and body text for timelines, explicit urgency, Indian locations,
 * and possible budget mentions.
 *
 * NOTE: All extracted indicators are heuristic clues for triage.
 * They do not constitute verified customer facts or financial guarantees.
 */
export function extractContext(input: MatchInput): OpportunityContext {
  const rawTitle = input.title ?? ''
  const rawBody = input.body ?? ''
  const normTitle = normalize(rawTitle)
  const normBody = normalize(rawBody)

  const timelineIndicators: ContextIndicator[] = []
  const urgencyIndicators: ContextIndicator[] = []
  const locationIndicators: ContextIndicator[] = []
  const budgetIndicators: ContextIndicator[] = []
  const statedLocationsSet = new Set<string>()

  const fields: Array<{ raw: string; norm: string; fieldName: 'title' | 'body' }> = [
    { raw: rawTitle, norm: normTitle, fieldName: 'title' },
    { raw: rawBody, norm: normBody, fieldName: 'body' },
  ]

  // 1. Timeline Detection
  for (const { norm, fieldName } of fields) {
    if (!norm) continue

    // Configured timeline phrases
    for (const phrase of TIMELINE_PHRASES) {
      if (containsPhrase(norm, phrase)) {
        timelineIndicators.push({
          kind: 'timeline',
          label: 'timeline-cue',
          evidence: phrase,
          field: fieldName,
        })
      }
    }

    // Explicit dates (e.g. "July 31", "31 July")
    const dateIndicators = extractExplicitDates(norm, fieldName)
    timelineIndicators.push(...dateIndicators)
  }

  // 2. Urgency Detection (with local negation guard)
  for (const { raw, fieldName } of fields) {
    const urgency = extractUrgencyCues(raw, fieldName)
    urgencyIndicators.push(...urgency)
  }

  // 3. Explicit Location Detection (whole-phrase matching against allowlist)
  for (const { norm, fieldName } of fields) {
    if (!norm) continue
    for (const location of INDIAN_LOCATIONS) {
      if (containsPhrase(norm, location)) {
        locationIndicators.push({
          kind: 'location',
          label: 'stated-location',
          evidence: location,
          field: fieldName,
        })
        statedLocationsSet.add(location)
      }
    }
  }

  // 4. Budget Mention Detection
  // Check raw text for currency symbols (e.g. ₹) and normalized text for terms (e.g. rs, lakh, budget)
  for (const { raw, norm, fieldName } of fields) {
    let budgetDetectedInField = false

    // Check raw currency symbols
    for (const symbol of BUDGET_RAW_SYMBOLS) {
      if (raw.includes(symbol)) {
        budgetIndicators.push({
          kind: 'budget',
          label: 'possible-budget-mention',
          evidence: symbol,
          field: fieldName,
        })
        budgetDetectedInField = true
        break
      }
    }

    // Check budget keywords/phrases
    if (!budgetDetectedInField && norm) {
      for (const phrase of BUDGET_PHRASES) {
        if (containsPhrase(norm, phrase)) {
          budgetIndicators.push({
            kind: 'budget',
            label: 'possible-budget-mention',
            evidence: phrase,
            field: fieldName,
          })
          break
        }
      }
    }
  }

  // Assemble indicators in strict category order:
  // 1. Timeline, 2. Urgency, 3. Location, 4. Budget
  const indicators: ContextIndicator[] = [
    ...timelineIndicators,
    ...urgencyIndicators,
    ...locationIndicators,
    ...budgetIndicators,
  ]

  const timelineLevel: 'none' | 'mentioned' =
    timelineIndicators.length > 0 ? 'mentioned' : 'none'

  const budgetMentioned = budgetIndicators.length > 0

  return {
    timelineLevel,
    indicators,
    statedLocations: Array.from(statedLocationsSet),
    budgetMentioned,
  }
}

