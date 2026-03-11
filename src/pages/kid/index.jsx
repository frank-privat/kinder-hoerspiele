import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ListMusic, PanelsTopLeft } from 'lucide-react'
import { useStore } from '../../contexts/store'
import StoryGrid from '../../components/StoryGrid'
import SpotifyPlayer from '../../components/SpotifyPlayer'
import AlbumDetail from '../../components/AlbumDetail'
import PlaylistView from '../../components/PlaylistView'

const GREETINGS = [
  'Was hörst du heute? 🎧',
  'Welches Abenteuer wartet? 🚀',
  'Zeit zum Zuhören! 🌟',
  'Welche Geschichte magst du? 📚',
  'Hallo! 👋 Viel Spaß beim Hören!',
]

export default function KidInterface() {
  const stories = useStore((s) => s.stories)
  const currentStoryId = useStore((s) => s.currentStoryId)
  const setCurrentStory = useStore((s) => s.setCurrentStory)
  const currentTrackUri = useStore((s) => s.currentTrackUri)
  const setCurrentTrack = useStore((s) => s.setCurrentTrack)
  const hasExceededListeningTime = useStore((s) => s.hasExceededListeningTime)
  const getListeningTimeRemaining = useStore((s) => s.getListeningTimeRemaining)
  const parentalSettings = useStore((s) => s.parentalSettings)

  const [isOver, setIsOver] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [viewMode, setViewMode] = useState('coverflow')
  const greeting = GREETINGS[new Date().getHours() % GREETINGS.length]
  const totalTracks = stories.reduce((sum, story) => sum + (story.tracks?.length || 0), 0)

  useEffect(() => {
    setIsOver(hasExceededListeningTime())
  }, [hasExceededListeningTime])

  const timeRemainingMs = getListeningTimeRemaining()
  const timeRemainingMin = Math.ceil(timeRemainingMs / 60000)

  return (
    <div className="w-full min-h-screen px-4 py-5 sm:px-6 sm:py-6">

      {/* Time Limit Warning */}
      {isOver && parentalSettings.timerEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-100 border-b-2 border-rose-300 text-rose-700 p-4 text-center font-bold text-sm"
        >
          ⏱️ Deine Hörzeit für heute ist aufgebraucht! Morgen geht’s weiter. 🌙
        </motion.div>
      )}

      {/* Header */}
      <header className="pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-card px-6 py-6 sm:px-8 sm:py-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="section-kicker mb-4">Heute entdecken</div>
              <h1 className="title-display text-4xl sm:text-5xl leading-[0.95] text-[#2c2340] mb-3">
                {greeting}
              </h1>
              <p className="text-[#6d6387] text-base sm:text-lg font-bold">
                Große Cover, warme Farben und eine Oberfläche, die sich mehr wie eine Kinder-App als wie ein Admin-Tool anfühlt.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:max-w-md lg:justify-end">
              <div className="sun-chip">
                <span className="text-lg">📚</span>
                <span>{stories.length} Abenteuer</span>
              </div>
              <div className="sun-chip">
                <span className="text-lg">🎵</span>
                <span>{totalTracks} Titel</span>
              </div>
              {!isOver && parentalSettings.timerEnabled && (
                <div className="sun-chip">
                  <Clock size={16} className="text-[#ff7a59]" />
                  <span>Noch {timeRemainingMin} Min</span>
                </div>
              )}
            </div>
          </div>

          {stories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 inline-flex flex-wrap gap-2 rounded-full bg-white/70 p-2"
            >
              <button
                onClick={() => setViewMode('coverflow')}
                className={`px-5 py-3 rounded-full text-sm font-extrabold transition flex items-center gap-2 md3-focus-ring ${
                  viewMode === 'coverflow'
                    ? 'bg-[#2c2340] text-white shadow-[0_12px_24px_rgba(44,35,64,0.18)]'
                    : 'text-[#6d6387] hover:bg-white'
                }`}
              >
                <PanelsTopLeft size={16} />
                Entdecken
              </button>
              <button
                onClick={() => setViewMode('playlist')}
                className={`px-5 py-3 rounded-full text-sm font-extrabold transition flex items-center gap-2 md3-focus-ring ${
                  viewMode === 'playlist'
                    ? 'bg-[#2c2340] text-white shadow-[0_12px_24px_rgba(44,35,64,0.18)]'
                    : 'text-[#6d6387] hover:bg-white'
                }`}
              >
                <ListMusic size={16} />
                Alle Titel
              </button>
            </motion.div>
          )}
        </motion.div>
      </header>

      {/* Stories or empty state */}
      {stories.length === 0 ? (
        <div className="hero-card-soft flex flex-col items-center justify-center py-24 px-6 gap-4 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 2.5, duration: 0.5 }}
            className="text-7xl"
          >
            🎧
          </motion.div>
          <p className="title-display text-[#2c2340] text-2xl font-extrabold">Noch keine Hörspiele da.</p>
          <p className="text-[#6d6387] text-sm font-bold">Papa oder Mama können Inhalte hinzufügen.</p>
        </div>
      ) : (
        viewMode === 'coverflow' ? (
          <StoryGrid
            stories={stories}
            currentStoryId={currentStoryId}
            onSelectStory={setCurrentStory}
            onAlbumPress={setSelectedAlbum}
            isDisabled={isOver}
          />
        ) : (
          <PlaylistView
            stories={stories}
            currentStoryId={currentStoryId}
            currentTrackUri={currentTrackUri}
            onSelectStory={setCurrentStory}
            onPlayTrack={(track, album) => {
              setCurrentTrack(album.id, track.uri)
            }}
            onOpenAlbum={setSelectedAlbum}
            isDisabled={isOver}
          />
        )
      )}

      {currentStoryId && !isOver && (
        <SpotifyPlayer storyId={currentStoryId} />
      )}

      <AnimatePresence>
        {selectedAlbum && (
          <AlbumDetail
            album={selectedAlbum}
            currentTrackUri={currentTrackUri}
            onPlayTrack={(track, album) => {
              setCurrentTrack(album.id, track.uri)
              setSelectedAlbum(null)
            }}
            onPlayAlbum={(album) => {
              setCurrentStory(album.id)
              setSelectedAlbum(null)
            }}
            onClose={() => setSelectedAlbum(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
