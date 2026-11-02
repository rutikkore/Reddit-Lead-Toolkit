import { useState } from 'react'
import { SAMPLE_LEADS } from '../../data/sampleLeads'
import { SERVICE_BY_ID } from '../../data/services'
import type { LeadOpportunity, LeadStatus, IntentLevel } from '../../types'
import { IntentBadge, RelevanceScore, SampleDataBanner, StatusBadge } from '../ui/Badges'
import { ArrowUpRight, ChevronDown, ChevronUp, MessageSquare, Search, SlidersHorizontal, ThumbsUp } from 'lucide-react'

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------
const ALL_STATUSES: LeadStatus[] = ['New', 'Reviewing', 'Replied', 'Archived']
const ALL_INTENTS: IntentLevel[] = ['High', 'Medium', 'Low']

function Filters({
  statusFilter,
  intentFilter,
  searchQuery,
  onStatusChange,
  onIntentChange,
  onSearchChange,
}: {
  statusFilter: LeadStatus | 'All'
  intentFilter: IntentLevel | 'All'
  searchQuery: string
  onStatusChange: (v: LeadStatus | 'All') => void
  onIntentChange: (v: IntentLevel | 'All') => void
  onSearchChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Keyword search */}
      <div className="relative flex-1 min-w-52">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search posts, subreddits, services…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1.5">
        <SlidersHorizontal size={14} className="text-slate-400" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as LeadStatus | 'All')}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Intent filter */}
      <select
        value={intentFilter}
        onChange={(e) => onIntentChange(e.target.value as IntentLevel | 'All')}
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="All">All Intent Levels</option>
        {ALL_INTENTS.map((i) => (
          <option key={i} value={i}>{i} Intent</option>
        ))}
      </select>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Single lead card
// ---------------------------------------------------------------------------
function LeadCard({ lead, onStatusChange }: { lead: LeadOpportunity; onStatusChange: (id: string, status: LeadStatus) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const matchedServices = lead.matchedServiceIds
    .map((id) => SERVICE_BY_ID[id])
    .filter(Boolean)

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                {lead.post.subreddit}
              </span>
              <span className="text-xs text-slate-400">
                by {lead.post.author} · {new Date(lead.post.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
              <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                SAMPLE DATA
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 leading-snug">{lead.post.title}</h3>
          </div>

          {/* Scores */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <IntentBadge level={lead.intentLevel} />
            <RelevanceScore score={lead.relevanceScore} />
          </div>
        </div>

        {/* Post body preview */}
        <p className={`text-xs text-slate-500 mt-2 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
          {lead.post.body}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400">
          <span className="flex items-center gap-1"><ThumbsUp size={11} /> {lead.post.upvotes}</span>
          <span className="flex items-center gap-1"><MessageSquare size={11} /> {lead.post.commentCount}</span>
          <a href={lead.post.permalink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-0.5 text-blue-500 hover:underline ml-auto">
            View <ArrowUpRight size={11} />
          </a>
        </div>

        {/* Matched services */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {matchedServices.map((svc) => (
            <span key={svc.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
              {svc.name}
            </span>
          ))}
        </div>

        {/* Expand / collapse toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-slate-400 mt-3 hover:text-slate-600 transition-colors"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Show less' : 'Show reasoning & reply'}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-4 bg-slate-50/50">
          {/* Reasoning */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Reasoning</p>
            <p className="text-sm text-slate-700">{lead.reasoningSummary}</p>
          </div>

          {/* Suggested reply */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Suggested Reply</p>
              <button
                onClick={() => setShowReply((v) => !v)}
                className="text-xs text-blue-600 hover:underline"
              >
                {showReply ? 'Hide' : 'Show'}
              </button>
            </div>
            {showReply && (
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-sm text-slate-700 leading-relaxed">{lead.suggestedReply}</p>
                <p className="text-xs text-slate-400 mt-2 italic">
                  Review and personalise before posting. Follow Reddit community rules.
                </p>
              </div>
            )}
          </div>

          {/* Status controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-500">Change status:</span>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(lead.id, s)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium
                  ${lead.status === s
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
              >
                {s}
              </button>
            ))}
            <StatusBadge status={lead.status} />
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Opportunity Discovery main view
// ---------------------------------------------------------------------------
export function OpportunityDiscovery() {
  const [leads, setLeads] = useState<LeadOpportunity[]>(SAMPLE_LEADS)
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All')
  const [intentFilter, setIntentFilter] = useState<IntentLevel | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  function handleStatusChange(id: string, status: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  const filtered = leads.filter((lead) => {
    if (statusFilter !== 'All' && lead.status !== statusFilter) return false
    if (intentFilter !== 'All' && lead.intentLevel !== intentFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const text = `${lead.post.title} ${lead.post.body} ${lead.post.subreddit} ${lead.matchedServiceIds.join(' ')}`.toLowerCase()
      if (!text.includes(q)) return false
    }
    return true
  })

  return (
    <div className="space-y-4">
      <SampleDataBanner />

      <Filters
        statusFilter={statusFilter}
        intentFilter={intentFilter}
        searchQuery={searchQuery}
        onStatusChange={setStatusFilter}
        onIntentChange={setIntentFilter}
        onSearchChange={setSearchQuery}
      />

      {/* Results count */}
      <p className="text-xs text-slate-500">
        Showing <strong>{filtered.length}</strong> of <strong>{leads.length}</strong> sample opportunities
      </p>

      {/* Lead cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Search size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No opportunities match your filters.</p>
          </div>
        ) : (
          filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onStatusChange={handleStatusChange} />
          ))
        )}
      </div>
    </div>
  )
}

