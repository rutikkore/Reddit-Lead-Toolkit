/**
 * Configuration for Stage 5 Opportunity Context Extraction.
 *
 * NOTE: All phrases, cues, and allowlists are heuristic detection rules.
 * Detected contextual clues represent text evidence only and must not be
 * treated as verified customer facts.
 */

/** Phrases that indicate time constraints, deadlines, or scheduling cues */
export const TIMELINE_PHRASES: readonly string[] = [
  'by friday',
  'by monday',
  'by tuesday',
  'by wednesday',
  'by thursday',
  'by saturday',
  'by sunday',
  'within 7 days',
  'within 30 days',
  'within a week',
  'next week',
  'next month',
  'before launch',
  'deadline',
  'due date',
  'due',
  'today',
  'tomorrow',
]

/** Full and abbreviated month names for explicit date detection (e.g. "July 31", "31 July") */
export const MONTH_NAMES: readonly string[] = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
  'jan',
  'feb',
  'mar',
  'apr',
  'jun',
  'jul',
  'aug',
  'sep',
  'sept',
  'oct',
  'nov',
  'dec',
]

/** Phrases that explicitly express urgency */
export const URGENCY_PHRASES: readonly string[] = [
  'urgent',
  'urgently',
  'asap',
  'immediately',
  'right away',
  'as soon as possible',
  'rush',
]

/** Local negation cues that cancel urgency when preceding an urgency phrase */
export const URGENCY_NEGATION_CUES: readonly string[] = [
  'not',
  'no',
  'never',
  'without',
  'don t',
  'do not',
  'dont',
]

/** Raw currency symbols checked against original un-normalized text */
export const BUDGET_RAW_SYMBOLS: readonly string[] = [
  '₹',
  '$',
]

/** Words and terms that suggest a budget, price, or financial volume discussion */
export const BUDGET_PHRASES: readonly string[] = [
  'rs',
  'inr',
  'rupees',
  'lakh',
  'lakhs',
  'lac',
  'lacs',
  'crore',
  'crores',
  'budget',
]

/**
 * Allowlist of major Indian cities, states, and Union Territories.
 * Used for explicit location extraction using whole-phrase matching.
 */
export const INDIAN_LOCATIONS: readonly string[] = [
  // Major Cities
  'Ahmedabad',
  'Bangalore',
  'Bengaluru',
  'Bhopal',
  'Bhubaneswar',
  'Chandigarh',
  'Chennai',
  'Coimbatore',
  'Dehradun',
  'Delhi',
  'Faridabad',
  'Ghaziabad',
  'Gurgaon',
  'Gurugram',
  'Guwahati',
  'Hyderabad',
  'Indore',
  'Jaipur',
  'Kanpur',
  'Kochi',
  'Kolkata',
  'Lucknow',
  'Ludhiana',
  'Mumbai',
  'Nagpur',
  'Navi Mumbai',
  'Noida',
  'Patna',
  'Pune',
  'Raipur',
  'Ranchi',
  'Surat',
  'Thane',
  'Thiruvananthapuram',
  'Vadodara',
  'Varanasi',
  'Visakhapatnam',

  // States and Union Territories (excluding duplicates like Delhi/Chandigarh)
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

