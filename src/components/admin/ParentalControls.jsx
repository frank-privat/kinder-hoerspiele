import { useState } from 'react'
import { useStore } from '../../contexts/store'

/**
 * ParentalControls
 * Set daily listening time limits, quiet hours, etc.
 */
export default function ParentalControls() {
  const parentalSettings = useStore((s) => s.parentalSettings)
  const updateParentalSettings = useStore((s) => s.updateParentalSettings)
  const resetDailyListeningTime = useStore((s) => s.resetDailyListeningTime)

  const [timerEnabled, setTimerEnabled] = useState(parentalSettings.timerEnabled ?? true)
  const [maxMinutes, setMaxMinutes] = useState(
    Math.floor(parentalSettings.maxListeningTimePerDayMs / 60000)
  )
  const [quietStart, setQuietStart] = useState(
    parentalSettings.quietHoursStart || '21:00'
  )
  const [quietEnd, setQuietEnd] = useState(
    parentalSettings.quietHoursEnd || '07:00'
  )

  const currentListeningMinutes = Math.floor(
    parentalSettings.currentListeningTimeMs / 60000
  )
  const remainingMinutes = Math.floor(
    (parentalSettings.maxListeningTimePerDayMs -
      parentalSettings.currentListeningTimeMs) /
    60000
  )

  const handleSave = () => {
    updateParentalSettings({
      timerEnabled,
      maxListeningTimePerDayMs: maxMinutes * 60000,
      quietHoursStart: quietStart,
      quietHoursEnd: quietEnd,
    })
    alert('✅ Einstellungen gespeichert!')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-violet-950">⏱️ Zeitlimits & Elternkontrolle</h2>

      {/* Timer Master Toggle */}
      <div className="md3-surface-high p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-base font-extrabold text-violet-950">
              🔔 Zeitlimit aktiv
            </span>
            <p className="text-sm text-violet-800 mt-1">
              {timerEnabled
                ? '✅ Dein Kind kann hören, bis das Zeitlimit erreicht ist.'
                : '⭕ Zeitlimit deaktiviert - unlimitiertes Hören'}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={timerEnabled}
            aria-label="Zeitlimit aktivieren oder deaktivieren"
            onClick={() => setTimerEnabled((v) => !v)}
            className={`md3-focus-ring relative inline-flex h-8 w-14 items-center rounded-full border transition-colors ${
              timerEnabled
                ? 'bg-violet-700 border-violet-700'
                : 'bg-violet-200 border-violet-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white border border-violet-300 shadow transition-transform ${
                timerEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Daily Listening Time */}
      <div className={`md3-surface-high p-5 transition-opacity ${!timerEnabled ? 'opacity-60' : ''}`}>
        <label className="block text-sm font-bold text-violet-900 mb-3">
          Max. Hördauer pro Tag (Minuten)
        </label>

        {/* Current Usage */}
        <div className="mb-4 p-4 bg-white rounded-xl border border-violet-200">
          <div className="flex justify-between text-sm text-violet-700 mb-2">
            <span>Heute gehört:</span>
            <span className="font-bold text-violet-800">
              {currentListeningMinutes} / {Math.floor(parentalSettings.maxListeningTimePerDayMs / 60000)} min
            </span>
          </div>
          <div className="w-full h-3 bg-violet-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-700 transition-all rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (currentListeningMinutes /
                    Math.floor(parentalSettings.maxListeningTimePerDayMs / 60000)) *
                    100
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-violet-700 mt-2">
            ⏰ Noch {remainingMinutes} Minuten verfügbar heute
          </p>
        </div>

        {/* Input */}
        <input
          type="number"
          min="5"
          max="480"
          value={maxMinutes}
          onChange={(e) => setMaxMinutes(parseInt(e.target.value) || 60)}
          disabled={!timerEnabled}
          className="w-full p-3 bg-white text-violet-950 rounded-xl border border-violet-300 focus:border-violet-700 outline-none mb-4 disabled:opacity-50 disabled:cursor-not-allowed md3-focus-ring"
        />

        <div className="grid grid-cols-3 gap-2 text-xs">
          {[30, 60, 120].map((min) => (
            <button
              key={min}
              onClick={() => setMaxMinutes(min)}
              disabled={!timerEnabled}
              className={`py-2.5 rounded-xl transition font-bold disabled:opacity-50 disabled:cursor-not-allowed md3-focus-ring ${
                maxMinutes === min
                  ? 'bg-violet-700 text-white'
                  : 'bg-white text-violet-800 hover:bg-violet-100 border border-violet-300'
              }`}
            >
              {min} min
            </button>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="md3-surface-high p-5">
        <label className="block text-sm font-bold text-violet-900 mb-1">
          🌙 Ruhige Stunden (Spielverbot)
        </label>
        <p className="text-xs text-violet-700 mb-3">In dieser Zeit kann dein Kind nicht hören</p>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="text-xs text-violet-700 block mb-1">Von</label>
            <input
              type="time"
              value={quietStart}
              onChange={(e) => setQuietStart(e.target.value)}
              className="w-full p-2 bg-white text-violet-950 rounded-xl border border-violet-300 focus:border-violet-700 outline-none md3-focus-ring"
            />
          </div>
          <div>
            <label className="text-xs text-violet-700 block mb-1">Bis</label>
            <input
              type="time"
              value={quietEnd}
              onChange={(e) => setQuietEnd(e.target.value)}
              className="w-full p-2 bg-white text-violet-950 rounded-xl border border-violet-300 focus:border-violet-700 outline-none md3-focus-ring"
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="md3-surface-high p-5">
        <label className="block text-sm font-bold text-violet-900 mb-1">
          🔄 Tageszeit zurücksetzen
        </label>
        <p className="text-xs text-violet-700 mb-3">
          Setzt die heutige Hördauer auf 0 zurück
        </p>
        <button
          onClick={() => {
            resetDailyListeningTime()
            alert('Hördauer zurückgesetzt!')
          }}
          className="w-full py-2.5 bg-white hover:bg-violet-100 text-violet-800 rounded-xl font-bold transition border border-violet-300 md3-focus-ring"
        >
          🔄 Zurücksetzen
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-4 md3-btn-filled md3-focus-ring font-extrabold text-lg transition"
      >
        💾 Einstellungen speichern
      </button>
    </div>
  )
}
