// ---------------------------------------------------------------------------
// Sample Reddit data — CLEARLY LABELLED AS DEMO DATA
//
// These posts are fictional examples created to prototype the toolkit UI.
// They do NOT represent real Reddit discussions or real users.
// Real Reddit data will only be available after approved API integration.
// ---------------------------------------------------------------------------

import type { LeadOpportunity } from '../types'

export const SAMPLE_LEADS: LeadOpportunity[] = [
  {
    id: 'lead-001',
    post: {
      id: 'post-001',
      subreddit: 'r/india',
      title: 'How do I register a private limited company in India? Complete beginner here.',
      body: `Hey everyone, I have an idea for a SaaS product and want to get it off the ground properly. A friend told me I should register a Pvt Ltd company before approaching investors. I have no idea where to start — MCA portal, lawyer, CA? What's the cheapest and fastest route? Any CA or lawyer recommendations in Bangalore? Budget is around ₹10–15k.`,
      author: 'u/aspiring_founder_blr',
      upvotes: 47,
      commentCount: 23,
      postedAt: '2026-10-28T09:15:00Z',
      permalink: 'https://reddit.com/r/india/comments/sample001',
      isSampleData: true,
    },
    matchedServiceIds: ['private-limited-company', 'startup-registration', 'startup-india-registration'],
    intentLevel: 'High',
    relevanceScore: 92,
    reasoningSummary:
      'The user has a concrete business idea, explicitly mentions investor readiness, and asks about Pvt Ltd registration with a specific budget. Strong buying intent with clear next-step requirement.',
    suggestedReply:
      `Hi! Registering a Pvt Ltd is a great first step before approaching investors. The process involves name reservation, DIN for directors, MOA/AOA drafting, and filing with MCA — typically 7–15 working days. NoLegalPaisa offers end-to-end Pvt Ltd incorporation at transparent pricing, well within your budget. We also bundle DPIIT Startup India recognition if you qualify. Happy to answer any specific questions!`,
    status: 'New',
    discoveredAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'lead-002',
    post: {
      id: 'post-002',
      subreddit: 'r/IndiaTax',
      title: 'Received a legal notice from my landlord — what should I do?',
      body: `I vacated my rented flat in Mumbai 3 months ago and the landlord is now sending me a legal notice claiming damage worth ₹80,000. The damage is exaggerated — there were pre-existing issues. I don't know how to respond. Do I need a lawyer? Can I do it myself? How long do I have to reply?`,
      author: 'u/mumbai_tenant_2024',
      upvotes: 112,
      commentCount: 54,
      postedAt: '2026-10-30T14:22:00Z',
      permalink: 'https://reddit.com/r/india/comments/sample002',
      isSampleData: true,
    },
    matchedServiceIds: ['legal-notice', 'virtual-legal-counsel', 'consumer-complaint'],
    intentLevel: 'High',
    relevanceScore: 88,
    reasoningSummary:
      'User has received a legal notice and is actively seeking professional guidance. High urgency, clear legal service need, and explicit budget concern make this a strong lead.',
    suggestedReply:
      `You have 30 days from receipt to reply to a legal notice. Ignoring it is not advisable as it can be used against you in court. A lawyer can review the notice and draft a proper reply that documents the pre-existing damage and counters exaggerated claims. NoLegalPaisa offers affordable legal notice reply services — a lawyer will review your situation and draft the response for you. Would you like to know more?`,
    status: 'New',
    discoveredAt: '2026-10-30T15:00:00Z',
  },
  {
    id: 'lead-003',
    post: {
      id: 'post-003',
      subreddit: 'r/IndiaInvestments',
      title: 'GST registration for freelancer — is it mandatory if I earn under 20L?',
      body: `I am a freelance UI/UX designer earning around ₹18L/year, all from Indian clients. My CA says I need GST but a friend says below ₹20L threshold it is not required. Confused. Also if I register, what returns do I have to file every month? Is it a lot of work?`,
      author: 'u/freelance_designer_99',
      upvotes: 78,
      commentCount: 41,
      postedAt: '2026-10-29T11:05:00Z',
      permalink: 'https://reddit.com/r/IndiaTax/comments/sample003',
      isSampleData: true,
    },
    matchedServiceIds: ['gst-registration', 'gst-return-filing', 'itr-filing'],
    intentLevel: 'Medium',
    relevanceScore: 74,
    reasoningSummary:
      'Freelancer confused about GST threshold and compliance requirements. Actively seeking tax advice with specific revenue details. Medium intent — may convert if properly informed about simplified filing options.',
    suggestedReply:
      `Great question! For service providers, voluntary GST registration is allowed even below the ₹20L threshold, and it can actually benefit you if your clients are GST-registered businesses (they can claim input credit). Post-registration, you typically file GSTR-1 monthly/quarterly and GSTR-3B monthly. NoLegalPaisa handles GST registration and can set you up with a compliance plan that takes the filing burden off your plate. Happy to clarify further!`,
    status: 'Reviewing',
    discoveredAt: '2026-10-29T12:00:00Z',
  },
  {
    id: 'lead-004',
    post: {
      id: 'post-004',
      subreddit: 'r/startups',
      title: 'Trademark my brand name before launch — how urgent is it?',
      body: `We are 2 weeks from launching our D2C skincare brand. Someone just told me I should trademark my brand name and logo ASAP or someone could copy it. Is this true? How long does trademark registration take in India? Can I use ™ before registration is complete? What is the approximate cost?`,
      author: 'u/d2c_skincare_founder',
      upvotes: 63,
      commentCount: 29,
      postedAt: '2026-11-01T08:45:00Z',
      permalink: 'https://reddit.com/r/startups/comments/sample004',
      isSampleData: true,
    },
    matchedServiceIds: ['trademark-registration', 'copyright-registration', 'design-registration'],
    intentLevel: 'High',
    relevanceScore: 95,
    reasoningSummary:
      'Imminent launch deadline creates high urgency. User is asking concrete questions about cost and timeline — strong purchase intent. Brand protection services are a direct match.',
    suggestedReply:
      `Yes, filing ASAP is the right call! Trademark registration in India operates on a first-to-file basis. Once you file, you can use the ™ symbol immediately. Registration typically takes 18–24 months due to government processing, but your priority date is locked from filing day. Cost varies by class — typically ₹4,500–9,000 in government fees plus professional fees. NoLegalPaisa can file your trademark application quickly and guide you through protecting both your brand name and logo. Good luck with the launch!`,
    status: 'Replied',
    discoveredAt: '2026-11-01T09:30:00Z',
  },
  {
    id: 'lead-005',
    post: {
      id: 'post-005',
      subreddit: 'r/india',
      title: 'FSSAI licence for home bakery — is it compulsory?',
      body: `I run a small home bakery and sell cakes on Instagram. Monthly revenue is about ₹30k. A friend scared me saying I need an FSSAI licence otherwise I can be fined. Is a basic registration enough or do I need a full licence? What is the process?`,
      author: 'u/homebaker_pune',
      upvotes: 89,
      commentCount: 36,
      postedAt: '2026-10-27T16:30:00Z',
      permalink: 'https://reddit.com/r/india/comments/sample005',
      isSampleData: true,
    },
    matchedServiceIds: ['fssai-licence', 'msme-udyam', 'sole-proprietorship'],
    intentLevel: 'High',
    relevanceScore: 85,
    reasoningSummary:
      'Home baker with active revenue needs FSSAI compliance urgently due to compliance anxiety. Clear service match, the question is practical and action-oriented.',
    suggestedReply:
      `Yes, FSSAI registration is mandatory even for home-based food businesses selling commercially. At ₹30k/month (~₹3.6L/year) you qualify for the basic FSSAI registration (not the full licence) which is simpler and cheaper. It is a one-time registration valid for 1–5 years. NoLegalPaisa can handle the application and documentation for you so you are fully compliant. Would you like help with this?`,
    status: 'New',
    discoveredAt: '2026-10-27T17:00:00Z',
  },
  {
    id: 'lead-006',
    post: {
      id: 'post-006',
      subreddit: 'r/legaladvice',
      title: 'My co-founder wants to leave — how do I handle the equity and IP?',
      body: `We are a 2-person startup, pre-revenue, 6 months in. My co-founder wants to exit citing personal reasons. We never signed a formal founders agreement (I know, big mistake). He says he wants 25% equity and full rights to the code he wrote. I am not sure what my options are legally. We have no outside investors yet.`,
      author: 'u/solo_now_founder',
      upvotes: 134,
      commentCount: 67,
      postedAt: '2026-11-01T20:10:00Z',
      permalink: 'https://reddit.com/r/legaladvice/comments/sample006',
      isSampleData: true,
    },
    matchedServiceIds: ['founders-exit', 'legal-drafting', 'virtual-legal-counsel', 'copyright-registration'],
    intentLevel: 'High',
    relevanceScore: 90,
    reasoningSummary:
      'Urgent co-founder dispute with IP and equity implications. No formal agreement in place — high risk situation requiring immediate legal guidance. Strong multi-service lead.',
    suggestedReply:
      `This is a critical situation and getting legal advice quickly is important. Without a founders agreement, resolution will depend on what can be evidenced (emails, commits, contributions). Key areas to address: equity split documentation, IP assignment (code ownership), and exit terms. NoLegalPaisa offers Virtual Legal Counsel for exactly this scenario — a startup-experienced lawyer can assess your situation, help negotiate the exit terms, and draft a proper separation agreement to protect you going forward. Time-sensitive, so do not delay.`,
    status: 'New',
    discoveredAt: '2026-11-01T21:00:00Z',
  },
  {
    id: 'lead-007',
    post: {
      id: 'post-007',
      subreddit: 'r/IndiaInvestments',
      title: 'What is the correct ITR form for someone with salary + freelance income?',
      body: `I have a salaried job (₹12L CTC) and also do freelance consulting on the side (₹3–4L/year). Which ITR form should I file? My company gives Form 16. Do I need a CA or can I do it myself on the government portal? Deadline is July 31.`,
      author: 'u/salary_plus_freelance',
      upvotes: 55,
      commentCount: 30,
      postedAt: '2026-10-25T07:20:00Z',
      permalink: 'https://reddit.com/r/IndiaTax/comments/sample007',
      isSampleData: true,
    },
    matchedServiceIds: ['itr-filing', 'gst-registration'],
    intentLevel: 'Medium',
    relevanceScore: 68,
    reasoningSummary:
      'User needs ITR filing assistance with a combined income profile. Medium intent — may self-file but has clear need for guidance. Good candidate for ITR filing service awareness.',
    suggestedReply:
      `For salary + freelance income, you need ITR-3 (if freelancing income counts as business/profession) or ITR-1 may not apply. The form depends on how your freelance work is classified. NoLegalPaisa offers hassle-free ITR filing — you share your documents and a tax expert handles the rest, ensuring you claim all eligible deductions. Costs much less than a traditional CA and is fully online.`,
    status: 'Archived',
    discoveredAt: '2026-10-25T08:00:00Z',
  },
  {
    id: 'lead-008',
    post: {
      id: 'post-008',
      subreddit: 'r/india',
      title: 'NRI planning to buy property in India — what are the legal formalities?',
      body: `I am an Indian citizen living in Canada for the past 8 years. I want to buy a flat in Hyderabad for ₹80L. My parents will use it. What are the legal steps for an NRI buying property in India? Do I need a power of attorney? Are there any RBI restrictions? Tax implications in Canada?`,
      author: 'u/canada_nri_2026',
      upvotes: 91,
      commentCount: 48,
      postedAt: '2026-10-31T13:00:00Z',
      permalink: 'https://reddit.com/r/india/comments/sample008',
      isSampleData: true,
    },
    matchedServiceIds: ['nri-helpdesk', 'legal-drafting', 'due-diligence', 'itr-filing'],
    intentLevel: 'High',
    relevanceScore: 87,
    reasoningSummary:
      'NRI with concrete high-value property transaction underway. Multiple legal and tax services are required. Clear high-intent buyer seeking expert guidance.',
    suggestedReply:
      `NRIs can buy residential and commercial property in India with some regulations. Key steps: verify property title (due diligence), understand FEMA/RBI guidelines for payment (must be through NRE/NRO accounts), consider a Power of Attorney if you cannot be present in India, and understand TDS implications (buyer must deduct TDS at 20%+ if seller is NRI). NoLegalPaisa has an NRI Help Desk specifically for situations like yours — we can handle due diligence, POA drafting, and tax planning across both jurisdictions. Happy to help!`,
    status: 'New',
    discoveredAt: '2026-10-31T14:00:00Z',
  },
]

