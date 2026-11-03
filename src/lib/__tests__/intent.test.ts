import { describe, it, expect } from 'vitest'
import type { MatchInput, IntentCategory } from '../../types'
import { classifyIntent } from '../intent'
import { normalize } from '../text'
import {
  PURPOSE_PHRASES,
  REQUEST_PHRASES,
  SITUATION_PHRASES,
  INFORMATIONAL_PHRASES,
  OPINION_PHRASES,
  NEGATION_CUES,
  HEDGE_PHRASES,
  AMBIGUOUS_WORDS,
} from '../../config/intentConfig'

describe('intent classification', () => {
  describe('negation handling', () => {
    // 1. "I don’t need a lawyer." -> not genuine-need
    it('cancels request when directly preceded by negation in the same sentence', () => {
      const input: MatchInput = {
        title: 'I don’t need a lawyer.',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).not.toBe('genuine-need')
    })

    // 2. "I’m not looking for GST registration." -> not genuine-need
    it('evaluates "not looking for" as not genuine-need', () => {
      const input: MatchInput = {
        title: 'I’m not looking for GST registration.',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).not.toBe('genuine-need')
    })

    // 3. "No need for legal help." -> not genuine-need
    it('evaluates "No need for" as not genuine-need', () => {
      const input: MatchInput = {
        title: 'No need for legal help.',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).not.toBe('genuine-need')
    })

    // 4. "Not sure, how do I register an LLP?" -> genuine-need, rule request-only
    it('does not cancel request when negation is part of a hedge like "not sure"', () => {
      const input: MatchInput = {
        title: 'Not sure, how do I register an LLP?',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
      expect(result.rule).toBe('request-only')
    })

    // 5. "I need a lawyer." -> genuine-need (control case)
    it('classifies un-negated request as genuine-need', () => {
      const input: MatchInput = {
        title: 'I need a lawyer.',
        body: 'Property dispute in progress',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
    })
  })

  describe('negation edge cases', () => {
    // 6. "I don’t have money. How do I register an LLP?" -> genuine-need (separate sentences)
    it('does not cancel request across separate sentences', () => {
      const input: MatchInput = {
        title: 'I don’t have money. How do I register an LLP?',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
    })

    // 7. "I don’t need a lawyer, but how do I file ITR?" -> genuine-need (clause boundary)
    it('does not cancel request when clause boundary (comma / "but") intervenes', () => {
      const input: MatchInput = {
        title: 'I don’t need a lawyer, but how do I file ITR?',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
    })

    // 8. Negation more than 3 tokens before the request -> documents known limit
    it('documents known limit: negation spanning more than 3 tokens does not cancel', () => {
      // Known limitation: the negation window is at most 3 normalized tokens.
      // In "I do not think that I will ever need a lawyer", 5 tokens intervene between
      // "do not" and "need a lawyer", so the request is not cancelled.
      const input: MatchInput = {
        title: 'I do not think that I will ever need a lawyer',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
    })
  })

  describe('core classification rules', () => {
    // 9. "How do I register a Pvt Ltd company?" -> genuine-need, rule request-only, confidence medium
    it('classifies standalone request as genuine-need with request-only rule and medium confidence', () => {
      const input: MatchInput = {
        title: 'How do I register a Pvt Ltd company?',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
      expect(result.rule).toBe('request-only')
      expect(result.confidence).toBe('medium')
    })

    // 10. "I am a freelancer. How do I register for GST?" -> genuine-need, rule request-with-situation, confidence high
    it('classifies request with situation as genuine-need with request-with-situation rule and high confidence', () => {
      const input: MatchInput = {
        title: 'I am a freelancer. How do I register for GST?',
        body: 'Earning over 20L per annum from consulting clients',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
      expect(result.rule).toBe('request-with-situation')
      expect(result.confidence).toBe('high')
    })

    // 11. "What is the difference between LLP and Pvt Ltd?" -> research, rule informational
    it('classifies comparative inquiry as research with informational rule', () => {
      const input: MatchInput = {
        title: 'What is the difference between LLP and Pvt Ltd?',
        body: 'Trying to understand corporate structures',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('research')
      expect(result.rule).toBe('informational')
    })

    // 12. "What is the process to register an LLP for my assignment?" -> research, rule purpose-override
    it('overrides request with research when academic/content purpose is present', () => {
      const input: MatchInput = {
        title: 'What is the process to register an LLP for my assignment?',
        body: 'Researching for a university business law paper',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('research')
      expect(result.rule).toBe('purpose-override')
    })

    // 13. "What is GST? I’m a freelancer earning 18L" -> genuine-need
    it('classifies question combined with personal situation as genuine-need', () => {
      const input: MatchInput = {
        title: 'What is GST? I’m a freelancer earning 18L',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
    })

    // 14. "Honestly the GST portal is a nightmare, rant" -> casual, rule opinion
    it('classifies opinion and venting expressions as casual', () => {
      const input: MatchInput = {
        title: 'Honestly the GST portal is a nightmare, rant',
        body: 'Servers down during filing deadlines again',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('casual')
      expect(result.rule).toBe('opinion')
    })

    // 15. "Anyone watched the match last night?" -> irrelevant, rule no-intent-cue
    it('classifies discussion without legal or commercial intent cues as irrelevant', () => {
      const input: MatchInput = {
        title: 'Anyone watched the match last night?',
        body: 'Great finish to the fourth quarter',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('irrelevant')
      expect(result.rule).toBe('no-intent-cue')
    })

    // 16. "My landlord sent a notice, is that normal?" -> genuine-need, rule situation-question, confidence medium
    it('classifies situation with a question mark as situation-question with medium confidence', () => {
      const input: MatchInput = {
        title: 'My landlord sent a notice, is that normal?',
        body: 'Demanding immediate rent increase without notice period',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
      expect(result.rule).toBe('situation-question')
      expect(result.confidence).toBe('medium')
    })
  })

  describe('short text handling & confidence capping', () => {
    // 17. "Need GST registration help" -> genuine-need, confidence at most medium
    it('caps confidence at medium for text under 5 normalized tokens', () => {
      const input: MatchInput = {
        title: 'Need GST registration help',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
      expect(['medium', 'low']).toContain(result.confidence)
    })

    // 18. "LLP?" -> not genuine-need, confidence low
    it('caps confidence at low for text under 3 normalized tokens', () => {
      const input: MatchInput = {
        title: 'LLP?',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).not.toBe('genuine-need')
      expect(result.confidence).toBe('low')
    })

    // 19. Empty title and body -> irrelevant, confidence low
    it('classifies empty input as irrelevant with low confidence', () => {
      const input: MatchInput = {
        title: '',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('irrelevant')
      expect(result.confidence).toBe('low')
    })
  })

  describe('abbreviations and sentence splitting', () => {
    it('does not mis-split sentences on "Pvt. Ltd." abbreviations', () => {
      const input: MatchInput = {
        title: 'How do I register a Pvt. Ltd. company?',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
      expect(result.rule).toBe('request-only')
    })

    it('does not mis-split sentences on "e.g." abbreviations', () => {
      const input: MatchInput = {
        title: 'I have an issue, e.g. landlord problem. What should I do?',
        body: '',
      }
      const result = classifyIntent(input)
      expect(result.category).toBe('genuine-need')
    })
  })

  describe('signals and determinism', () => {
    // 20. signals lists only phrases that fired. Each field is title or body.
    it('records detected signals with appropriate roles and fields', () => {
      const input: MatchInput = {
        title: 'Not sure, how do I register an LLP?',
        body: 'I am a founder in Delhi',
      }
      const result = classifyIntent(input)
      expect(result.signals.length).toBeGreaterThan(0)

      for (const sig of result.signals) {
        expect(['title', 'body']).toContain(sig.field)
        expect([
          'request',
          'situation',
          'informational',
          'purpose',
          'opinion',
          'negation',
          'hedge',
        ]).toContain(sig.role)
      }

      expect(result.signals.some((s) => s.role === 'hedge' && s.phrase === 'not sure')).toBe(true)
      expect(result.signals.some((s) => s.role === 'request' && s.phrase === 'how do i')).toBe(true)
      expect(result.signals.some((s) => s.role === 'situation' && s.phrase === 'i am')).toBe(true)
    })

    // 21. Same input gives identical output on repeat calls
    it('produces deterministic output across multiple invocations', () => {
      const input: MatchInput = {
        title: 'I am starting an enterprise. Where can I find legal counsel?',
        body: 'Need help with founder agreement',
      }
      const res1 = classifyIntent(input)
      const res2 = classifyIntent(input)
      expect(res1).toEqual(res2)
    })

    // 22. Input is not mutated
    it('does not mutate input objects', () => {
      const input: MatchInput = {
        title: 'Need help with company registration',
        body: 'What is the procedure',
      }
      const copy = JSON.parse(JSON.stringify(input))
      classifyIntent(input)
      expect(input).toEqual(copy)
    })
  })

  describe('config and type integrity', () => {
    // 23. Every config phrase is non-empty after normalization
    it('ensures every phrase in intentConfig normalizes to non-empty string', () => {
      const allPhraseLists = [
        PURPOSE_PHRASES,
        REQUEST_PHRASES,
        SITUATION_PHRASES,
        INFORMATIONAL_PHRASES,
        OPINION_PHRASES,
        NEGATION_CUES,
        HEDGE_PHRASES,
        AMBIGUOUS_WORDS,
      ]

      for (const list of allPhraseLists) {
        for (const phrase of list) {
          expect(normalize(phrase).length).toBeGreaterThan(0)
        }
      }
    })

    // 24. No phrase appears in two categories without a comment
    it('ensures phrase categories do not overlap unexpectedly', () => {
      const categories: Record<string, readonly string[]> = {
        purpose: PURPOSE_PHRASES,
        request: REQUEST_PHRASES,
        situation: SITUATION_PHRASES,
        informational: INFORMATIONAL_PHRASES,
        opinion: OPINION_PHRASES,
        ambiguous: AMBIGUOUS_WORDS,
      }

      const seen = new Map<string, string>()
      for (const [catName, phrases] of Object.entries(categories)) {
        for (const phrase of phrases) {
          const norm = normalize(phrase)
          if (seen.has(norm)) {
            throw new Error(`Phrase "${phrase}" appears in both "${seen.get(norm)}" and "${catName}"`)
          }
          seen.set(norm, catName)
        }
      }
    })

    // 25. Every category is one of the four IntentCategory values
    it('ensures classification results always return valid IntentCategory values', () => {
      const validCategories: IntentCategory[] = [
        'genuine-need',
        'research',
        'casual',
        'irrelevant',
      ]

      const testCases: MatchInput[] = [
        { title: 'How do I register', body: 'I am a founder' },
        { title: 'What is LLP', body: '' },
        { title: 'Honestly terrible', body: '' },
        { title: 'Random chat', body: '' },
      ]

      for (const tc of testCases) {
        const res = classifyIntent(tc)
        expect(validCategories).toContain(res.category)
      }
    })
  })
})

