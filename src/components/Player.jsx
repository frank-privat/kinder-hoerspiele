import { useState, useRef, useEffect } from 'react'

export default function Player({ hoerspiel, onClose }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
        setCurrentTime(audio.currentTime)
      }
    }

    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
      audio.pause()
    }
  }, [hoerspiel])

  const togglePlay = () => {
    const audio = audioRef.current
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const seek = (e) => {
    const audio = audioRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    audio.currentTime = pct * audio.duration
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="player">
      <audio ref={audioRef} src={hoerspiel.audio} preload="metadata" />

      <div className="player-header">
        <span className="player-emoji">{hoerspiel.bild}</span>
        <div className="player-info">
          <h3>{hoerspiel.titel}</h3>
          <p>{hoerspiel.kategorie} · ab {hoerspiel.ab} Jahren</p>
        </div>
        <button className="player-close" onClick={onClose} aria-label="Schließen">✕</button>
      </div>

      <div className="player-controls">
        <button className="play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Abspielen'}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>

        <div className="progress-container" onClick={seek}>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <span className="time-display">
          {formatTime(currentTime)} / {duration ? formatTime(duration) : hoerspiel.dauer}
        </span>
      </div>
    </div>
  )
}
