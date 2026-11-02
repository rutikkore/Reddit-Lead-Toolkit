import { SERVICE_CATEGORIES, ALL_SERVICES } from '../data/services'
import type { ServiceCategory, Service, CustomerSegment } from '../types'
import { Briefcase, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

// Map category IDs to Tailwind accent colours
const CATEGORY_COLOURS: Record<string, string> = {
  'legal-services': 'bg-blue-50 border-blue-200 text-blue-700',
  'business-incorporation': 'bg-purple-50 border-purple-200 text-purple-700',
  'startup-support': 'bg-orange-50 border-orange-200 text-orange-700',
  'taxation-compliance': 'bg-green-50 border-green-200 text-green-700',
  'intellectual-property': 'bg-pink-50 border-pink-200 text-pink-700',
  'licences-registrations': 'bg-teal-50 border-teal-200 text-teal-700',
  'odr': 'bg-cyan-50 border-cyan-200 text-cyan-700',
  'specialised-solutions': 'bg-slate-50 border-slate-200 text-slate-700',
}

export function ServiceCatalog() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['legal-services', 'business-incorporation'])
  )

  function toggleCategory(id: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-col">
          <span className="text-2xl font-bold text-slate-800">{SERVICE_CATEGORIES.length}</span>
          <span className="text-xs text-slate-500 mt-0.5">Service Categories</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-col">
          <span className="text-2xl font-bold text-slate-800">{ALL_SERVICES.length}</span>
          <span className="text-xs text-slate-500 mt-0.5">Total Services</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-col">
          <span className="text-2xl font-bold text-slate-800">
            {ALL_SERVICES.reduce((acc: number, svc: Service) => acc + svc.keywords.length, 0)}
          </span>
          <span className="text-xs text-slate-500 mt-0.5">Discovery Keywords</span>
        </div>
      </div>

      {/* Category accordion */}
      <div className="space-y-2">
        {SERVICE_CATEGORIES.map((category: ServiceCategory, idx: number) => {
          const isOpen = expandedCategories.has(category.id)
          const colourClass = CATEGORY_COLOURS[category.id] ?? 'bg-slate-50 border-slate-200 text-slate-700'

          return (
            <div key={category.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              {/* Category header */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold border ${colourClass}`}>
                    {idx + 1}
                  </span>
                  <Briefcase size={15} className="text-slate-400" />
                  <span className="font-semibold text-slate-800 text-sm">{category.name}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {category.services.length} services
                  </span>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
              </button>

              {/* Services list */}
              {isOpen && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {category.services.map((svc: Service) => (
                    <div key={svc.id} className="px-4 py-3 hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 font-medium">{svc.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {svc.keywords.map((kw: string) => (
                              <span key={kw} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 shrink-0">
                          {svc.targetCustomers.map((tc: CustomerSegment) => (
                            <span key={tc} className={`text-xs px-1.5 py-0.5 rounded border ${colourClass}`}>
                              {tc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
