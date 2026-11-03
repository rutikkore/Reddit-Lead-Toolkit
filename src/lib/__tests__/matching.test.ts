import { describe, it, expect } from 'vitest'
import type { Service, MatchInput } from '../../types'
import { matchServices } from '../matching'
import { normalize } from '../text'
import { WEAK_KEYWORDS } from '../../config/matchingConfig'
import { SERVICE_CATEGORIES } from '../../data/services'

const fixtureServices: Service[] = [
  {
    id: 'llp-registration',
    name: 'Register an LLP',
    categoryId: 'x',
    targetCustomers: ['MSME'],
    keywords: ['LLP registration', 'llp india'],
  },
  {
    id: 'pvt-ltd',
    name: 'Incorporate Pvt Ltd',
    categoryId: 'x',
    targetCustomers: ['Startup'],
    keywords: ['Pvt Ltd', 'company registration'],
  },
  {
    id: 'odr-service',
    name: 'ODR',
    categoryId: 'x',
    targetCustomers: ['MSME'],
    keywords: ['ODR'],
  },
]

describe('service matching', () => {
  // 1. Title match scores 3; body-only match scores 1 for the same keyword
  it('scores 3 for a title match and 1 for a body-only match for the same keyword', () => {
    const service: Service = {
      id: 'trademark',
      name: 'Trademark Registration',
      categoryId: 'x',
      targetCustomers: ['Startup'],
      keywords: ['trademark registration'],
    }

    const titleOnlyInput: MatchInput = {
      title: 'Need trademark registration urgently',
      body: 'Can someone advise on steps',
    }
    const titleResults = matchServices(titleOnlyInput, [service])
    expect(titleResults).toHaveLength(1)
    expect(titleResults[0].match.relevance).toBe(3)
    expect(titleResults[0].details[0].location).toBe('title')
    expect(titleResults[0].details[0].weight).toBe(3)

    const bodyOnlyInput: MatchInput = {
      title: 'Looking for advice',
      body: 'Need trademark registration urgently',
    }
    const bodyResults = matchServices(bodyOnlyInput, [service])
    expect(bodyResults).toHaveLength(1)
    expect(bodyResults[0].match.relevance).toBe(1)
    expect(bodyResults[0].details[0].location).toBe('body')
    expect(bodyResults[0].details[0].weight).toBe(1)
  })

  // 2. LLP does not match "help" in the title (no match, empty result)
  it('does not match LLP for a title containing only "help"', () => {
    const input: MatchInput = {
      title: 'I need some help please',
      body: 'General question about business',
    }
    const results = matchServices(input, fixtureServices)
    expect(results).toEqual([])
  })

  // 3. Pvt Ltd matches "pvt ltd" in lowercase body text (case-insensitive)
  it('matches "pvt ltd" case-insensitively in body text', () => {
    const input: MatchInput = {
      title: 'Question',
      body: 'how do i form a pvt ltd company in india',
    }
    const results = matchServices(input, fixtureServices)
    expect(results.some((r) => r.match.serviceId === 'pvt-ltd')).toBe(true)
    const pvtMatch = results.find((r) => r.match.serviceId === 'pvt-ltd')!
    expect(pvtMatch.match.matchedKeywords).toContain('Pvt Ltd')
  })

  // 4. GST-return in the body matches keyword GST return (punctuation)
  it('matches hyphenated "GST-return" in body against keyword "GST return"', () => {
    const gstService: Service = {
      id: 'gst-filing',
      name: 'GST Return Filing',
      categoryId: 'x',
      targetCustomers: ['MSME'],
      keywords: ['GST return'],
    }
    const input: MatchInput = {
      title: 'Tax deadline',
      body: 'Need help filing my GST-return before the due date',
    }
    const results = matchServices(input, [gstService])
    expect(results).toHaveLength(1)
    expect(results[0].match.serviceId).toBe('gst-filing')
    expect(results[0].match.matchedKeywords).toEqual(['GST return'])
  })

  // 5. Weak keyword: keyword ODR in the title yields 1.5 (3 × 0.5), and details records weight 1.5
  it('applies weak-keyword multiplier (0.5) to ODR in title, yielding 1.5', () => {
    const input: MatchInput = {
      title: 'Looking for an ODR platform',
      body: '',
    }
    const results = matchServices(input, fixtureServices)
    const odrResult = results.find((r) => r.match.serviceId === 'odr-service')
    expect(odrResult).toBeDefined()
    expect(odrResult!.match.relevance).toBe(1.5)
    expect(odrResult!.details).toHaveLength(1)
    expect(odrResult!.details[0].weight).toBe(1.5)
    expect(odrResult!.details[0].keyword).toBe('ODR')
  })

  // 5b. Normalized weak-keyword comparison: lowercase "odr" does not bypass weak weighting
  it('normalizes weak-keyword comparison so capitalization differences do not bypass weak weighting', () => {
    const input: MatchInput = {
      title: 'Looking for an odr platform',
      body: '',
    }
    const results = matchServices(input, fixtureServices)
    const odrResult = results.find((r) => r.match.serviceId === 'odr-service')
    expect(odrResult).toBeDefined()
    expect(odrResult!.match.relevance).toBe(1.5)
    expect(odrResult!.details[0].weight).toBe(1.5)
  })

  // 6. Empty title and body returns []
  it('returns empty array when both title and body are empty or whitespace/punctuation only', () => {
    expect(matchServices({ title: '', body: '' }, fixtureServices)).toEqual([])
    expect(matchServices({ title: '   ', body: ' \t\n ' }, fixtureServices)).toEqual([])
    expect(matchServices({ title: '---', body: '???' }, fixtureServices)).toEqual([])
  })

  // 7. Non-matching post returns []
  it('returns empty array for a post with no service keyword matches', () => {
    const input: MatchInput = {
      title: 'Weekend movie review and discussion',
      body: 'What was your favourite release this week',
    }
    const results = matchServices(input, fixtureServices)
    expect(results).toEqual([])
  })

  // 8. A post matching more than 3 services returns exactly 3, sorted by relevance then ID
  it('returns at most MAX_MATCHES (3) services, sorted by relevance descending then ID ascending', () => {
    const manyServices: Service[] = [
      { id: 's-alpha', name: 'Alpha', categoryId: 'x', targetCustomers: ['Startup'], keywords: ['alpha keyword'] },
      { id: 's-beta', name: 'Beta', categoryId: 'x', targetCustomers: ['Startup'], keywords: ['beta keyword'] },
      { id: 's-gamma', name: 'Gamma', categoryId: 'x', targetCustomers: ['Startup'], keywords: ['gamma keyword'] },
      { id: 's-delta', name: 'Delta', categoryId: 'x', targetCustomers: ['Startup'], keywords: ['delta keyword'] },
      { id: 's-epsilon', name: 'Epsilon', categoryId: 'x', targetCustomers: ['Startup'], keywords: ['epsilon keyword'] },
    ]

    const input: MatchInput = {
      title: 'alpha keyword beta keyword', // relevance 3 each
      body: 'gamma keyword delta keyword epsilon keyword', // relevance 1 each
    }

    const results = matchServices(input, manyServices)
    expect(results).toHaveLength(3)
    expect(results.map((r) => r.match.serviceId)).toEqual(['s-alpha', 's-beta', 's-delta'])
  })

  // 9. Ties are broken by service ID ascending (two services with equal relevance)
  it('breaks ties by serviceId ascending when relevance scores are identical', () => {
    const tieServices: Service[] = [
      { id: 'service-z', name: 'Z Service', categoryId: 'x', targetCustomers: ['MSME'], keywords: ['shared keyword'] },
      { id: 'service-a', name: 'A Service', categoryId: 'x', targetCustomers: ['MSME'], keywords: ['shared keyword'] },
    ]

    const input: MatchInput = {
      title: 'Need shared keyword today',
      body: '',
    }

    const results = matchServices(input, tieServices)
    expect(results).toHaveLength(2)
    expect(results[0].match.serviceId).toBe('service-a')
    expect(results[1].match.serviceId).toBe('service-z')
    expect(results[0].match.relevance).toBe(results[1].match.relevance)
  })

  // 10. A keyword that normalizes to empty (for example "---") adds a warning and does not throw
  it('adds a warning when a keyword normalizes to empty without throwing', () => {
    const serviceWithEmptyKw: Service = {
      id: 'problematic-service',
      name: 'Problematic Service',
      categoryId: 'x',
      targetCustomers: ['MSME'],
      keywords: ['---', 'valid keyword'],
    }

    const input: MatchInput = {
      title: 'Post with valid keyword',
      body: '',
    }

    const results = matchServices(input, [serviceWithEmptyKw])
    expect(results).toHaveLength(1)
    expect(results[0].warnings).toContain('empty keyword in problematic-service')
    expect(results[0].match.matchedKeywords).toEqual(['valid keyword'])
  })

  // 11. Matching does not mutate input or services (deep-copy before, compare after)
  it('does not mutate input or services during matching', () => {
    const input: MatchInput = {
      title: 'Need LLP registration and Pvt Ltd company registration',
      body: 'Looking for advice on ODR',
    }
    const inputCopy = JSON.parse(JSON.stringify(input))
    const servicesCopy = JSON.parse(JSON.stringify(fixtureServices))

    matchServices(input, fixtureServices)

    expect(input).toEqual(inputCopy)
    expect(fixtureServices).toEqual(servicesCopy)
  })

  // 12. Each matchedKeywords entry corresponds to a keyword present in its service’s keywords array
  it('ensures each matchedKeywords entry corresponds to a keyword present in its service keywords array', () => {
    const input: MatchInput = {
      title: 'Need LLP registration and Pvt Ltd guidance',
      body: 'What is the process for company registration',
    }
    const results = matchServices(input, fixtureServices)
    expect(results.length).toBeGreaterThan(0)

    for (const res of results) {
      const originalService = fixtureServices.find((s) => s.id === res.match.serviceId)!
      for (const kw of res.match.matchedKeywords) {
        expect(originalService.keywords).toContain(kw)
      }
    }
  })

  // 13. Relevance values are rounded to one decimal
  it('rounds relevance values to one decimal place', () => {
    const service: Service = {
      id: 'multi-weak',
      name: 'Multi Weak Service',
      categoryId: 'x',
      targetCustomers: ['Startup'],
      keywords: ['ODR', 'HUF'],
    }
    const input: MatchInput = {
      title: 'ODR', // 3 * 0.5 = 1.5
      body: 'HUF',  // 1 * 0.5 = 0.5
    }
    const results = matchServices(input, [service])
    expect(results).toHaveLength(1)
    expect(results[0].match.relevance).toBe(2)
  })

  // 14. A service with a keyword in both title and body counts the title weight only (3, not 4)
  it('counts title weight only (3, not 4) when a keyword appears in both title and body', () => {
    const input: MatchInput = {
      title: 'Urgent LLP registration needed',
      body: 'Please help with LLP registration right away',
    }
    const results = matchServices(input, fixtureServices)
    const llpResult = results.find((r) => r.match.serviceId === 'llp-registration')!
    expect(llpResult).toBeDefined()
    expect(llpResult.match.relevance).toBe(3)
    expect(llpResult.details).toHaveLength(1)
    expect(llpResult.details[0].location).toBe('title')
    expect(llpResult.details[0].weight).toBe(3)
  })

  // 15. Real-catalog health (read-only): 58 services, each has at least one keyword normalizing to non-empty
  it('validates real-catalog health: 58 services and all have valid non-empty keywords', () => {
    const allServices = SERVICE_CATEGORIES.flatMap((c) => c.services)
    expect(allServices).toHaveLength(58)

    for (const svc of allServices) {
      expect(svc.keywords.length).toBeGreaterThan(0)
      const hasValidKeyword = svc.keywords.some((k) => normalize(k).length > 0)
      expect(hasValidKeyword).toBe(true)
    }
  })

  // 16. Config integrity: every entry in WEAK_KEYWORDS appears verbatim in at least one real service’s keywords array
  it('validates config integrity: every WEAK_KEYWORDS entry appears verbatim in real catalog keywords', () => {
    const allServices = SERVICE_CATEGORIES.flatMap((c) => c.services)
    const allCatalogKeywords = allServices.flatMap((s) => s.keywords)

    for (const weakKw of WEAK_KEYWORDS) {
      const existsVerbatim = allCatalogKeywords.includes(weakKw)
      expect(
        existsVerbatim,
        `Expected weak keyword "${weakKw}" to appear verbatim in services catalog`
      ).toBe(true)
    }
  })

  // 17. Real-catalog smoke test: "I need a legal notice reply" includes legal-notice
  it('includes legal-notice in results for real-catalog smoke test', () => {
    const allServices = SERVICE_CATEGORIES.flatMap((c) => c.services)
    const input: MatchInput = {
      title: 'I need a legal notice reply',
      body: '',
    }
    const results = matchServices(input, allServices)
    const matchedIds = results.map((r) => r.match.serviceId)
    expect(matchedIds).toContain('legal-notice')
  })
})

