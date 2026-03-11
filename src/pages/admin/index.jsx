import { useState } from 'react'
import PlaylistSelector from '../../components/admin/PlaylistSelector'
import ParentalControls from '../../components/admin/ParentalControls'

/**
 * Admin Interface
 * Parent controls for content curation and time limits
 */
export default function AdminInterface() {
  const [activeTab, setActiveTab] = useState('content') // 'content', 'limits'

  return (
    <div className="w-full min-h-screen py-5 px-4 sm:py-6 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="hero-card px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="section-kicker mb-4">Eltern Steuerung</div>
              <h1 className="title-display text-4xl sm:text-5xl leading-[0.95] text-[#2c2340] mb-3">⚙️ Eltern-Bereich</h1>
              <p className="text-[#6d6387] text-base sm:text-lg font-bold">Inhalte kuratieren, Zeitfenster steuern und das Erlebnis für Kinder klar und ruhig halten.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="sun-chip"><span>📚</span><span>Inhalte</span></div>
              <div className="sun-chip"><span>⏱️</span><span>Zeitregeln</span></div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="md3-surface-high inline-flex gap-2 p-2 w-fit">
          {[
            { id: 'content', label: '📚 Inhalte' },
            { id: 'limits', label: '⏱️ Zeitlimits' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-full font-extrabold text-sm transition md3-focus-ring ${
                activeTab === tab.id
                  ? 'bg-[#2c2340] text-white shadow-[0_12px_24px_rgba(44,35,64,0.18)]'
                  : 'text-[#6d6387] hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md3-surface p-5 sm:p-6">
          {activeTab === 'content' && <PlaylistSelector />}
          {activeTab === 'limits' && <ParentalControls />}
        </div>

        {/* Footer Info */}
        <div className="hero-card-soft p-4 text-sm text-[#6d6387] font-bold">
          <p>✅ Änderungen werden sofort gespeichert.</p>
        </div>
      </div>
    </div>
  )
}
