import { useState } from 'react'
import spotifyService from '../services/spotify'
import { decodeTransferPayload } from '../utils/sessionTransfer'

export default function Login() {
  const [transferCode, setTransferCode] = useState('')
  const [transferError, setTransferError] = useState('')

  const handleLogin = async () => {
    // ?setup=... über den OAuth-Redirect hinweg retten (iOS PWA hat separaten localStorage)
    const params = new URLSearchParams(window.location.search)
    const setup = params.get('setup')
    if (setup) {
      localStorage.setItem('pending_setup', setup)
    }
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
    if (payload.setup) {
      localStorage.setItem('pending_setup', payload.setup)
    }

    window.location.reload()
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Logo */}
        <div className="text-8xl animate-bounce">🎧</div>

        <div>
          <h1 className="text-4xl font-extrabold text-violet-950 mb-2">Kinder-Hörspiele</h1>
          <p className="text-violet-700">Dein Spotify Hörspiele-Player</p>
        </div>

        {/* Features */}
        <div className="md3-surface p-6 text-left space-y-4">
          {[
            { icon: '👶', title: 'Kindgerecht', desc: 'Große Kacheln, einfache Bedienung' },
            { icon: '⏯️', title: 'Fortsetzen & Neustarten', desc: 'Spielposition wird gespeichert' },
            { icon: '⏱️', title: 'Zeitlimits für Eltern', desc: 'Tägliche Hördauer festlegen' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-bold text-violet-950 text-sm">{title}</p>
                <p className="text-violet-700 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-4 px-6 md3-btn-filled md3-focus-ring active:scale-95 font-extrabold text-lg transition-all"
        >
          Mit Spotify anmelden
        </button>

        <div className="md3-surface-high p-4 text-left">
          <p className="text-xs font-bold text-violet-900 mb-2">📲 Home-App Transfer</p>
          <p className="text-[11px] text-violet-700 mb-2">
            Wenn du die App als iPhone Home-Screen App nutzt: Transfer-Code aus Safari hier einfügen.
          </p>
          <textarea
            value={transferCode}
            onChange={(e) => setTransferCode(e.target.value)}
            placeholder="Transfer-Code hier einfügen"
            className="w-full h-20 p-2 text-[11px] border border-violet-300 rounded-xl bg-white text-violet-950 md3-focus-ring"
          />
          {transferError && (
            <p className="text-[11px] text-rose-600 mt-1">{transferError}</p>
          )}
          <button
            onClick={handleImportTransferCode}
            className="w-full mt-2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition text-sm md3-focus-ring"
          >
            Transfer-Code importieren
          </button>
        </div>

        <p className="text-xs text-violet-700">
          Spotify Premium wird für die Wiedergabe benötigt
        </p>
      </div>
    </div>
  )
}
