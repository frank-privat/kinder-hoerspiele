import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { useStore } from '../../contexts/store'
import { AppHeader } from '../components/AppHeader'
import { Coverflow } from '../components/Coverflow'
import { ViewToggle } from '../components/ViewToggle'
import SpotifyPlayer from '../../components/SpotifyPlayer'
import AlbumDetail from '../../components/AlbumDetail'
import PlaylistView from '../../components/PlaylistView'

export function PlayerScreen() {
  const stories = useStore((s) => s.stories)
  const currentStoryId = useStore((s) => s.currentStoryId)
  const setCurrentStory = useStore((s) => s.setCurrentStory)
  const currentTrackUri = useStore((s) => s.currentTrackUri)
  const setCurrentTrack = useStore((s) => s.setCurrentTrack)
  const hasExceededListeningTime = useStore((s) => s.hasExceededListeningTime)
  const getListeningTimeRemaining = useStore((s) => s.getListeningTimeRemaining)
  const parentalSettings = useStore((s) => s.parentalSettings)

  const [view, setView] = useState('coverflow')
  const [selectedAlbum, setSelectedAlbum] = useState(null)

  const isOver = hasExceededListeningTime()
  const timeRemainingMs = getListeningTimeRemaining()
  const timeRemainingMin = Math.ceil(timeRemainingMs / 60000)

  const currentIndex = Math.max(0, stories.findIndex((s) => s.id === currentStoryId))

  const handleIndexChange = (index) => {
    if (stories[index]) setCurrentStory(stories[index].id)
  }

  const handleSelectStory = (story) => {
    setCurrentStory(story.id)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-mint-light/30 via-background to-lavender-light/30">
      <AppHeader />

      {/* Time limit warning */}
      {isOver && parentalSettings.timerEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-peach text-accent-foreground px-4 py-3 text-center font-bold text-sm"
        >
          ⏱️ Deine Hörzeit für heute ist aufgebraucht! Morgen geht's weiter. 🌙
        </motion.div>
      )}

      <main className="flex-1 flex flex-col pb-36">
        {/* ViewToggle */}
        <div className="flex items-center justify-between px-[var(--spacing-2)] py-[var(--spacing-3)]">
          <ViewToggle view={view} onViewChange={setView} />
          <div className="flex items-center gap-3">
            {stories.length > 0 && (
              <span className="text-[var(--text-sm)] text-muted-foreground">
                {stories.length} Hörspiele
              </span>
            )}
            {!isOver && parentalSettings.timerEnabled && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-mint/20 rounded-full">
                <Clock className="size-3.5 text-mint-dark" />
                <span className="text-[var(--text-xs)] text-mint-dark font-bold">
                  {timeRemainingMin} Min
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {stories.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-20 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 2.5, duration: 0.5 }}
              className="text-7xl"
            >
              🎧
            </motion.div>
            <h3 className="text-foreground">Noch keine Hörspiele</h3>
            <p className="text-muted-foreground text-[var(--text-sm)]">
              Papa oder Mama können im Eltern-Bereich Playlisten hinzufügen.
            </p>
          </div>
        ) : view === 'coverflow' ? (
          <Coverflow
            stories={stories}
            currentIndex={currentIndex}
            onIndexChange={handleIndexChange}
            onSelectStory={isOver ? undefined : handleSelectStory}
          />
        ) : (
          <div className="flex-1 overflow-y-auto px-[var(--spacing-2)]">
            <PlaylistView
              stories={stories}
              currentStoryId={currentStoryId}
              currentTrackUri={currentTrackUri}
              onSelectStory={isOver ? undefined : setCurrentStory}
              onPlayTrack={(track, album) => {
                if (!isOver) setCurrentTrack(album.id, track.uri)
              }}
              onOpenAlbum={setSelectedAlbum}
              isDisabled={isOver}
            />
          </div>
        )}
      </main>

      {/* Spotify Player (floating bottom bar) */}
      <AnimatePresence>
        {currentStoryId && !isOver && (
          <SpotifyPlayer storyId={currentStoryId} />
        )}
      </AnimatePresence>

      {/* Album Detail sheet */}
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
