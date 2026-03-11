import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const PASTEL_GRADIENTS = [
  'from-rose-200 to-pink-100',
  'from-amber-200 to-yellow-100',
  'from-emerald-200 to-green-100',
  'from-sky-200 to-blue-100',
  'from-violet-200 to-purple-100',
  'from-orange-200 to-amber-100',
  'from-cyan-200 to-teal-100',
  'from-fuchsia-200 to-pink-100',
]

export default function StoryGrid({ stories, currentStoryId, onSelectStory, onAlbumPress, isDisabled }) {
  const scrollRef = useRef(null)
  const [centerIdx, setCenterIdx] = useState(0)

  const updateCenter = useCallback(() => {
    const el = scrollRef.current
    if (!el || !el.children.length) return
    const containerCenter = el.scrollLeft + el.offsetWidth / 2
    let closest = 0
    let closestDist = Infinity
    Array.from(el.children).forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const dist = Math.abs(cardCenter - containerCenter)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setCenterIdx(closest)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateCenter, { passive: true })
    updateCenter()
    return () => el.removeEventListener('scroll', updateCenter)
  }, [updateCenter, stories])

  // Scroll to playing card when currentStoryId changes
  useEffect(() => {
    if (!currentStoryId) return
    const idx = stories.findIndex((s) => s.id === currentStoryId)
    if (idx < 0) return
    const el = scrollRef.current
    if (!el) return
    const card = el.children[idx]
    if (!card) return
    el.scrollTo({
      left: card.offsetLeft - (el.offsetWidth - card.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }, [currentStoryId, stories])

  if (!stories?.length) return null

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto snap-x snap-mandatory pb-36 pt-2"
      style={{
        gap: '16px',
        paddingLeft: 'calc(50vw - min(140px, 35vw))',
        paddingRight: 'calc(50vw - min(140px, 35vw))',
        scrollPaddingInline: 'calc(50vw - min(140px, 35vw))',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {stories.map((story, idx) => {
        const isPlaying = currentStoryId === story.id
        const offset = idx - centerIdx
        const isCenter = offset === 0
        const scale = isCenter ? 1 : Math.max(0.8, 1 - Math.abs(offset) * 0.09)
        const opacity = isCenter ? 1 : Math.max(0.45, 1 - Math.abs(offset) * 0.22)
        const rotation = isCenter ? 0 : Math.max(-8, Math.min(8, offset * 3.5))
        const gradient = PASTEL_GRADIENTS[idx % PASTEL_GRADIENTS.length]
        const hasMultipleTracks = (story.tracks?.length || 0) > 1

        return (
          <motion.div
            key={story.id}
            className={`snap-center flex-none rounded-3xl overflow-hidden md3-surface select-none ${
              isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
            style={{
              width: 'min(310px, 76vw)',
              flexShrink: 0,
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              opacity,
              transition: 'transform 0.25s ease, opacity 0.25s ease',
              boxShadow: isPlaying
                ? '0 26px 70px rgba(255, 122, 89, 0.35)'
                : isCenter
                ? 'var(--elevation-3)'
                : 'var(--elevation-1)',
              outline: isPlaying ? '3px solid #ff7a59' : 'none',
              outlineOffset: '2px',
              borderRadius: '34px',
            }}
            whileTap={!isDisabled ? { scale: scale * 0.95 } : {}}
            onClick={() => {
              if (isDisabled) return
              if (hasMultipleTracks) {
                onAlbumPress?.(story)
              } else {
                onSelectStory(story.id)
              }
            }}
          >
            {/* Cover */}
            <div className="relative aspect-square overflow-hidden bg-[#fff7eb]">
              {story.coverUrl ? (
                <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                >
                  <span className="text-7xl">🎵</span>
                </div>
              )}

              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/18 to-transparent" />

              {/* Playing overlay */}
              {isPlaying && (
                <div className="absolute inset-0 bg-[#2c2340]/28 flex items-end justify-center pb-5">
                  <div className="flex items-end gap-[4px] h-10">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-[5px] bg-white rounded-full"
                        animate={{ height: ['25%', '100%', '55%', '90%', '25%'] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.9,
                          delay: i * 0.14,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tracks badge */}
              {hasMultipleTracks && !isPlaying && (
                <div className="absolute top-4 right-4 bg-white/92 text-[#a04b2c] text-xs px-3 py-1.5 rounded-full font-extrabold shadow-[0_12px_24px_rgba(44,35,64,0.12)]">
                  {story.tracks.length} Titel
                </div>
              )}

              {/* Tap hint for albums */}
              {hasMultipleTracks && isCenter && !isPlaying && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
                  <div className="bg-white/92 text-[#24b6a5] text-xs px-4 py-2 rounded-full font-extrabold shadow-[0_16px_28px_rgba(36,182,165,0.16)]">
                    Tippen für Titelliste
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="px-5 pt-4 pb-6 bg-gradient-to-b from-[#fffdf8] to-[#fff3e7]">
              <div className="section-kicker mb-3">{isCenter ? 'Im Fokus' : 'Hörspiel'}</div>
              <h2 className="title-display font-extrabold text-[#2c2340] text-xl leading-snug line-clamp-2">
                {story.title}
              </h2>
              <p className="text-[#6d6387] text-sm mt-1 truncate font-bold">{story.artist}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
