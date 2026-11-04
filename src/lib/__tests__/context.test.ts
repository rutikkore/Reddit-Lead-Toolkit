import { describe, it, expect } from 'vitest'
import type { MatchInput } from '../../types'
import { extractContext } from '../context'
import { normalize } from '../text'
import {
  TIMELINE_PHRASES,
  MONTH_NAMES,
  URGENCY_PHRASES,
  BUDGET_PHRASES,
  INDIAN_LOCATIONS,
} from '../../config/contextConfig'
import { scoreLead } from '../scoring'
import { classifyIntent } from '../intent'
import { matchServices } from '../matching'
import { ALL_SERVICES } from '../../data/services'

describe('Opportunity Context Extraction', () => {
  describe('Timeline detection', () => {
    it('detects "by Friday" as a timeline cue and sets timelineLevel to mentioned', () => {
      const input: MatchInput = {
        title: 'I need this done by Friday.',
        body: 'Looking for incorporation assistance.',
      }
      const context = extractContext(input)
      expect(context.timelineLevel).toBe('mentioned')
      const indicator = context.indicators.find((i) => i.kind === 'timeline')!
      expect(indicator).toBeDefined()
      expect(indicator.evidence).toBe('by friday')
      expect(indicator.field).toBe('title')
    })

    it('detects explicit month-name date "July 31" as a timeline cue', () => {
      const input: MatchInput = {
        title: 'Tax filing question',
        body: 'Deadline is July 31.',
      }
      const context = extractContext(input)
      expect(context.timelineLevel).toBe('mentioned')
      const dateIndicator = context.indicators.find(
        (i) => i.kind === 'timeline' && i.label === 'explicit-date',
      )!
      expect(dateIndicator).toBeDefined()
      expect(dateIndicator.evidence).toBe('july 31')
      expect(dateIndicator.field).toBe('body')
    })

    it('detects explicit day-month date "31 July"', () => {
      const input: MatchInput = {
        title: 'Need ITR filed before 31 July',
        body: '',
      }
      const context = extractContext(input)
      expect(context.timelineLevel).toBe('mentioned')
      const dateIndicator = context.indicators.find(
        (i) => i.kind === 'timeline' && i.label === 'explicit-date',
      )!
      expect(dateIndicator).toBeDefined()
      expect(dateIndicator.evidence).toBe('31 july')
    })

    it('detects "within 7 days"', () => {
      const input: MatchInput = {
        title: 'Within 7 days please.',
        body: 'Need urgent incorporation docs',
      }
      const context = extractContext(input)
      expect(context.timelineLevel).toBe('mentioned')
      expect(context.indicators.some((i) => i.evidence === 'within 7 days')).toBe(true)
    })

    it('does not treat slash-separated numeric date "31/07" as a supported explicit date', () => {
      const input: MatchInput = {
        title: 'Filing by 31/07',
        body: 'Is there any penalty?',
      }
      const context = extractContext(input)
      // Numeric slash dates are not supported explicit dates
      expect(context.indicators.some((i) => i.label === 'explicit-date')).toBe(false)
      expect(context.timelineLevel).toBe('none')
    })
  })

  describe('Urgency detection and local negation guard', () => {
    it('detects explicit urgency phrases like "urgent" and "ASAP"', () => {
      const input: MatchInput = {
        title: 'This is urgent, help ASAP.',
        body: '',
      }
      const context = extractContext(input)
      const urgencyIndicators = context.indicators.filter((i) => i.kind === 'urgency')
      expect(urgencyIndicators.length).toBeGreaterThanOrEqual(1)
      expect(urgencyIndicators.some((i) => i.evidence === 'urgent')).toBe(true)
      expect(urgencyIndicators.some((i) => i.evidence === 'asap')).toBe(true)
    })

    it('does not detect urgency when negated ("Not urgent at all, just curious.")', () => {
      const input: MatchInput = {
        title: 'Not urgent at all, just curious.',
        body: 'How long does trademark registration take?',
      }
      const context = extractContext(input)
      const urgencyIndicators = context.indicators.filter((i) => i.kind === 'urgency')
      expect(urgencyIndicators).toEqual([])
    })

    it('does not detect urgency when negated with "no rush" ("No rush at all.")', () => {
      const input: MatchInput = {
        title: 'General inquiry on copyright',
        body: 'No rush at all.',
      }
      const context = extractContext(input)
      const urgencyIndicators = context.indicators.filter((i) => i.kind === 'urgency')
      expect(urgencyIndicators).toEqual([])
    })

    it('handles negated urgency with a separate timeline cue in the same sentence', () => {
      const input: MatchInput = {
        title: 'This is not urgent, but I need it by Friday',
        body: '',
      }
      const context = extractContext(input)
      // Urgency is negated and should not be detected
      const urgencyIndicators = context.indicators.filter((i) => i.kind === 'urgency')
      expect(urgencyIndicators).toEqual([])
      // Timeline cue "by friday" across the clause boundary should still be detected
      expect(context.timelineLevel).toBe('mentioned')
      expect(context.indicators.some((i) => i.evidence === 'by friday')).toBe(true)
    })
  })

  describe('Location detection', () => {
    it('detects an explicitly stated city (Mumbai)', () => {
      const input: MatchInput = {
        title: 'Looking for a corporate lawyer in Mumbai',
        body: '',
      }
      const context = extractContext(input)
      expect(context.statedLocations).toContain('Mumbai')
      const locIndicator = context.indicators.find((i) => i.kind === 'location')!
      expect(locIndicator).toBeDefined()
      expect(locIndicator.evidence).toBe('Mumbai')
    })

    it('detects an explicitly stated Indian state (Maharashtra)', () => {
      const input: MatchInput = {
        title: 'Property query',
        body: 'Land registered in Maharashtra.',
      }
      const context = extractContext(input)
      expect(context.statedLocations).toContain('Maharashtra')
    })

    it('detects multiple explicitly stated locations', () => {
      const input: MatchInput = {
        title: 'Moving business from Pune to Bangalore',
        body: 'Need help with tax jurisdiction change.',
      }
      const context = extractContext(input)
      expect(context.statedLocations).toContain('Pune')
      expect(context.statedLocations).toContain('Bangalore')
    })

    it('deduplicates repeated location mentions', () => {
      const input: MatchInput = {
        title: 'Lawyer in Delhi',
        body: 'Our office is located in Delhi and the court is in Delhi.',
      }
      const context = extractContext(input)
      const delhiCount = context.statedLocations.filter((l) => l === 'Delhi').length
      expect(delhiCount).toBe(1)
    })

    it('prevents substring false positives (e.g. "goal" must not match "Goa", "punitive" not "Pune")', () => {
      const input: MatchInput = {
        title: 'Our company goal is punitive damages in assembly election',
        body: 'No geographic location is stated here.',
      }
      const context = extractContext(input)
      expect(context.statedLocations).not.toContain('Goa')
      expect(context.statedLocations).not.toContain('Pune')
      expect(context.statedLocations).not.toContain('Assam')
      expect(context.statedLocations).toEqual([])
    })

    it('does not infer location when not explicitly stated in title or body', () => {
      const input: MatchInput = {
        title: 'How do I incorporate a Pvt Ltd?',
        body: 'We are a 2-person software team.',
      }
      const context = extractContext(input)
      expect(context.statedLocations).toEqual([])
    })
  })

  describe('Budget detection', () => {
    it('detects currency symbol ₹ in raw text', () => {
      const input: MatchInput = {
        title: 'Budget is around ₹10–15k.',
        body: '',
      }
      const context = extractContext(input)
      expect(context.budgetMentioned).toBe(true)
      const budgetIndicator = context.indicators.find((i) => i.kind === 'budget')!
      expect(budgetIndicator).toBeDefined()
      expect(budgetIndicator.evidence).toBe('₹')
    })

    it('detects "Rs" currency mention in body', () => {
      const input: MatchInput = {
        title: 'Consulting fees',
        body: 'Rs 50000 per month.',
      }
      const context = extractContext(input)
      expect(context.budgetMentioned).toBe(true)
      expect(context.indicators.some((i) => i.evidence === 'rs')).toBe(true)
    })

    it('detects "lakh" and "lakhs" mentions', () => {
      const input1: MatchInput = {
        title: 'Startup capital is 25 lakh',
        body: '',
      }
      expect(extractContext(input1).budgetMentioned).toBe(true)

      const input2: MatchInput = {
        title: 'Annual turnover',
        body: 'We made 10 lakhs in revenue.',
      }
      expect(extractContext(input2).budgetMentioned).toBe(true)
    })

    it('sets budgetMentioned to false when no budget or currency cues exist', () => {
      const input: MatchInput = {
        title: 'Need a trademark for our company name',
        body: 'How long does the registration take?',
      }
      const context = extractContext(input)
      expect(context.budgetMentioned).toBe(false)
      expect(context.indicators.some((i) => i.kind === 'budget')).toBe(false)
    })

    it('does not extract or store the actual numerical amount in the result', () => {
      const input: MatchInput = {
        title: 'Budget is around ₹10–15k.',
        body: 'We have Rs 50000 available.',
      }
      const context = extractContext(input)
      expect(context.budgetMentioned).toBe(true)
      // Verify no amount property was added to context
      expect((context as unknown as Record<string, unknown>).amount).toBeUndefined()
      // Verify evidence contains only the detected cue tokens, not the extracted monetary values
      for (const ind of context.indicators.filter((i) => i.kind === 'budget')) {
        expect(ind.evidence).not.toBe('10–15k')
        expect(ind.evidence).not.toBe('50000')
      }
    })
  })

  describe('Empty and generic input', () => {
    it('returns empty context for empty title and body', () => {
      const input: MatchInput = {
        title: '',
        body: '',
      }
      const context = extractContext(input)
      expect(context).toEqual({
        timelineLevel: 'none',
        indicators: [],
        statedLocations: [],
        budgetMentioned: false,
      })
    })

    it('returns empty context for generic input with no matching cues', () => {
      const input: MatchInput = {
        title: 'General question about intellectual property law',
        body: 'Curious how things work overall.',
      }
      const context = extractContext(input)
      expect(context.timelineLevel).toBe('none')
      expect(context.indicators).toEqual([])
      expect(context.statedLocations).toEqual([])
      expect(context.budgetMentioned).toBe(false)
    })
  })

  describe('Determinism, immutability, and ordering', () => {
    it('returns identical results for repeated calls with same input', () => {
      const input: MatchInput = {
        title: 'Need trademark in Mumbai urgently by Friday',
        body: 'Budget is around ₹25,000.',
      }
      const res1 = extractContext(input)
      const res2 = extractContext(input)
      expect(res1).toEqual(res2)
    })

    it('does not mutate input object', () => {
      const input: MatchInput = {
        title: 'Need urgent help in Delhi',
        body: 'Deadline July 31 with ₹50k budget.',
      }
      const copy = JSON.parse(JSON.stringify(input))
      extractContext(input)
      expect(input).toEqual(copy)
    })

    it('orders indicators deterministically: timeline -> urgency -> location -> budget', () => {
      const input: MatchInput = {
        title: 'Urgent help in Mumbai by Friday with ₹10k budget',
        body: '',
      }
      const context = extractContext(input)
      const kinds = context.indicators.map((i) => i.kind)

      // Expected kind order: timeline, urgency, location, budget
      const kindRank: Record<string, number> = {
        timeline: 1,
        urgency: 2,
        location: 3,
        budget: 4,
      }
      for (let i = 0; i < kinds.length - 1; i++) {
        expect(kindRank[kinds[i]]).toBeLessThanOrEqual(kindRank[kinds[i + 1]])
      }
    })
  })

  describe('Configuration integrity', () => {
    it('ensures no empty normalized phrases exist in configured lists', () => {
      for (const phrase of TIMELINE_PHRASES) {
        expect(normalize(phrase).length).toBeGreaterThan(0)
      }
      for (const month of MONTH_NAMES) {
        expect(normalize(month).length).toBeGreaterThan(0)
      }
      for (const phrase of URGENCY_PHRASES) {
        expect(normalize(phrase).length).toBeGreaterThan(0)
      }
      for (const phrase of BUDGET_PHRASES) {
        expect(normalize(phrase).length).toBeGreaterThan(0)
      }
    })

    it('ensures location allowlist entries are non-empty and unique', () => {
      const seen = new Set<string>()
      for (const loc of INDIAN_LOCATIONS) {
        expect(loc.trim().length).toBeGreaterThan(0)
        expect(seen.has(loc.toLowerCase()), `Duplicate location found: ${loc}`).toBe(false)
        seen.add(loc.toLowerCase())
      }
    })
  })

  describe('Regression and separation from Stages 1–4', () => {
    it('ensures Stage 5 context extraction does not alter Stage 4 scoring results', () => {
      const input: MatchInput = {
        title: 'How do I register a Pvt Ltd company in Bangalore urgently by Friday?',
        body: 'I am a founder with budget ₹50,000.',
      }

      // Stage 2 matching
      const matches = matchServices(input, ALL_SERVICES)
      // Stage 3 intent
      const intent = classifyIntent(input)
      // Stage 4 score
      const scoreResultBefore = scoreLead(intent, matches)

      // Stage 5 extraction
      const context = extractContext(input)
      expect(context.timelineLevel).toBe('mentioned')
      expect(context.budgetMentioned).toBe(true)
      expect(context.statedLocations).toContain('Bangalore')

      // Score again to verify total independence and immutability
      const scoreResultAfter = scoreLead(intent, matches)
      expect(scoreResultBefore).toEqual(scoreResultAfter)
    })
  })
})

