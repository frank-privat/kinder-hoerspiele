import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Shield } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { PlayfulCard } from '../components/PlayfulCard'
import PinModal from '../../components/PinModal'
import PlaylistSelector from '../../components/admin/PlaylistSelector'
import ParentalControls from '../../components/admin/ParentalControls'

export function AdminScreen() {
  const navigate = useNavigate()
  const [pinVerified, setPinVerified] = useState(false)
  const [activeTab, setActiveTab] = useState('content')

  if (!pinVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-peach-light/40 via-background to-sunshine-light/40">
        <AppHeader />
        <AnimatePresence>
          <PinModal
            onSuccess={() => setPinVerified(true)}
            onCancel={() => navigate('/player')}
          />
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-light/40 via-background to-sunshine-light/40">
      <AppHeader />

      <main className="max-w-5xl mx-auto p-[var(--spacing-2)] md:p-[var(--spacing-4)]">
        {/* Header */}
        <div className="mb-[var(--spacing-4)]">
          <button
            onClick={() => navigate('/player')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-[var(--spacing-3)] transition-colors"
          >
            <ArrowLeft className="size-5" />
            Zurück zum Player
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-peach to-lavender rounded-[var(--radius-lg)] flex items-center justify-center">
              <Shield className="size-6 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="leading-none">⚙️ Eltern-Bereich</h2>
              <p className="text-muted-foreground text-[var(--text-sm)]">
                Inhalte & Zeitregeln verwalten
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-[var(--spacing-3)]">
          {[
            { id: 'content', label: '📚 Inhalte' },
            { id: 'limits', label: '⏱️ Zeitlimits' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-[var(--radius-xl)] font-bold text-[var(--text-sm)] transition-all ${
                activeTab === tab.id
                  ? 'bg-mint text-primary-foreground shadow-[var(--shadow-sm)]'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <PlayfulCard className="min-h-[400px]">
          {activeTab === 'content' && <PlaylistSelector />}
          {activeTab === 'limits' && <ParentalControls />}
        </PlayfulCard>

        <p className="text-[var(--text-xs)] text-muted-foreground mt-[var(--spacing-3)] text-center">
          ✅ Änderungen werden sofort gespeichert
        </p>
      </main>
    </div>
  )
}
