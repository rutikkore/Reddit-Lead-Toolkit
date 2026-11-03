import type {
  MatchInput,
  IntentResult,
  IntentSignal,
  IntentRule,
  IntentConfidence,
} from '../types'
import { normalize, tokenize, containsPhrase } from './text'
import {
  PURPOSE_PHRASES,
  REQUEST_PHRASES,
  SITUATION_PHRASES,
  INFORMATIONAL_PHRASES,
  OPINION_PHRASES,
  NEGATION_CUES,
  HEDGE_PHRASES,
  AMBIGUOUS_WORDS,
  ABBREVIATIONS,
  MAX_NEGATION_GAP_TOKENS,
  SHORT_TEXT_MEDIUM_THRESHOLD,
  SHORT_TEXT_LOW_THRESHOLD,
} from '../config/intentConfig'

interface SentenceInfo {
  raw: string
  normalized: string
  tokens: string[]
  hasQuestionMark: boolean
  field: 'title' | 'body'
}

/**
 * Splits text into sentence units while preventing mis-splits on periods
 * inside common abbreviations (e.g. "Pvt. Ltd." or "e.g.").
 */
function splitIntoSentences(text: string, field: 'title' | 'body'): SentenceInfo[] {
  if (!text || !text.trim()) {
    return []
  }

  // Mask periods inside abbreviations using null characters
  let masked = text
  for (const abbr of ABBREVIATIONS) {
    const escaped = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}`, 'gi')
    masked = masked.replace(regex, (match) => match.replace(/\./g, '\u0000'))
  }

  // Split on sentence boundaries: periods, question marks, exclamation marks, or newlines
  const segments: string[] = []
  let current = ''
  for (let i = 0; i < masked.length; i++) {
    const char = masked[i]
    current += char
    if (char === '.' || char === '?' || char === '!' || char === '\n' || char === '\r') {
      if (current.trim()) {
        segments.push(current)
      }
      current = ''
    }
  }
  if (current.trim()) {
    segments.push(current)
  }

  const results: SentenceInfo[] = []
  for (const seg of segments) {
    const unmasked = seg.replace(/\u0000/g, '.').trim()
    const normalized = normalize(unmasked)
    if (!normalized) {
      continue
    }
    results.push({
      raw: unmasked,
      normalized,
      tokens: tokenize(normalized),
      hasQuestionMark: seg.includes('?'),
      field,
    })
  }

  return results
}

/**
 * Finds the starting and ending token indices of a phrase within a token array.
 */
function findPhraseTokenIndices(
  tokens: string[],
  phraseTokens: string[]
): { start: number; end: number } | null {
  if (phraseTokens.length === 0 || tokens.length < phraseTokens.length) {
    return null
  }

  // Handle "need ... help" pattern (e.g. "need GST registration help")
  if (phraseTokens.length === 2 && phraseTokens[0] === 'need' && phraseTokens[1] === 'help') {
    const needIdx = tokens.indexOf('need')
    if (needIdx !== -1) {
      for (let j = needIdx + 1; j <= Math.min(tokens.length - 1, needIdx + 4); j++) {
        if (tokens[j] === 'help') {
          return { start: needIdx, end: j }
        }
      }
    }
  }

  for (let i = 0; i <= tokens.length - phraseTokens.length; i++) {
    let match = true
    for (let j = 0; j < phraseTokens.length; j++) {
      if (tokens[i + j] !== phraseTokens[j]) {
        match = false
        break
      }
    }
    if (match) {
      return { start: i, end: i + phraseTokens.length - 1 }
    }
  }
  return null
}

/**
 * Checks whether a request phrase exists in a normalized sentence,
 * allowing common noun-adjunct variations like "need [GST registration] help".
 */
function sentenceHasRequestPhrase(normSentence: string, req: string): boolean {
  if (containsPhrase(normSentence, req)) {
    return true
  }
  if (req === 'need help') {
    return /\bneed\b(?:\s+[a-z0-9&]+){1,3}\s+\bhelp\b/.test(normSentence)
  }
  return false
}


/**
 * Checks if a request phrase in a sentence is cancelled by an active negation cue.
 */
function isRequestCancelled(
  sentence: SentenceInfo,
  requestPhrase: string,
  hedgeSignals: string[]
): boolean {
  const reqTokens = tokenize(requestPhrase)
  const reqIndices = findPhraseTokenIndices(sentence.tokens, reqTokens)
  if (!reqIndices) {
    return false
  }

  for (const cue of NEGATION_CUES) {
    // If the cue is part of an active hedge in this sentence (e.g. "not" inside "not sure"), ignore it
    if (hedgeSignals.some((h) => containsPhrase(h, cue))) {
      continue
    }

    const cueTokens = tokenize(cue)
    const cueIndices = findPhraseTokenIndices(sentence.tokens, cueTokens)
    if (!cueIndices) {
      continue
    }

    // Negation cue must precede the request phrase
    if (cueIndices.end < reqIndices.start) {
      const gapTokens = reqIndices.start - cueIndices.end - 1
      if (gapTokens <= MAX_NEGATION_GAP_TOKENS) {
        // Check for clause boundaries (comma or "but") in the raw sentence between them
        // Approximate raw boundaries by locating cue and request in raw sentence
        const cuePos = sentence.raw.toLowerCase().indexOf(cueTokens[0])
        const reqPos = sentence.raw.toLowerCase().lastIndexOf(reqTokens[0])

        if (cuePos !== -1 && reqPos !== -1 && cuePos < reqPos) {
          const rawBetween = sentence.raw.slice(cuePos, reqPos)
          const hasClauseBoundary = /,|\bbut\b/i.test(rawBetween)
          if (!hasClauseBoundary) {
            return true
          }
        } else {
          return true
        }
      }
    }
  }

  return false
}

/**
 * Classifies the intent of a Reddit post based on sentence-aware text cues.
 * Pure function: text-only, no ML models, no service catalog dependency.
 */
export function classifyIntent(input: MatchInput): IntentResult {
  const titleSentences = splitIntoSentences(input.title, 'title')
  const bodySentences = splitIntoSentences(input.body, 'body')
  const allSentences = [...titleSentences, ...bodySentences]

  const signals: IntentSignal[] = []
  let hasPurpose = false
  let hasUncancelledRequest = false
  let hasSituation = false
  let hasQuestion = false
  let hasInformational = false
  let hasOpinion = false

  for (const sentence of allSentences) {
    if (sentence.hasQuestionMark) {
      hasQuestion = true
    }

    // 1. Check hedges
    const sentenceHedges: string[] = []
    for (const hedge of HEDGE_PHRASES) {
      if (containsPhrase(sentence.normalized, hedge)) {
        sentenceHedges.push(hedge)
        signals.push({ phrase: hedge, field: sentence.field, role: 'hedge' })
      }
    }

    // 2. Check negation cues
    for (const cue of NEGATION_CUES) {
      if (containsPhrase(sentence.normalized, cue)) {
        // Only record as negation signal if not part of a hedge
        if (!sentenceHedges.some((h) => containsPhrase(h, cue))) {
          signals.push({ phrase: cue, field: sentence.field, role: 'negation' })
        }
      }
    }

    // 3. Check purpose phrases
    for (const purpose of PURPOSE_PHRASES) {
      if (containsPhrase(sentence.normalized, purpose)) {
        hasPurpose = true
        signals.push({ phrase: purpose, field: sentence.field, role: 'purpose' })
      }
    }

    // 4. Check situation phrases
    for (const situation of SITUATION_PHRASES) {
      if (containsPhrase(sentence.normalized, situation)) {
        hasSituation = true
        signals.push({ phrase: situation, field: sentence.field, role: 'situation' })
      }
    }

    // 5. Check informational phrases
    for (const info of INFORMATIONAL_PHRASES) {
      if (containsPhrase(sentence.normalized, info)) {
        hasInformational = true
        signals.push({ phrase: info, field: sentence.field, role: 'informational' })
      }
    }

    // 6. Check opinion phrases
    for (const op of OPINION_PHRASES) {
      if (containsPhrase(sentence.normalized, op)) {
        hasOpinion = true
        signals.push({ phrase: op, field: sentence.field, role: 'opinion' })
      }
    }

    // 7. Check request phrases with sentence-aware negation cancellation
    for (const req of REQUEST_PHRASES) {
      if (sentenceHasRequestPhrase(sentence.normalized, req)) {
        const cancelled = isRequestCancelled(sentence, req, sentenceHedges)
        if (!cancelled) {
          hasUncancelledRequest = true
          signals.push({ phrase: req, field: sentence.field, role: 'request' })
        }
      }
    }
  }

  // Determine rule and category (first matching rule wins)
  let rule: IntentRule = 'no-intent-cue'
  let category: IntentResult['category'] = 'irrelevant'
  let confidence: IntentConfidence = 'medium'

  if (hasPurpose) {
    rule = 'purpose-override'
    category = 'research'
    confidence = 'high'
  } else if (hasUncancelledRequest && hasSituation) {
    rule = 'request-with-situation'
    category = 'genuine-need'
    confidence = 'high'
  } else if (hasSituation && hasQuestion && !hasUncancelledRequest) {
    rule = 'situation-question'
    category = 'genuine-need'
    confidence = 'medium'
  } else if (hasInformational && !hasSituation) {
    rule = 'informational'
    category = 'research'
    confidence = 'high'
  } else if (hasUncancelledRequest && !hasSituation && !hasInformational) {
    rule = 'request-only'
    category = 'genuine-need'
    confidence = 'medium'
  } else if (hasOpinion) {
    rule = 'opinion'
    category = 'casual'
    confidence = 'medium'
  } else {
    // Check for ambiguous legal/business words
    const combinedNorm = `${normalize(input.title)} ${normalize(input.body)}`
    const hasAmbiguousWord = AMBIGUOUS_WORDS.some((word) => containsPhrase(combinedNorm, word))
    if (hasAmbiguousWord) {
      rule = 'ambiguous'
      category = 'casual'
      confidence = 'low'
    } else {
      rule = 'no-intent-cue'
      category = 'irrelevant'
      confidence = 'medium'
    }
  }

  // Apply short-text confidence caps
  const totalTokens = tokenize(input.title).length + tokenize(input.body).length
  if (totalTokens < SHORT_TEXT_LOW_THRESHOLD) {
    confidence = 'low'
  } else if (totalTokens < SHORT_TEXT_MEDIUM_THRESHOLD) {
    if (confidence === 'high') {
      confidence = 'medium'
    }
  }

  return {
    category,
    confidence,
    rule,
    signals,
  }
}
