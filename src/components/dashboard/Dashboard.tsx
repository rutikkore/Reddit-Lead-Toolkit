import { SAMPLE_LEADS } from '../../data/sampleLeads'
import { SERVICE_CATEGORIES, ALL_SERVICES } from '../../data/services'
import type { LeadStatus, IntentLevel } from '../../types'
import { AlertTriangle, BookOpen, Search, TrendingUp, Users } from 'lucide-react'

function StatCard({ label, value, sub, icon: Icon, colour }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; colour: string
}) {
  return (
    <div className={`bg-white border rounded-xl p-5 flex items-start gap-4 shadow-sm ${colour}`}>
      <div className={`rounded-lg p-2.5 ${colour.replace('border-', 'bg-').replace(/\btext-\S+/, '')}`}>
        <Icon size={20} className={colour.split(' ').find((c) => c.startsWith('text-')) ?? 'text-slate-600'} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function IntentBreakdown() {
  const counts: Record<IntentLevel, number> = { High: 0, Medium: 0, Low: 0 }
  SAMPLE_LEADS.forEach((l) => counts[l.intentLevel]++)

  const bars: { level: IntentLevel; colour: string }[] = [
    { level: 'High', colour: 'bg-red-400' },
    { level: 'Medium', colour: 'bg-yellow-400' },
    { level: 'Low', colour: 'bg-slate-300' },
  ]
  const total = SAMPLE_LEADS.length

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Intent Level Breakdown</h3>
      <div className="space-y-2.5">
        {bars.map(({ level, colour }) => (
          <div key={level} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-14 shrink-0">{level}</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${colour}`}
                style={{ width: `${(counts[level] / total) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600 w-5 text-right">{counts[level]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBreakdown() {
  const counts: Record<LeadStatus, number> = { New: 0, Reviewing: 0, Replied: 0, Archived: 0 }
  SAMPLE_LEADS.forEach((l) => counts[l.status]++)

  const items: { status: LeadStatus; colour: string }[] = [
    { status: 'New', colour: 'text-blue-600 bg-blue-50 border-blue-200' },
    { status: 'Reviewing', colour: 'text-purple-600 bg-purple-50 border-purple-200' },
    { status: 'Replied', colour: 'text-green-600 bg-green-50 border-green-200' },
    { status: 'Archived', colour: 'text-slate-500 bg-slate-50 border-slate-200' },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Lead Status Overview</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ status, colour }) => (
          <div key={status} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium ${colour}`}>
            <span>{status}</span>
            <span className="text-base font-bold">{counts[status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TopSubreddits() {
  const counts: Record<string, number> = {}
  SAMPLE_LEADS.forEach((l) => {
    counts[l.post.subreddit] = (counts[l.post.subreddit] ?? 0) + 1
  })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const max = sorted[0]?.[1] ?? 1

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Subreddits</h3>
      <div className="space-y-2">
        {sorted.map(([sub, count]) => (
          <div key={sub} className="flex items-center gap-3">
            <span className="text-xs text-orange-600 font-medium w-36 shrink-0 truncate">{sub}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-orange-400" style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-600 w-4 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SampleDataNotice() {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-amber-800">Demo Dashboard — Sample Data Only</p>
        <p className="text-xs text-amber-700 mt-1">
          All metrics shown reflect the fictional sample dataset bundled with this prototype.
          No real Reddit data has been fetched. Live data and analytics will be available after
          Reddit API integration is approved and implemented.
        </p>
      </div>
    </div>
  )
}

export function Dashboard() {
  const highIntent = SAMPLE_LEADS.filter((l) => l.intentLevel === 'High').length
  const avgScore = Math.round(SAMPLE_LEADS.reduce((a, l) => a + l.relevanceScore, 0) / SAMPLE_LEADS.length)

  return (
    <div className="space-y-6">
      <SampleDataNotice />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Sample Opportunities"
          value={SAMPLE_LEADS.length}
          sub="Fictional demo posts"
          icon={Search}
          colour="border-blue-200 text-blue-600"
        />
        <StatCard
          label="High Intent"
          value={highIntent}
          sub="Strong buying signals"
          icon={TrendingUp}
          colour="border-red-200 text-red-600"
        />
        <StatCard
          label="Avg. Relevance Score"
          value={`${avgScore}/100`}
          sub="Across sample leads"
          icon={Users}
          colour="border-green-200 text-green-600"
        />
        <StatCard
          label="Services in Catalog"
          value={ALL_SERVICES.length}
          sub={`Across ${SERVICE_CATEGORIES.length} categories`}
          icon={BookOpen}
          colour="border-purple-200 text-purple-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <IntentBreakdown />
        <StatusBreakdown />
        <TopSubreddits />
      </div>

      {/* Recent leads preview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Opportunities</h3>
        <div className="space-y-2">
          {SAMPLE_LEADS.slice(0, 5).map((lead) => (
            <div key={lead.id} className="flex items-center gap-3 text-sm py-2 border-b border-slate-50 last:border-0">
              <span className="text-xs text-orange-500 font-medium w-32 shrink-0 truncate">{lead.post.subreddit}</span>
              <span className="flex-1 text-slate-700 text-xs truncate">{lead.post.title}</span>
              <span className={`text-xs font-semibold shrink-0 ${
                lead.intentLevel === 'High' ? 'text-red-500' :
                lead.intentLevel === 'Medium' ? 'text-yellow-600' : 'text-slate-400'
              }`}>{lead.intentLevel}</span>
              <span className="text-xs text-slate-400 shrink-0 w-8 text-right">{lead.relevanceScore}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

