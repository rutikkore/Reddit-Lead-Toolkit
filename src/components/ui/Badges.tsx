import type { IntentLevel, LeadStatus } from '../../types'

// ---------------------------------------------------------------------------
// Intent badge
// ---------------------------------------------------------------------------
const INTENT_STYLES: Record<IntentLevel, string> = {
  High: 'bg-red-100 text-red-700 border border-red-200',
  Medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Low: 'bg-slate-100 text-slate-600 border border-slate-200',
}

export function IntentBadge({ level }: { level: IntentLevel }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${INTENT_STYLES[level]}`}>
      {level} Intent
    </span>
  )
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
const STATUS_STYLES: Record<LeadStatus, string> = {
  New: 'bg-blue-100 text-blue-700 border border-blue-200',
  Reviewing: 'bg-purple-100 text-purple-700 border border-purple-200',
  Replied: 'bg-green-100 text-green-700 border border-green-200',
  Archived: 'bg-slate-100 text-slate-500 border border-slate-200',
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Sample data warning banner
// ---------------------------------------------------------------------------
export function SampleDataBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
      <span className="text-base">⚠️</span>
      <span>
        <strong>Sample Data Only.</strong> The posts shown below are fictional examples for UI prototyping. They do not
        represent real Reddit discussions or real users. Live Reddit data requires approved API integration.
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Relevance score pill
// ---------------------------------------------------------------------------
function scoreColor(score: number) {
  if (score >= 85) return 'bg-green-500'
  if (score >= 65) return 'bg-yellow-400'
  return 'bg-slate-300'
}

export function RelevanceScore({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600">{score}</span>
    </div>
  )
}
