import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { SkipBack, SkipForward, RotateCcw, Volume2, X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { useStore } from '../contexts/store'
import spotifyService from '../services/spotify'

export default function SpotifyPlayer({ storyId }) {
	const stories = useStore((s) => s.stories)
	const story = useStore((s) => s.stories.find((st) => st.id === storyId))
	const currentTrackUri = useStore((s) => s.currentTrackUri)
	const getPlaybackState = useStore((s) => s.getPlaybackState)
	const setPlaybackState = useStore((s) => s.setPlaybackState)
	const incrementListeningTime = useStore((s) => s.incrementListeningTime)
	const setCurrentStory = useStore((s) => s.setCurrentStory)

	const [isPlaying, setIsPlaying] = useState(false)
	const [positionMs, setPositionMs] = useState(0)
	const [durationMs, setDurationMs] = useState(0)
	const [playerReady, setPlayerReady] = useState(false)
	const [error, setError] = useState(null)
	const [loading, setLoading] = useState(true)
	const [volume, setVolume] = useState(0.8)
	const [showVolume, setShowVolume] = useState(false)
	const [isSeeking, setIsSeeking] = useState(false)

	const lastPlayKeyRef = useRef(null)
	const prevStateRef = useRef(null)
	const positionRef = useRef(0)
	const durationRef = useRef(0)
	const autoAdvanceRef = useRef(null)

	const currentStoryIdx = stories.findIndex((s) => s.id === storyId)
	const hasPrev = currentStoryIdx > 0
	const hasNext = currentStoryIdx >= 0 && currentStoryIdx < stories.length - 1
	const currentTrackInfo = currentTrackUri
		? story?.tracks?.find((t) => t.uri === currentTrackUri)
		: null

	const handleStateChange = useCallback((state) => {
		if (!state) { setIsPlaying(false); return }
		const prev = prevStateRef.current
		// Detect natural end: was playing, now paused at 0, was near end
		if (
			prev && !prev.paused && state.paused && state.position === 0 &&
			durationRef.current > 5000 && positionRef.current >= durationRef.current - 5000
		) {
			autoAdvanceRef.current?.()
		}
		prevStateRef.current = state
		setIsPlaying(!state.paused)
		setPositionMs(state.position)
		setDurationMs(state.duration)
		positionRef.current = state.position
		durationRef.current = state.duration
	}, [])

	useEffect(() => {
		autoAdvanceRef.current = () => {
			if (currentStoryIdx >= 0 && currentStoryIdx < stories.length - 1) {
				setCurrentStory(stories[currentStoryIdx + 1].id)
			}
		}
	})

	// Init player
	useEffect(() => {
		let cancelled = false
		const init = async () => {
			try {
				setLoading(true); setError(null)
				await spotifyService.initPlayer(handleStateChange)
				if (!cancelled) { setPlayerReady(true); setLoading(false) }
			} catch (err) {
				if (!cancelled) { setError(err.message); setLoading(false) }
			}
		}
		init()
		return () => { cancelled = true }
	}, [handleStateChange])

	// Start playback when story/track changes
	useEffect(() => {
		if (!playerReady || !story) return
		const uri = currentTrackUri || story.spotifyUri
		if (!uri) return
		const playKey = `${storyId}::${currentTrackUri || ''}`
		if (lastPlayKeyRef.current === playKey) return
		lastPlayKeyRef.current = playKey
		const startPlay = async () => {
			try {
				setLoading(true)
				const saved = getPlaybackState(storyId)
				const startPos = currentTrackUri ? 0 : (saved.positionMs || 0)
				await spotifyService.play(uri, startPos)
				setLoading(false)
			} catch (err) {
				setError(`Wiedergabe fehlgeschlagen: ${err.message}`)
				setLoading(false)
			}
		}
		startPlay()
	}, [playerReady, storyId, story, currentTrackUri, getPlaybackState])

	// Poll position while playing
	useEffect(() => {
		if (!isPlaying || !playerReady) return
		const interval = setInterval(async () => {
			const state = await spotifyService.getPlayerState()
			if (state) {
				setPositionMs(state.position)
				setDurationMs(state.duration)
				positionRef.current = state.position
				durationRef.current = state.duration
			}
		}, 1000)
		return () => clearInterval(interval)
	}, [isPlaying, playerReady])

	// Save + listening time every 10s
	useEffect(() => {
		if (!isPlaying || !storyId) return
		const interval = setInterval(() => {
			setPlaybackState(storyId, { positionMs: positionRef.current, isPlaying: true, lastPlayed: new Date().toISOString() })
			incrementListeningTime(10000)
		}, 10000)
		return () => clearInterval(interval)
	}, [isPlaying, storyId, setPlaybackState, incrementListeningTime])

	// Save on unmount
	useEffect(() => {
		return () => {
			if (storyId && positionRef.current > 0) {
				setPlaybackState(storyId, { positionMs: positionRef.current, isPlaying: false, lastPlayed: new Date().toISOString() })
			}
		}
	}, [storyId, setPlaybackState])

	const togglePlay = async () => { isPlaying ? await spotifyService.pause() : await spotifyService.resume() }
	const skipBack = async () => { const p = Math.max(0, positionMs - 15000); setPositionMs(p); positionRef.current = p; await spotifyService.seek(p) }
	const skipForward = async () => { const p = Math.min(durationMs, positionMs + 15000); setPositionMs(p); positionRef.current = p; await spotifyService.seek(p) }
	const goPrev = () => { if (hasPrev) setCurrentStory(stories[currentStoryIdx - 1].id) }
	const goNext = () => { if (hasNext) setCurrentStory(stories[currentStoryIdx + 1].id) }

	const seekByClientX = async (clientX, target) => {
		if (!target || !clientX || !durationMs) return
		const rect = target.getBoundingClientRect()
		const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
		const newPos = Math.floor(pct * durationMs)
		setPositionMs(newPos)
		positionRef.current = newPos
		await spotifyService.seek(newPos)
	}

	const handleSeekStart = async (e) => {
		setIsSeeking(true)
		await seekByClientX(e.clientX, e.currentTarget)
	}

	const handleSeekMove = async (e) => {
		if (!isSeeking || !(e.buttons & 1)) return
		e.preventDefault()
		await seekByClientX(e.clientX, e.currentTarget)
	}

	const handleSeekEnd = () => {
		if (!isSeeking) return
		setIsSeeking(false)
	}

	const handleVolumeChange = async (e) => {
		const val = parseFloat(e.target.value)
		setVolume(val)
		await spotifyService.setVolume(val)
	}

	const handleClose = async () => {
		await spotifyService.pause()
		if (storyId) setPlaybackState(storyId, { positionMs: positionRef.current, isPlaying: false, lastPlayed: new Date().toISOString() })
		lastPlayKeyRef.current = null
		setCurrentStory(null)
	}

	const handleRestart = () => {
		lastPlayKeyRef.current = null
		spotifyService.play(story.spotifyUri, 0)
		setPositionMs(0); positionRef.current = 0
	}

	const fmt = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }

	if (!story) return null
	const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0

	return (
		<motion.div
			initial={{ y: 120, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			exit={{ y: 120, opacity: 0 }}
			className="fixed bottom-0 left-0 right-0 md3-surface border-t border-[#f1d8c5] rounded-t-[34px] px-6 pt-4 pb-8 z-50"
		>
			<div className="max-w-lg mx-auto">
				{/* Drag handle */}
				<div className="flex justify-center mb-4">
					<div className="w-12 h-1.5 bg-[#ffb38d] rounded-full" />
				</div>

				{error && (
					<div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs mb-4">⚠️ {error}</div>
				)}

				{/* Info row */}
				<div className="flex items-center gap-4 mb-6">
					<div className="w-14 h-14 rounded-[22px] overflow-hidden flex-shrink-0 shadow-[0_18px_30px_rgba(44,35,64,0.12)]">
						{story.coverUrl
							? <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
							: <div className="w-full h-full bg-gradient-to-br from-[#ffd35c] to-[#ff8f70] flex items-center justify-center text-lg">🎵</div>
						}
					</div>
					<div className="flex-1 min-w-0">
						<p className="title-display font-extrabold text-[#2c2340] text-base truncate">{currentTrackInfo?.title || story.title}</p>
						<p className="text-[#6d6387] text-xs truncate font-bold">{currentTrackInfo ? story.title : (story.artist || 'Spotify')}</p>
						{loading && <p className="text-xs text-[#b6412e] font-bold">⏳ Lädt…</p>}
					</div>
					<button onClick={handleClose} className="p-2.5 rounded-full bg-[#ffe8df] hover:bg-[#ffdacf] transition shrink-0 md3-focus-ring">
						<X size={18} className="text-[#b6412e]" />
					</button>
				</div>

				{/* Progress bar – larger hit area */}
				<div className="mb-6">
					{/* Clickable container with larger hit area */}
					<div
						className={`w-full py-3 cursor-pointer -mx-6 px-6 select-none ${isSeeking ? 'cursor-grabbing' : 'cursor-pointer'}`}
						onMouseDown={handleSeekStart}
						onMouseMove={handleSeekMove}
						onMouseUp={handleSeekEnd}
						onMouseLeave={handleSeekEnd}
						role="slider"
						aria-label="Abspielprogress"
						aria-valuemin="0"
						aria-valuemax={durationMs}
						aria-valuenow={positionMs}
					>
						{/* Visual progress bar */}
						<div className="w-full h-4 bg-[#ffe6c8] rounded-full overflow-hidden pointer-events-none border border-[#f5cf99]">
							<div
								className="h-full rounded-full transition-all duration-100"
								style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #24b6a5 0%, #ff7a59 100%)' }}
							/>
						</div>
					</div>
					<div className="flex justify-between text-xs text-[#6d6387] mt-2 tabular-nums font-mono">
						<span>{fmt(positionMs)}</span>
						<span>{fmt(durationMs)}</span>
					</div>
				</div>

				{/* Main controls */}
				<div className="flex items-center justify-center gap-4 mb-6">
					<motion.button whileTap={{ scale: 0.85 }} onClick={goPrev} disabled={!hasPrev}
						className="p-3 rounded-full bg-[#fff0e6] hover:bg-[#ffe1d2] disabled:opacity-40 transition md3-focus-ring" title="Vorheriges">
						<ChevronLeft size={24} className="text-[#a04b2c]" />
					</motion.button>

					<motion.button whileTap={{ scale: 0.85 }} onClick={skipBack} disabled={loading}
						className="p-3 rounded-full bg-[#fff0ba] hover:bg-[#ffe78f] disabled:opacity-40 transition md3-focus-ring" title="-15s">
						<SkipBack size={24} className="text-[#9c6c00]" />
					</motion.button>

					<motion.button 
						whileTap={{ scale: 0.9 }} 
						onClick={togglePlay} 
						disabled={loading || !!error}
						className="w-18 h-18 md3-btn-filled disabled:opacity-50 rounded-full flex items-center justify-center transition md3-focus-ring"
						title={isPlaying ? 'Pause' : 'Abspielen'}
					>
						{isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
					</motion.button>

					<motion.button whileTap={{ scale: 0.85 }} onClick={skipForward} disabled={loading}
						className="p-3 rounded-full bg-[#dff8f4] hover:bg-[#c7f1ea] disabled:opacity-40 transition md3-focus-ring" title="+15s">
						<SkipForward size={24} className="text-[#0c6057]" />
					</motion.button>

					<motion.button whileTap={{ scale: 0.85 }} onClick={goNext} disabled={!hasNext}
						className="p-3 rounded-full bg-[#fff0e6] hover:bg-[#ffe1d2] disabled:opacity-40 transition md3-focus-ring" title="Nächstes">
						<ChevronRight size={24} className="text-[#a04b2c]" />
					</motion.button>
				</div>

				{/* Volume + restart row */}
				<div className="flex items-center justify-center gap-4">
					<button onClick={handleRestart} className="p-2 rounded-full hover:bg-[#fff0e6] transition md3-focus-ring" title="Neustarten">
						<RotateCcw size={20} className="text-[#a04b2c]" />
					</button>
					<button onClick={() => setShowVolume((v) => !v)} className="p-2 rounded-full hover:bg-[#fff0e6] transition md3-focus-ring">
						<Volume2 size={20} className="text-[#a04b2c]" />
					</button>
					{showVolume && (
						<motion.input initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 120 }}
							type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange}
							className="accent-[#ff7a59] cursor-pointer h-2" />
					)}
				</div>
			</div>
		</motion.div>
	)
}
