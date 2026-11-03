/**
 * Matching configuration for service relevance.
 * Prototype heuristic, not validated. Measures keyword overlap only.
 * Does not measure customer need, intent, or conversion likelihood.
 */
export const TITLE_WEIGHT = 3
export const BODY_WEIGHT = 1
export const WEAK_KEYWORD_MULTIPLIER = 0.5
export const MAX_MATCHES = 3
export const MIN_RELEVANCE = 1

/**
 * Keywords that are short, acronym-like, or broad. Each is scored at
 * WEAK_KEYWORD_MULTIPLIER. Every entry must exist verbatim in services.ts.
 * Each entry has a reason; keep reasons in the comment next to it.
 */
export const WEAK_KEYWORDS: readonly string[] = [
  'ICC',            // cricket body name; catalog means POSH Internal Complaints Committee
  'HUF',            // common letter sequence; also "HUF" in unrelated contexts
  'OPC',            // three letters; collides with other abbreviations
  'ODR',            // three letters; generic acronym
  'DSC',            // generic acronym; also "digital signature" context varies
  'MOU',            // common abbreviation outside legal use
  'income tax',     // broad; matches general tax questions across many services
  'litigation',     // broad; matches any legal dispute discussion
  'mediator',       // broad; generic word
  'Startup India',  // broad program name; matches general startup talk
  'food safety',    // broad; matches general food discussions
  'NRI tax',        // broad; "NRI" alone and "tax" alone are common
  'fundraising',    // broad; generic startup word
  'share transfer', // broad; appears outside company law
  'GST number',     // broad; common phrase in many GST questions
]

