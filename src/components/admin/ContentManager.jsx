import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../contexts/store'

export default function ContentManager() {
  const stories = useStore((s) => s.stories)
  const removeStory = useStore((s) => s.removeStory)

  if (stories.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📚</div>
        <p className="text-gray-500">Keine Inhalte geladen. Lade zuerst eine Playlist!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-violet-900 mb-4">
        📚 Inhalte ({stories.length})
      </h2>

      <div className="space-y-2">
        {stories.map((story) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-3 bg-violet-50 rounded-2xl hover:bg-violet-100 transition"
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-violet-300 to-pink-300 flex items-center justify-center text-lg">
              {story.coverUrl ? (
                <img src={story.coverUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                '🎵'
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-800 font-bold truncate text-sm">{story.title}</h3>
              <p className="text-gray-500 text-xs">{story.artist || 'Spotify'}</p>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeStory(story.id)}
              className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl text-sm font-bold transition"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
