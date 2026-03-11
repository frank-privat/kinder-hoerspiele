import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShieldAlert, LogOut } from 'lucide-react'
import { useStore } from '../../contexts/store'
import spotifyService from '../../services/spotify'
import PinModal from '../../components/PinModal'

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const navigate = useNavigate()
  const reset = useStore((s) => s.reset)
  const spotifyUser = useStore((s) => s.spotifyUser)
  const isSyncing = useStore((s) => s.isSyncing)

  const handleLogout = () => {
    setMenuOpen(false)
    localStorage.removeItem('spotify_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_token_expiry')
    spotifyService.token = null
    reset()
    navigate('/')
  }

  const handleAdminClick = () => {
    setMenuOpen(false)
    setShowPin(true)
  }

  return (
    <>
      <header className="relative bg-card border-b border-border px-[var(--spacing-2)] py-[var(--spacing-2)] shadow-[var(--shadow-sm)] z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigate('/player')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-mint to-lavender rounded-[var(--radius-md)] flex items-center justify-center shadow-[var(--shadow-sm)]">
              <span className="text-2xl">🎧</span>
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-[var(--font-weight-bold)] bg-gradient-to-r from-mint-dark to-lavender-dark bg-clip-text text-transparent leading-none">
                Kinder-Hörspiele
              </h1>
              {spotifyUser && (
                <p className="text-[var(--text-xs)] text-muted-foreground flex items-center gap-1">
                  {isSyncing && <span className="inline-block w-1.5 h-1.5 rounded-full bg-mint-dark animate-pulse" />}
                  {spotifyUser.display_name}
                </p>
              )}
            </div>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-muted transition-colors"
          >
            {menuOpen ? <X className="size-6 text-foreground" /> : <Menu className="size-6 text-foreground" />}
          </button>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 mr-[var(--spacing-2)] w-64 bg-card rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-border overflow-hidden z-50"
            >
              <div className="p-2">
                <button
                  onClick={handleAdminClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-peach-light transition-colors text-left"
                >
                  <ShieldAlert className="size-5 text-accent-foreground" />
                  <span className="font-semibold">Eltern-Bereich</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-muted transition-colors text-left text-muted-foreground"
                >
                  <LogOut className="size-5" />
                  <span>Abmelden</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* PIN modal */}
      <AnimatePresence>
        {showPin && (
          <PinModal
            onSuccess={() => {
              setShowPin(false)
              navigate('/admin')
            }}
            onCancel={() => setShowPin(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
