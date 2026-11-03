/**
 * Configuration for Stage 3 Intent Classification.
 *
 * Known limitations:
 * - Sarcasm, rhetorical negation, and double negatives are not handled.
 * - Negation spanning more than 3 tokens is outside scope.
 * - Non-English languages are outside scope.
 * - This describes rule-based strength only, not lead conversion probability.
 */

/** Purpose override phrases: indicates academic/research context, fires 'purpose-override' (research) */
export const PURPOSE_PHRASES: readonly string[] = [
  'for my assignment',
  'for a school project',
  'for my thesis',
  'for an article',
  'for my blog',
  'for a presentation',
]

/** Actionable request phrases */
export const REQUEST_PHRASES: readonly string[] = [
  'how do i',
  'how can i',
  'need help',
  'need a lawyer',
  'should i',
  'what is the process',
  'how much does',
  'where can i',
  'i want to',
  'what should i do',
  'how long does',
]

/** First-person situation indicators */
export const SITUATION_PHRASES: readonly string[] = [
  'i am',
  'i m', // normalized form of "i'm"
  'we are',
  'my company',
  'my startup',
  'my business',
  'our',
  'i received',
  'i got',
  'i have',
  'my landlord',
]

/** Pure informational inquiry phrases */
export const INFORMATIONAL_PHRASES: readonly string[] = [
  'what is',
  'what are',
  'explain',
  'difference between',
  'meaning of',
  'is it legal to',
  'can you explain',
]

/** Opinion, casual venting, or discussion markers */
export const OPINION_PHRASES: readonly string[] = [
  'rant',
  'honestly',
  'anyone else',
  'lol',
  'so annoying',
  'nightmare',
  'unpopular opinion',
]

/** Negation cues in normalized form (e.g. "don't" becomes "don t") */
export const NEGATION_CUES: readonly string[] = [
  'no need for',
  'not looking for',
  'not planning to',
  'no longer',
  'don t',
  'do not',
  'not',
  'no',
  'never',
  'without',
]

/** Hedge phrases where negation cues (e.g. "not") should not cancel intent */
export const HEDGE_PHRASES: readonly string[] = [
  'not sure',
  'not certain',
]

/** Common legal/business vocabulary that indicates commercial topic without explicit intent */
export const AMBIGUOUS_WORDS: readonly string[] = [
  'llp',
  'pvt ltd',
  'gst',
  'itr',
  'lawyer',
  'legal',
  'court',
  'notice',
  'compliance',
  'tax',
  'trademark',
  'patent',
  'copyright',
  'fssai',
  'incorporation',
]

/**
 * Common abbreviations that contain periods so sentence splitting does not
 * mis-split on internal punctuation.
 */
export const ABBREVIATIONS: readonly string[] = [
  'pvt. ltd.',
  'pvt. ltd',
  'ltd.',
  'pvt.',
  'e.g.',
  'i.e.',
  'etc.',
  'vs.',
  'dr.',
  'mr.',
  'mrs.',
  'ms.',
  'co.',
  'inc.',
]

/** Maximum tokens between a negation cue and a request phrase to trigger cancellation */
export const MAX_NEGATION_GAP_TOKENS = 3

/** Token count thresholds for confidence capping */
export const SHORT_TEXT_MEDIUM_THRESHOLD = 5
export const SHORT_TEXT_LOW_THRESHOLD = 3

