import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../contexts/store'
import spotifyService from '../../services/spotify'
import { extractPlaylistId } from '../../utils/playlistLoader'
import { useSyncPlaylists } from '../../hooks/useSyncPlaylists'
import { encodeTransferPayload } from '../../utils/sessionTransfer'

const APP_BASE = 'https://frank-privat.github.io/kinder-hoerspiele/'

function getSetupUrl(playlistId) {
  return `${APP_BASE}?setup=${playlistId}`
}

function getQrUrl(playlistId) {
  const url = encodeURIComponent(getSetupUrl(playlistId))
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${url}`
}

export default function PlaylistSelector() {
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedPlaylist, setExpandedPlaylist] = useState(null)
  const [qrPlaylist, setQrPlaylist] = useState(null)
  const [copyState, setCopyState] = useState('idle')

  const stories = useStore((s) => s.stories)
  const playlists = useStore((s) => s.playlists)
  const addPlaylist = useStore((s) => s.addPlaylist)
  const removePlaylist = useStore((s) => s.removePlaylist)
  const removeStory = useStore((s) => s.removeStory)

  const { syncAll, isSyncing, syncError } = useSyncPlaylists()

  const handleLoadPlaylist = async () => {
    if (!playlistUrl) {
      setError('Bitte Playlist-URL eingeben')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const playlistId = extractPlaylistId(playlistUrl)
      if (!playlistId) {
        throw new Error(
          'Ungültiges Format. Nutze: https://open.spotify.com/playlist/...'
        )
      }

      const loadedPlaylist = await spotifyService.loadPlaylistAlbums(playlistId)
      const newStories = loadedPlaylist.stories

      if (newStories.length === 0) {
        throw new Error('Keine abspielbaren Inhalte in dieser Playlist gefunden.')
      }

      addPlaylist({
        id: playlistId,
        name: loadedPlaylist.name,
        sourceUrl: loadedPlaylist.url,
        stories: newStories,
      })
      setPlaylistUrl('')
    } catch (err) {
      console.error('Playlist load error:', err)
      setError(err.message || 'Fehler beim Laden der Playlist')
    } finally {
      setLoading(false)
    }
  }

  const storiesForPlaylist = (playlistId) =>
    stories.filter((s) => s.playlistId === playlistId)

  const createTransferCode = (playlistId) => {
    const token = localStorage.getItem('spotify_token')
    const refreshToken = localStorage.getItem('spotify_refresh_token')
    const tokenExpiry = parseInt(localStorage.getItem('spotify_token_expiry') || '0')
    if (!token || !refreshToken || !tokenExpiry) return ''

    return encodeTransferPayload({
      v: 1,
      createdAt: Date.now(),
      validUntil: Date.now() + 15 * 60 * 1000,
      token,
      refreshToken,
      tokenExpiry,
      setup: playlistId,
    })
  }

  const transferCode = qrPlaylist ? createTransferCode(qrPlaylist.id) : ''

  const handleCopyTransferCode = async () => {
    if (!transferCode) return
    try {
      await navigator.clipboard.writeText(transferCode)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch (_) {
      setCopyState('failed')
      setTimeout(() => setCopyState('idle'), 2000)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-violet-950">📚 Inhalte verwalten</h2>

      {/* Playlist-URL eingeben */}
      <div className="md3-surface-high p-4">
        <label className="block text-sm font-bold text-violet-900 mb-2">
          Spotify Playlist URL
        </label>
        <input
          type="url"
          placeholder="https://open.spotify.com/playlist/..."
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          className="w-full p-3 bg-white text-violet-950 rounded-xl border border-violet-300 focus:border-violet-700 outline-none md3-focus-ring"
        />
        <button
          onClick={handleLoadPlaylist}
          disabled={loading}
          className="mt-3 w-full py-3 md3-btn-filled disabled:opacity-50 text-white font-bold rounded-2xl md3-motion md3-focus-ring"
        >
          {loading ? '⏳ Laden...' : '➕ Playlist hinzufügen'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm">
          ❌ {error}
        </div>
      )}

      {/* Geladene Playlists mit Inhalten */}
      {playlists.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-violet-950">
              📋 Playlists ({playlists.length})
            </p>
            <button
              onClick={syncAll}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 md3-btn-filled disabled:opacity-50 text-white text-xs font-bold rounded-xl md3-motion md3-focus-ring md3-touch-target"
            >
              {isSyncing ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Synchronisiert…
                </>
              ) : (
                <>🔄 Alle synchronisieren</>
              )}
            </button>
          </div>

          {syncError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-2 rounded-xl text-xs">
              ⚠️ {syncError}
            </div>
          )}

          {playlists.map((pl) => {
            const plStories = storiesForPlaylist(pl.id)
            const isExpanded = expandedPlaylist === pl.id

            return (
              <div
                key={pl.id}
                className="md3-surface rounded-2xl overflow-hidden"
              >
                {/* Playlist-Header */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-violet-100 md3-motion"
                  onClick={() => setExpandedPlaylist(isExpanded ? null : pl.id)}
                >
                  <div className="text-lg">{isExpanded ? '📂' : '📁'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-violet-950 text-sm truncate">{pl.name}</p>
                    <p className="text-xs text-violet-700">{pl.storyCount} Alben</p>
                    {pl.lastSyncedAt && (
                      <p className="text-[11px] text-violet-700">
                        Aktualisiert: {new Date(pl.lastSyncedAt).toLocaleString('de-DE')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setQrPlaylist(qrPlaylist?.id === pl.id ? null : pl)
                    }}
                    className="px-3 py-2 bg-violet-200 hover:bg-violet-300 text-violet-900 rounded-xl text-xs font-bold md3-motion md3-focus-ring md3-touch-target"
                    title="Auf Handy übertragen"
                  >
                    📱
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removePlaylist(pl.id)
                    }}
                    className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold md3-motion md3-focus-ring md3-touch-target"
                  >
                    Entfernen
                  </button>
                </div>

                {/* Aufgeklappte Album-Liste */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-1.5">
                        {plStories.length === 0 ? (
                          <p className="text-xs text-violet-700 py-2 text-center">
                            Keine Alben in dieser Playlist
                          </p>
                        ) : (
                          plStories.map((story) => (
                            <div
                              key={story.id}
                              className="flex items-center gap-2.5 p-2 bg-white rounded-xl"
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-violet-300 to-pink-300 flex items-center justify-center text-sm">
                                {story.coverUrl ? (
                                  <img src={story.coverUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  '🎵'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-violet-950 font-bold truncate text-xs">{story.title}</p>
                                <p className="text-violet-700 text-[11px]">
                                  {story.artist || 'Spotify'} · {story.tracks?.length || 0} Tracks
                                </p>
                              </div>
                              <button
                                onClick={() => removeStory(story.id)}
                                className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold md3-motion md3-focus-ring"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}

          <p className="text-[11px] text-violet-700 text-center pt-1">
            🕐 Automatische Synchronisation alle 30 Minuten + bei jedem App-Start
          </p>
        </div>
      )}

      {/* QR-Code Modal */}
      <AnimatePresence>
        {qrPlaylist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setQrPlaylist(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-extrabold text-violet-950 mb-1 text-center">
                📱 Auf Handy übertragen
              </h3>
              <p className="text-xs text-violet-700 text-center mb-4">
                Safari: QR scannen. PWA: Transfer-Code kopieren und in der Login-Seite einfügen.
              </p>
              <div className="flex justify-center mb-4">
                <img
                  src={getQrUrl(qrPlaylist.id)}
                  alt="QR Code"
                  className="rounded-2xl border border-violet-100"
                  width={220}
                  height={220}
                />
              </div>
              <p className="text-[11px] text-violet-700 text-center mb-1 font-bold truncate">
                {qrPlaylist.name}
              </p>
              <p className="text-[10px] text-violet-500 text-center break-all mb-3">
                {getSetupUrl(qrPlaylist.id)}
              </p>
              <button
                onClick={handleCopyTransferCode}
                disabled={!transferCode}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold rounded-2xl md3-motion md3-focus-ring text-sm mb-2"
              >
                {copyState === 'copied'
                  ? '✅ Transfer-Code kopiert'
                  : copyState === 'failed'
                    ? '❌ Kopieren fehlgeschlagen'
                    : '📋 Transfer-Code kopieren'}
              </button>
              <textarea
                readOnly
                value={transferCode}
                className="w-full h-20 text-[10px] text-violet-900 bg-violet-50 border border-violet-300 rounded-xl p-2 mb-2"
              />
              <button
                onClick={() => setQrPlaylist(null)}
                className="w-full py-2.5 md3-btn-filled text-white font-bold rounded-2xl md3-motion md3-focus-ring text-sm"
              >
                Schließen
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {playlists.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📻</div>
          <p className="text-violet-700 text-sm">Füge eine Spotify-Playlist hinzu, um zu starten.</p>
        </div>
      )}

      <div className="text-xs text-violet-800 p-3 md3-surface-high">
        <p className="font-bold mb-1 text-violet-900">💡 So funktionierts:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Öffne eine Spotify-Playlist im Browser</li>
          <li>Kopiere die URL und füge sie hier ein</li>
          <li>Die Playlist wird automatisch bei jedem App-Start aktualisiert</li>
          <li>Neue Alben in der Playlist erscheinen automatisch</li>
        </ol>
      </div>
    </div>
  )
}
