import { useDeferredValue, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ListMusic, Play, Search } from 'lucide-react'

function formatDuration(ms) {
  if (!ms) return ''
  const mins = Math.floor(ms / 60000)
  const secs = String(Math.floor((ms / 1000) % 60)).padStart(2, '0')
  return `${mins}:${secs}`
}

export default function PlaylistView({
  stories,
  currentStoryId,
  currentTrackUri,
  onSelectStory,
  onPlayTrack,
  onOpenAlbum,
  isDisabled,
}) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const filteredStories = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase()
    if (!search) {
      return stories.map((story) => ({ story, tracks: story.tracks || [] }))
    }

    return stories
      .map((story) => {
        const albumMatches = [story.title, story.artist].some((value) =>
          value?.toLowerCase().includes(search)
        )

        const tracks = albumMatches
          ? story.tracks || []
          : (story.tracks || []).filter((track) =>
              [track.title, track.artists].some((value) => value?.toLowerCase().includes(search))
            )

        return tracks.length > 0 || albumMatches ? { story, tracks } : null
      })
      .filter(Boolean)
  }, [deferredQuery, stories])

  return (
    <div className="px-1 pb-36 space-y-4">
      <div className="hero-card-soft p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#dff8f4] text-[#0c6057] flex items-center justify-center shadow-[0_12px_24px_rgba(36,182,165,0.14)]">
            <ListMusic size={20} />
          </div>
          <div>
            <p className="title-display text-lg font-extrabold text-[#2c2340]">Alle Geschichten</p>
            <p className="text-sm text-[#6d6387] font-bold">Suche nach Album oder Titel</p>
          </div>
        </div>

        <label className="relative block">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ff7a59]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Album oder Titel suchen"
            className="w-full rounded-[24px] border border-[#f1d8c5] bg-white/92 pl-11 pr-4 py-3.5 text-sm text-[#2c2340] outline-none md3-focus-ring"
          />
        </label>
      </div>

      {filteredStories.length === 0 ? (
        <div className="hero-card-soft p-8 text-center text-[#6d6387] font-bold">
          Keine Treffer in der Playlist gefunden.
        </div>
      ) : (
        filteredStories.map(({ story, tracks }) => {
          const isAlbumPlaying = currentStoryId === story.id
          const visibleTracks = tracks.slice().sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0))

          return (
            <motion.section
              key={story.id}
              layout
              className="md3-surface overflow-hidden"
              style={{ borderRadius: '32px' }}
            >
              <div className="p-5 flex items-center gap-4 bg-gradient-to-br from-[#fffdf8] to-[#fff2e6]">
                <button
                  onClick={() => onOpenAlbum?.(story)}
                  disabled={isDisabled}
                  className="w-22 h-22 rounded-[28px] overflow-hidden shadow-[0_16px_34px_rgba(44,35,64,0.12)] shrink-0 disabled:opacity-50 md3-focus-ring"
                >
                  {story.coverUrl ? (
                    <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-200 to-pink-200 flex items-center justify-center text-3xl">
                      🎵
                    </div>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onOpenAlbum?.(story)}
                    disabled={isDisabled}
                    className="text-left disabled:opacity-50 md3-focus-ring rounded-xl"
                  >
                    <h2 className="title-display text-xl font-extrabold text-[#2c2340] line-clamp-2">{story.title}</h2>
                    <p className="text-sm text-[#6d6387] truncate mt-1 font-bold">{story.artist}</p>
                  </button>
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold">
                    <span className="px-3 py-1.5 rounded-full bg-[#fff0ba] text-[#9c6c00]">
                      {story.tracks?.length || 0} Titel
                    </span>
                    {query && visibleTracks.length !== (story.tracks?.length || 0) && (
                      <span className="px-3 py-1.5 rounded-full bg-[#dff8f4] text-[#0c6057]">
                        {visibleTracks.length} Treffer
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onSelectStory(story.id)}
                  disabled={isDisabled}
                  className={`shrink-0 px-3 py-2 rounded-2xl text-sm font-extrabold transition md3-focus-ring ${
                    isAlbumPlaying
                      ? 'bg-[#2c2340] text-white'
                      : 'bg-[#ffe4dd] text-[#b6412e] hover:bg-[#ffd2c7]'
                  } disabled:opacity-50`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Play size={15} fill="currentColor" />
                    Album
                  </span>
                </button>
              </div>

              <div className="border-t border-[#f1d8c5] bg-white/72">
                {visibleTracks.map((track, index) => {
                  const isTrackActive = currentTrackUri === track.uri
                  return (
                    <button
                      key={track.id || `${story.id}-${index}`}
                      onClick={() => onPlayTrack(track, story)}
                      disabled={isDisabled}
                      className={`w-full px-4 py-3.5 flex items-center gap-3 text-left transition disabled:opacity-50 md3-focus-ring ${
                        isTrackActive ? 'bg-[#fff0ba]' : 'hover:bg-[#fff8f0]'
                      }`}
                    >
                      <span className={`w-7 text-sm font-extrabold text-right ${isTrackActive ? 'text-[#b6412e]' : 'text-[#c28e76]'}`}>
                        {isTrackActive ? '▶' : track.trackNumber || index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isTrackActive ? 'text-[#2c2340]' : 'text-[#3b3057]'}`}>
                          {track.title}
                        </p>
                        {track.artists && (
                          <p className="text-xs text-[#6d6387] truncate">{track.artists}</p>
                        )}
                      </div>
                      <span className="text-xs text-[#6d6387] tabular-nums font-bold">{formatDuration(track.durationMs)}</span>
                    </button>
                  )
                })}
              </div>
            </motion.section>
          )
        })
      )}
    </div>
  )
}