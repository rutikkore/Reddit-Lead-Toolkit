import { describe, it, expect } from 'vitest'
import type { IntentCategory, IntentConfidence, IntentResult } from '../../types'
import type { MatchResult } from '../matching'
import { scoreLead } from '../scoring'
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
} from '../../config/scoringConfig'
import { matchServices } from '../matching'
import { classifyIntent } from '../intent'
import { ALL_SERVICES } from '../../data/services'

function makeMatch(relevance: number, serviceId = 'test-service'): MatchResult {
  return {
    match: {
      serviceId,
      relevance,
      matchedKeywords: ['test'],
    },
    details: [],
    warnings: [],
  }
}

function makeIntent(
  category: IntentCategory,
  confidence: IntentConfidence = 'high',
): IntentResult {
  return {
    category,
    confidence,
    rule: 'no-intent-cue',
    signals: [],
  }
}

describe('scoring engine', () => {
  describe('service relevance points', () => {
    it('scales relevance 0.5 to 3 points', () => {
      const result = scoreLead(makeIntent('casual'), [makeMatch(0.5)])
      const factor = result.factors.find((f) => f.label === 'service-relevance')!
      expect(factor.points).toBe(3)
      expect(result.score).toBe(3)
    })

    it('scales relevance 1.0 to 5 points', () => {
      const result = scoreLead(makeIntent('casual'), [makeMatch(1.0)])
      const factor = result.factors.find((f) => f.label === 'service-relevance')!
      expect(factor.points).toBe(5)
      expect(result.score).toBe(5)
    })

    it('scales relevance 1.5 to 8 points', () => {
      const result = scoreLead(makeIntent('casual'), [makeMatch(1.5)])
      const factor = result.factors.find((f) => f.label === 'service-relevance')!
      expect(factor.points).toBe(8)
      expect(result.score).toBe(8)
    })

    it('scales relevance 2.5 to 13 points', () => {
      const result = scoreLead(makeIntent('casual'), [makeMatch(2.5)])
      const factor = result.factors.find((f) => f.label === 'service-relevance')!
      expect(factor.points).toBe(13)
      expect(result.score).toBe(13)
    })

    it('scales relevance 3.5 to 18 points', () => {
      const result = scoreLead(makeIntent('casual'), [makeMatch(3.5)])
      const factor = result.factors.find((f) => f.label === 'service-relevance')!
      expect(factor.points).toBe(18)
      expect(result.score).toBe(18)
    })

    it('scales relevance 6 to 30 points (max ceiling)', () => {
      const result = scoreLead(makeIntent('casual'), [makeMatch(6)])
      const factor = result.factors.find((f) => f.label === 'service-relevance')!
      expect(factor.points).toBe(30)
      expect(result.score).toBe(30)
    })

    it('caps relevance 10 to 30 points', () => {
      const result = scoreLead(makeIntent('casual'), [makeMatch(10)])
      const factor = result.factors.find((f) => f.label === 'service-relevance')!
      expect(factor.points).toBe(30)
      expect(result.score).toBe(30)
    })

    it('treats NaN, negative, and Infinity relevance as 0 points', () => {
      const nanResult = scoreLead(makeIntent('casual'), [makeMatch(NaN)])
      expect(nanResult.factors.find((f) => f.label === 'service-relevance')!.points).toBe(0)

      const negResult = scoreLead(makeIntent('casual'), [makeMatch(-5)])
      expect(negResult.factors.find((f) => f.label === 'service-relevance')!.points).toBe(0)

      const infResult = scoreLead(makeIntent('casual'), [makeMatch(Infinity)])
      expect(infResult.factors.find((f) => f.label === 'service-relevance')!.points).toBe(0)
    })

    it('uses the highest relevance across multiple matches, not the first entry', () => {
      const matches = [makeMatch(1.0, 'low-match'), makeMatch(3.5, 'top-match'), makeMatch(2.0, 'mid-match')]
      const result = scoreLead(makeIntent('casual'), matches)
      const factor = result.factors.find((f) => f.label === 'service-relevance')!
      expect(factor.points).toBe(18)
    })
  })

  describe('intent points and category caps', () => {
    it('scores genuine need, high confidence, relevance 6 as 70 (high band)', () => {
      const result = scoreLead(makeIntent('genuine-need', 'high'), [makeMatch(6)])
      expect(result.score).toBe(70)
      expect(result.band).toBe('high')
      expect(result.capsApplied).toEqual([])
    })

    it('scores genuine need, medium confidence, relevance 3 as 45 (medium band)', () => {
      const result = scoreLead(makeIntent('genuine-need', 'medium'), [makeMatch(3)])
      expect(result.score).toBe(45)
      expect(result.band).toBe('medium')
      expect(result.capsApplied).toEqual([])
    })

    it('caps genuine need, high confidence, with no service matches at 39 (low band)', () => {
      const result = scoreLead(makeIntent('genuine-need', 'high'), [])
      expect(result.score).toBe(39)
      expect(result.band).toBe('low')
      expect(result.capsApplied).toContain('no-service-match-cap')
      const capFactor = result.factors.find((f) => f.label === 'no-service-match-cap')!
      expect(capFactor.points).toBe(-1)
    })

    it('scores genuine need, low confidence, with no service matches as 15 without cap', () => {
      const result = scoreLead(makeIntent('genuine-need', 'low'), [])
      expect(result.score).toBe(15)
      expect(result.band).toBe('low')
      expect(result.capsApplied).toEqual([])
    })

    it('scores research with relevance 2.5 as 18 without cap', () => {
      const result = scoreLead(makeIntent('research', 'high'), [makeMatch(2.5)])
      expect(result.score).toBe(18)
      expect(result.band).toBe('low')
      expect(result.capsApplied).toEqual([])
    })

    it('scores research with relevance 6 as 35 with NO research cap applied', () => {
      const result = scoreLead(makeIntent('research', 'high'), [makeMatch(6)])
      expect(result.score).toBe(35)
      expect(result.band).toBe('low')
      expect(result.capsApplied).toEqual([])
      expect(result.factors.some((f) => f.label === 'research-ceiling-cap')).toBe(false)
    })

    it('scores casual with relevance 3 as 15 without cap', () => {
      const result = scoreLead(makeIntent('casual', 'medium'), [makeMatch(3)])
      expect(result.score).toBe(15)
      expect(result.band).toBe('low')
      expect(result.capsApplied).toEqual([])
    })

    it('caps irrelevant with relevance 6 at 15', () => {
      const result = scoreLead(makeIntent('irrelevant', 'high'), [makeMatch(6)])
      expect(result.score).toBe(15)
      expect(result.band).toBe('low')
      expect(result.capsApplied).toContain('irrelevant-ceiling-cap')
      const capFactor = result.factors.find((f) => f.label === 'irrelevant-ceiling-cap')!
      expect(capFactor.points).toBe(-15)
    })

    it('scores irrelevant with no matches as 0', () => {
      const result = scoreLead(makeIntent('irrelevant', 'low'), [])
      expect(result.score).toBe(0)
      expect(result.band).toBe('low')
      expect(result.capsApplied).toEqual([])
    })
  })

  describe('priority bands', () => {
    it('categorizes score 39 as low', () => {
      const result = scoreLead(makeIntent('genuine-need', 'high'), [])
      expect(result.score).toBe(39)
      expect(result.band).toBe('low')
    })

    it('categorizes score 40 as medium', () => {
      // Intent genuine-need medium (30) + relevance 2 (10) = 40
      const result = scoreLead(makeIntent('genuine-need', 'medium'), [makeMatch(2)])
      expect(result.score).toBe(40)
      expect(result.band).toBe('medium')
    })

    it('categorizes score 69 as medium', () => {
      // Intent genuine-need high (40) + relevance 5.8 (29) = 69
      const result = scoreLead(makeIntent('genuine-need', 'high'), [makeMatch(5.8)])
      expect(result.score).toBe(69)
      expect(result.band).toBe('medium')
    })

    it('categorizes score 70 as high', () => {
      const result = scoreLead(makeIntent('genuine-need', 'high'), [makeMatch(6)])
      expect(result.score).toBe(70)
      expect(result.band).toBe('high')
    })
  })

  describe('factor integrity and explainability', () => {
    it('guarantees factor points sum exactly to final score', () => {
      const cases: Array<[IntentResult, MatchResult[]]> = [
        [makeIntent('genuine-need', 'high'), [makeMatch(6)]],
        [makeIntent('genuine-need', 'high'), []],
        [makeIntent('research', 'high'), [makeMatch(6)]],
        [makeIntent('irrelevant', 'high'), [makeMatch(6)]],
        [makeIntent('casual', 'low'), []],
      ]

      for (const [intent, matches] of cases) {
        const result = scoreLead(intent, matches)
        const sumOfFactors = result.factors.reduce((sum, f) => sum + f.points, 0)
        expect(sumOfFactors).toBe(result.score)
      }
    })

    it('ensures every factor has a non-empty label and reason', () => {
      const result = scoreLead(makeIntent('genuine-need', 'high'), [])
      expect(result.factors.length).toBeGreaterThan(0)
      for (const f of result.factors) {
        expect(f.label.trim().length).toBeGreaterThan(0)
        expect(f.reason.trim().length).toBeGreaterThan(0)
      }
    })

    it('matches capsApplied labels with negative cap factors', () => {
      const result = scoreLead(makeIntent('genuine-need', 'high'), [])
      const negativeCapFactors = result.factors.filter((f) => f.points < 0 && f.label.includes('cap'))
      expect(result.capsApplied).toEqual(negativeCapFactors.map((f) => f.label))
    })

    it('does not include clamp factor during normal in-bounds scoring', () => {
      const result = scoreLead(makeIntent('genuine-need', 'high'), [makeMatch(6)])
      expect(result.factors.some((f) => f.label === 'score-clamp')).toBe(false)
    })

    it('includes clamp factor when score exceeds max boundary via configuration override', () => {
      // Override SCORE_MAX to 50 for testing clamping
      const result = scoreLead(makeIntent('genuine-need', 'high'), [makeMatch(6)], {
        SCORE_MAX: 50,
      })
      expect(result.score).toBe(50)
      const clampFactor = result.factors.find((f) => f.label === 'score-clamp')!
      expect(clampFactor).toBeDefined()
      expect(clampFactor.points).toBe(-20)
      const sum = result.factors.reduce((acc, f) => acc + f.points, 0)
      expect(sum).toBe(50)
    })
  })

  describe('determinism and immutability', () => {
    it('produces identical results across repeated invocations', () => {
      const intent = makeIntent('genuine-need', 'high')
      const matches = [makeMatch(4.0)]
      const res1 = scoreLead(intent, matches)
      const res2 = scoreLead(intent, matches)
      expect(res1).toEqual(res2)
    })

    it('does not mutate input objects', () => {
      const intent = makeIntent('genuine-need', 'high')
      const matches = [makeMatch(4.0)]
      const intentCopy = JSON.parse(JSON.stringify(intent))
      const matchesCopy = JSON.parse(JSON.stringify(matches))

      scoreLead(intent, matches)

      expect(intent).toEqual(intentCopy)
      expect(matches).toEqual(matchesCopy)
    })
  })

  describe('configuration integrity', () => {
    it('covers every intent category and confidence level in INTENT_POINTS', () => {
      const categories: IntentCategory[] = ['genuine-need', 'research', 'casual', 'irrelevant']
      const confidences: IntentConfidence[] = ['high', 'medium', 'low']

      for (const cat of categories) {
        expect(INTENT_POINTS[cat]).toBeDefined()
        for (const conf of confidences) {
          const pts = INTENT_POINTS[cat][conf]
          expect(typeof pts).toBe('number')
          expect(pts).toBeGreaterThanOrEqual(0)
          expect(pts).toBeLessThanOrEqual(100)
        }
      }
    })

    it('maintains logically ordered thresholds and valid boundaries', () => {
      expect(SCORE_MIN).toBe(0)
      expect(SCORE_MAX).toBe(100)
      expect(SCORE_MIN).toBeLessThan(SCORE_MAX)

      expect(BAND_MEDIUM_MIN).toBe(40)
      expect(BAND_HIGH_MIN).toBe(70)
      expect(BAND_MEDIUM_MIN).toBeLessThan(BAND_HIGH_MIN)

      expect(RELEVANCE_POINTS_PER_UNIT).toBe(5)
      expect(RELEVANCE_POINTS_MAX).toBe(30)

      expect(NO_MATCH_GENUINE_CEILING).toBe(39)
      expect(RESEARCH_CEILING).toBe(39)
      expect(CASUAL_CEILING).toBe(39)
      expect(IRRELEVANT_CEILING).toBe(15)
    })
  })

  describe('end-to-end integration with Stages 2 and 3', () => {
    it('scores a genuine-need post with real catalog matching in 0-100 and verifies factor sum', () => {
      const input = {
        title: 'How do I register a Pvt Ltd company?',
        body: 'I am a founder.',
      }

      const matches = matchServices(input, ALL_SERVICES)
      const intent = classifyIntent(input)
      const scoreResult = scoreLead(intent, matches)

      expect(intent.category).toBe('genuine-need')
      expect(scoreResult.score).toBeGreaterThanOrEqual(0)
      expect(scoreResult.score).toBeLessThanOrEqual(100)

      const factorSum = scoreResult.factors.reduce((sum, f) => sum + f.points, 0)
      expect(factorSum).toBe(scoreResult.score)
    })

    it('ensures "I don\'t need a lawyer." does not receive a high priority band', () => {
      const input = {
        title: "I don't need a lawyer.",
        body: '',
      }

      const matches = matchServices(input, ALL_SERVICES)
      const intent = classifyIntent(input)
      const scoreResult = scoreLead(intent, matches)

      expect(scoreResult.band).not.toBe('high')
    })
  })
})
