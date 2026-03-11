import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Coverflow component – expects Spotify story shape:
 * { id, title, artist, coverUrl, spotifyUri, tracks, ... }
 */
export function Coverflow({ stories, currentIndex, onIndexChange, onSelectStory }) {
  const handlePrevious = () => onIndexChange(Math.max(0, currentIndex - 1))
  const handleNext = () => onIndexChange(Math.min(stories.length - 1, currentIndex + 1))

  const getItemStyle = (index) => {
    const diff = index - currentIndex
    const absDiff = Math.abs(diff)

    if (absDiff > 2) {
      return { opacity: 0, scale: 0.5, x: diff > 0 ? 300 : -300, z: -200, rotateY: diff > 0 ? 45 : -45 }
    }

    return {
      opacity: 1 - absDiff * 0.4,
      scale: 1 - absDiff * 0.2,
      x: diff * 180,
      z: -absDiff * 100,
      rotateY: diff * 25,
    }
  }

  if (!stories.length) return null

  return (
    <div className="relative w-full h-[420px] md:h-[520px] flex items-center justify-center overflow-hidden">
      {/* Nav buttons */}
      <button
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        className="absolute left-4 z-30 w-12 h-12 flex items-center justify-center bg-card rounded-full shadow-[var(--shadow-lg)] hover:bg-mint transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        onClick={handleNext}
        disabled={currentIndex === stories.length - 1}
        className="absolute right-4 z-30 w-12 h-12 flex items-center justify-center bg-card rounded-full shadow-[var(--shadow-lg)] hover:bg-mint transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* 3D stage */}
      <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
        {stories.map((story, index) => {
          const style = getItemStyle(index)
          const isActive = index === currentIndex

          return (
            <motion.div
              key={story.id}
              className="absolute cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ opacity: style.opacity, scale: style.scale, x: style.x, z: style.z, rotateY: style.rotateY }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => isActive ? onSelectStory?.(story) : onIndexChange(index)}
            >
              <div
                className={`relative w-56 h-56 md:w-72 md:h-72 rounded-[var(--radius-2xl)] overflow-hidden shadow-[var(--shadow-lg)] ${
                  isActive ? 'ring-4 ring-mint' : ''
                }`}
              >
                {story.coverUrl ? (
                  <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-mint to-lavender flex items-center justify-center text-6xl">
                    🎧
                  </div>
                )}

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5"
                  >
                    <div className="text-white">
                      <p className="font-bold text-base truncate">{story.title}</p>
                      <p className="text-sm opacity-80 truncate">{story.artist}</p>
                      {story.trackCount > 0 && (
                        <p className="text-xs opacity-70 mt-1">{story.trackCount} Titel</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Title below (mobile only, when there's no overlay space) */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="absolute bottom-2 left-0 right-0 text-center px-4"
      >
        {stories[currentIndex] && (
          <>
            <p className="font-bold text-base hidden md:block">{stories[currentIndex].title}</p>
            <p className="text-sm text-muted-foreground hidden md:block">{stories[currentIndex].artist}</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
