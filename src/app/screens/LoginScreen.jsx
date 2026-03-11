import { useState } from 'react'
import { motion } from 'framer-motion'
import { Music, KeyRound } from 'lucide-react'
import { PlayfulButton } from '../components/PlayfulButton'
import { PlayfulCard } from '../components/PlayfulCard'
import spotifyService from '../../services/spotify'
import { decodeTransferPayload } from '../../utils/sessionTransfer'

export function LoginScreen() {
  const [showTransferInput, setShowTransferInput] = useState(false)
  const [transferCode, setTransferCode] = useState('')
  const [transferError, setTransferError] = useState('')

  const handleSpotifyLogin = async () => {
    // Save ?setup= param before redirecting to Spotify
    const params = new URLSearchParams(window.location.search)
    const setup = params.get('setup')
    if (setup) localStorage.setItem('pending_setup', setup)
    const authUrl = await spotifyService.getAuthUrl()
    window.location.href = authUrl
  }

  const handleImportTransferCode = () => {
    setTransferError('')
    const payload = decodeTransferPayload(transferCode)
    if (!payload) {
      setTransferError('Ungültiger oder abgelaufener Transfer-Code.')
      return
    }
    localStorage.setItem('spotify_token', payload.token)
    localStorage.setItem('spotify_refresh_token', payload.refreshToken)
    localStorage.setItem('spotify_token_expiry', String(payload.tokenExpiry))
    if (payload.setup) localStorage.setItem('pending_setup', payload.setup)
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-[var(--spacing-2)] bg-gradient-to-br from-mint-light via-lavender-light to-peach-light">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <PlayfulCard className="text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-[var(--spacing-4)]"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-mint to-lavender rounded-[var(--radius-2xl)] flex items-center justify-center shadow-[var(--shadow-lg)] mb-[var(--spacing-3)]">
              <span className="text-6xl">🎧</span>
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-mint-dark via-lavender-dark to-peach-dark bg-clip-text text-transparent leading-tight">
              Kinder-Hörspiele
            </h1>
            <p className="text-muted-foreground text-[var(--text-lg)]">
              Dein Spotify Hörspiele-Player
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mb-[var(--spacing-4)] space-y-3 text-left"
          >
            {[
              { icon: '👶', title: 'Kindgerecht', desc: 'Große Cover, einfache Bedienung' },
              { icon: '⏯️', title: 'Fortsetzen', desc: 'Spielposition wird gespeichert' },
              { icon: '⏱️', title: 'Zeitlimits', desc: 'Tägliche Hördauer festlegen' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-2">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-bold text-[var(--text-sm)]">{title}</p>
                  <p className="text-muted-foreground text-[var(--text-xs)]">{desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Login buttons */}
          <div className="space-y-[var(--spacing-2)]">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <PlayfulButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleSpotifyLogin}
                icon={<Music className="size-5" />}
              >
                Mit Spotify anmelden
              </PlayfulButton>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              {!showTransferInput ? (
                <PlayfulButton
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowTransferInput(true)}
                  icon={<KeyRound className="size-5" />}
                >
                  Transfer-Code importieren
                </PlayfulButton>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={transferCode}
                    onChange={(e) => setTransferCode(e.target.value)}
                    placeholder="Transfer-Code hier einfügen"
                    className="w-full h-20 p-3 text-xs border-2 border-lavender rounded-[var(--radius-xl)] bg-background outline-none focus:border-lavender-dark transition-colors resize-none"
                    autoFocus
                  />
                  {transferError && (
                    <p className="text-[var(--text-xs)] text-destructive">{transferError}</p>
                  )}
                  <div className="flex gap-2">
                    <PlayfulButton
                      variant="outline"
                      size="md"
                      className="flex-1"
                      onClick={() => { setShowTransferInput(false); setTransferCode(''); setTransferError('') }}
                    >
                      Abbrechen
                    </PlayfulButton>
                    <PlayfulButton
                      variant="secondary"
                      size="md"
                      className="flex-1"
                      onClick={handleImportTransferCode}
                    >
                      Importieren
                    </PlayfulButton>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <p className="text-[var(--text-xs)] text-muted-foreground mt-[var(--spacing-3)]">
            Spotify Premium wird für die Wiedergabe benötigt
          </p>
        </PlayfulCard>
      </motion.div>
    </div>
  )
}
