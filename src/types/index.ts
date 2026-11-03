// ---------------------------------------------------------------------------
// Core domain types for the Reddit Lead Generation & Intelligence Toolkit
// ---------------------------------------------------------------------------

/** Target customer segment for a service */
export type CustomerSegment = 'Individual' | 'MSME' | 'Startup' | 'All'

/** Top-level service category */
export interface ServiceCategory {
  id: string
  name: string
  services: Service[]
}

/** A single service offered by NoLegalPaisa */
export interface Service {
  id: string
  name: string
  categoryId: string
  /**
   * Target customer segments for this service.
   * Kept extensible — will grow as the catalog matures.
   */
  targetCustomers: CustomerSegment[]
  /**
   * Seed keywords useful for Reddit discovery.
   * Intentionally left sparse at this stage so the team can curate them
   * without modifying application logic.
   */
  keywords: string[]
  description?: string
}

// ---------------------------------------------------------------------------
// Reddit opportunity types
// ---------------------------------------------------------------------------

/** How confident we are that the post represents a genuine buying intent */
export type IntentLevel = 'High' | 'Medium' | 'Low'

/** Lifecycle status of a discovered lead */
export type LeadStatus = 'New' | 'Reviewing' | 'Replied' | 'Archived'

/** A Reddit post surfaced as a potential lead */
export interface RedditPost {
  id: string
  subreddit: string
  title: string
  body: string
  author: string
  upvotes: number
  commentCount: number
  postedAt: string          // ISO-8601
  permalink: string
  /** Sample data label — must always be displayed alongside the post */
  isSampleData: true
}

/** The result of analysing a Reddit post against the service catalog */
export interface LeadOpportunity {
  id: string
  post: RedditPost
  matchedServiceIds: string[]
  intentLevel: IntentLevel
  relevanceScore: number    // 0–100
  reasoningSummary: string
  suggestedReply: string
  status: LeadStatus
  discoveredAt: string      // ISO-8601
}

/** Relevance of one post to one service. Not lead priority. */
export interface ServiceMatch {
  serviceId: string;
  /** Prototype heuristic, not validated. */
  relevance: number;
  matchedKeywords: string[];
}

/** What the poster appears to be trying to do. */
export type IntentCategory =
  | 'genuine-need'
  | 'research'
  | 'casual'
  | 'irrelevant';

/** One line explaining a future priority score. */
export interface ScoreFactor {
  label: string;
  points: number;
  reason: string;
}

/** Keyword-level evidence for one service match. */
export interface MatchDetail {
  keyword: string
  location: 'title' | 'body'
  weight: number
}

/** Input to service matching. RedditPost satisfies this structurally. */
export interface MatchInput {
  title: string
  body: string
}

/** Intent classification rule that fired. */
export type IntentRule =
  | 'purpose-override'
  | 'request-with-situation'
  | 'situation-question'
  | 'informational'
  | 'request-only'
  | 'opinion'
  | 'ambiguous'
  | 'no-intent-cue'

/** Confidence level of the rule-based classification. */
export type IntentConfidence = 'high' | 'medium' | 'low'

/** Cue or phrase detected in the input text. */
export interface IntentSignal {
  phrase: string
  field: 'title' | 'body'
  role:
    | 'request'
    | 'situation'
    | 'informational'
    | 'purpose'
    | 'opinion'
    | 'negation'
    | 'hedge'
}

/** Result of classifying user intent from text. */
export interface IntentResult {
  category: IntentCategory
  confidence: IntentConfidence
  rule: IntentRule
  signals: IntentSignal[]
}


