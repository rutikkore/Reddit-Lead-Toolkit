import { describe, it, expect } from 'vitest'
import { normalize, tokenize, containsPhrase, countPhraseHits } from '../text'

describe('text processing utilities', () => {
  describe('normalize', () => {
    // 1. Lowercase normalization
    it('converts text to lowercase', () => {
      expect(normalize('COMPANY INCORPORATION')).toBe('company incorporation')
    })

    // 2. Punctuation replacement
    it('replaces punctuation characters with spaces', () => {
      expect(normalize('tax, audit; legal: advice! (urgent)')).toBe('tax audit legal advice urgent')
    })

    // 3. Preservation of & in P&L
    it('preserves & in business terms like P&L', () => {
      expect(normalize('P&L statement and MOA&AOA')).toBe('p&l statement and moa&aoa')
    })

    // 4. Whitespace collapse and trimming
    it('collapses repeated whitespace and trims edges', () => {
      expect(normalize('   startup    incorporation \t\n  process   ')).toBe('startup incorporation process')
    })

    // 5. Empty and whitespace-only normalization
    it('returns an empty string for empty or whitespace-only input', () => {
      expect(normalize('')).toBe('')
      expect(normalize('    ')).toBe('')
      expect(normalize('\t\n  \r')).toBe('')
    })
  })

  describe('tokenize', () => {
    // 6. Empty tokenization
    it('returns an empty array for empty input', () => {
      expect(tokenize('')).toEqual([])
      expect(tokenize('    ')).toEqual([])
      expect(tokenize('---///')).toEqual([])
    })

    // 7. Tokenization of GST-return filing
    it('tokenizes hyphenated and punctuated phrases like GST-return filing', () => {
      expect(tokenize('GST-return filing')).toEqual(['gst', 'return', 'filing'])
    })
  })

  describe('containsPhrase', () => {
    // 8. Phrase matching at beginning, middle, and end
    it('matches phrases at the beginning of the text', () => {
      expect(containsPhrase('private limited company registration in bangalore', 'private limited')).toBe(true)
    })

    it('matches phrases in the middle of the text', () => {
      expect(containsPhrase('need help with private limited company for my startup', 'private limited company')).toBe(true)
    })

    it('matches phrases at the end of the text', () => {
      expect(containsPhrase('where should I incorporate a private limited', 'private limited')).toBe(true)
    })

    // 9. Case-insensitive phrase matching
    it('matches phrases case-insensitively', () => {
      expect(containsPhrase('Filing Gst Returns today', 'GST RETURNS')).toBe(true)
    })

    // 10. Whole-word matching
    it('matches whole words accurately', () => {
      expect(containsPhrase('gst returns for my business', 'gst returns')).toBe(true)
    })

    // 11. No substring matching inside words
    it('does not match substrings inside longer words', () => {
      expect(containsPhrase('category of services', 'cat')).toBe(false)
      expect(containsPhrase('filing documents', 'file')).toBe(false)
      expect(containsPhrase('income tax returns', 'tax return')).toBe(false)
    })

    // 12. Matching across punctuation
    it('matches phrases across punctuation boundaries', () => {
      expect(containsPhrase('GST-return / filing: needed ASAP', 'gst return filing')).toBe(true)
      expect(containsPhrase('P&L, balance-sheet review', 'p&l balance sheet')).toBe(true)
    })

    // 13. Empty and punctuation-only phrases return false
    it('returns false for empty or punctuation-only phrases', () => {
      expect(containsPhrase('valid haystack content', '')).toBe(false)
      expect(containsPhrase('valid haystack content', '   ')).toBe(false)
      expect(containsPhrase('valid haystack content', '---///!!!')).toBe(false)
      expect(containsPhrase('', 'valid phrase')).toBe(false)
    })

    // 15. Known limitation: weak-keyword handling deferred to Stage 2
    it('demonstrates known limitation: weak keywords match unintended contexts', () => {
      // Known limitation: weak-keyword handling is deferred to Stage 2.
      // Short acronyms like "ICC" (intended for Internal Complaints Committee / POSH)
      // currently match unintended phrases such as "cricket ICC final".
      expect(containsPhrase('cricket ICC final', 'ICC')).toBe(true)
    })
  })

  describe('countPhraseHits', () => {
    // 14. countPhraseHits preserves original phrases, order, and uniqueness
    it('preserves original phrases, order, and uniqueness while ignoring empty phrases', () => {
      const haystack = 'Need assistance with GST-return filing, trademark registration, and P&L accounting.'
      const candidatePhrases = [
        'GST-return filing',
        'P&L',
        'GST-return filing', // duplicate: should be returned only once
        '---///', // normalizes to empty: should be ignored
        '', // empty: should be ignored
        'trademark registration',
        'income tax return', // does not match: should not be included
      ]

      const hits = countPhraseHits(haystack, candidatePhrases)

      expect(hits).toEqual([
        'GST-return filing',
        'P&L',
        'trademark registration',
      ])
    })
  })
})

