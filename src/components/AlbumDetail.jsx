import { motion } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * AlbumDetail — bottom sheet showing individual tracks inside an album
 */
export default function AlbumDetail({ album, currentTrackUri, onPlayTrack, onPlayAlbum, onClose }) {
  const tracks = album.tracks || []

  const formatDuration = (ms) => {
    if (!ms) return ''
    const mins = Math.floor(ms / 60000)
    const secs = String(Math.floor((ms / 1000) % 60)).padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 md3-surface rounded-t-3xl z-50 flex flex-col"
        style={{ maxHeight: '88vh' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
      >
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-0 shrink-0">
          <div className="w-10 h-1.5 bg-violet-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-violet-200 shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-200 to-pink-200 flex items-center justify-center text-3xl">
                🎵
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-violet-950 text-base leading-tight line-clamp-2">
              {album.title}
            </h2>
            <p className="text-violet-700 text-sm mt-0.5 truncate">{album.artist}</p>
            {tracks.length > 0 && (
              <p className="text-violet-800 text-xs mt-0.5 font-bold">{tracks.length} Titel</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-violet-100 hover:bg-violet-200 transition shrink-0 md3-focus-ring"
          >
            <X size={18} className="text-violet-700" />
          </button>
        </div>

        {/* Track list */}
        <div className="overflow-y-auto flex-1 py-1">
          {tracks.length === 0 ? (
            <div className="px-5 py-6 text-center text-violet-700">
              Keine Einzeltitel verfügbar
            </div>
          ) : (
            tracks.map((track, idx) => {
              const isActive = currentTrackUri === track.uri
              return (
                <motion.button
                  key={track.id || idx}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPlayTrack(track, album)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-violet-100 transition text-left md3-focus-ring ${
                    isActive ? 'bg-violet-200' : ''
                  }`}
                >
                  <span
                    className={`w-7 text-right text-sm font-extrabold shrink-0 ${
                      isActive ? 'text-violet-900' : 'text-violet-500'
                    }`}
                  >
                    {isActive ? '▶' : idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold text-sm leading-snug truncate ${
                        isActive ? 'text-violet-950' : 'text-violet-900'
                      }`}
                    >
                      {track.title}
                    </p>
                    {track.artists && (
                      <p className="text-xs text-violet-700 truncate">{track.artists}</p>
                    )}
                  </div>
                  <span className="text-xs text-violet-700 shrink-0 tabular-nums">
                    {formatDuration(track.durationMs)}
                  </span>
                </motion.button>
              )
            })
          )}
        </div>

        {/* Play from beginning */}
        <div className="p-4 border-t border-violet-200 shrink-0">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onPlayAlbum(album)}
            className="w-full py-3.5 md3-btn-filled md3-focus-ring rounded-2xl font-extrabold text-base transition"
          >
            ▶ Vom Anfang spielen
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}
