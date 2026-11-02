import { useState } from 'react'
import { BookOpen, Layers, LayoutDashboard, Menu, Search } from 'lucide-react'
import { Dashboard } from './components/dashboard/Dashboard'
import { ServiceCatalog } from './components/ServiceCatalog'
import { OpportunityDiscovery } from './components/opportunities/OpportunityDiscovery'

type View = 'dashboard' | 'catalog' | 'opportunities'

const NAV_ITEMS: { id: View; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview and key metrics' },
  { id: 'catalog', label: 'Service Catalog', icon: BookOpen, description: 'NoLegalPaisa services' },
  { id: 'opportunities', label: 'Opportunities', icon: Search, description: 'Reddit lead discovery' },
]

function Sidebar({
  activeView,
  onNavigate,
  mobileOpen,
  onClose,
}: {
  activeView: View
  onNavigate: (v: View) => void
  mobileOpen: boolean
  onClose: () => void
}) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-30 transform transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-auto md:z-auto`}
      >
        {/* Logo / brand */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">Reddit Lead Toolkit</p>
              <p className="text-xs text-slate-400">NoLegalPaisa · Prototype</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon, description }) => {
            const isActive = activeView === id
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); onClose() }}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
              >
                <Icon size={17} className={`mt-0.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <div>
                  <p className={`text-sm font-semibold ${isActive ? 'text-blue-700' : ''}`}>{label}</p>
                  <p className="text-xs text-slate-400">{description}</p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Footer note */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400 leading-snug">
            v0.1.0 · Initial prototype · Sample data only
          </p>
        </div>
      </aside>
    </>
  )
}

function Header({ currentView, onMenuToggle }: { currentView: View; onMenuToggle: () => void }) {
  const nav = NAV_ITEMS.find((n) => n.id === currentView)!
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
      <button
        onClick={onMenuToggle}
        className="md:hidden text-slate-500 hover:text-slate-700 transition-colors"
      >
        <Menu size={20} />
      </button>
      <div>
        <h1 className="text-base font-bold text-slate-800">{nav.label}</h1>
        <p className="text-xs text-slate-400">{nav.description}</p>
      </div>
    </header>
  )
}

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function renderView() {
    switch (activeView) {
      case 'dashboard': return <Dashboard />
      case 'catalog': return <ServiceCatalog />
      case 'opportunities': return <OpportunityDiscovery />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 md:ml-0">
        <Header currentView={activeView} onMenuToggle={() => setMobileMenuOpen((v) => !v)} />

        <main className="flex-1 px-6 py-6 max-w-6xl w-full mx-auto">
          {renderView()}
        </main>
      </div>
    </div>
  )
}
