import { useState, useEffect } from 'react'
import hoerspiele from './data/hoerspiele'
import HoerspielCard from './components/HoerspielCard'
import Filter from './components/Filter'
import Player from './components/Player'

const FAVORITEN_KEY = 'kinder-hoerspiele-favoriten'

function loadFavoriten() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITEN_KEY)) || []
  } catch {
    return []
  }
}

export default function App() {
  const [aktiveKategorie, setAktiveKategorie] = useState('Alle')
  const [nurFavoriten, setNurFavoriten] = useState(false)
  const [favoriten, setFavoriten] = useState(loadFavoriten)
  const [aktuellesHoerspiel, setAktuellesHoerspiel] = useState(null)
  const [suchbegriff, setSuchbegriff] = useState('')

  useEffect(() => {
    localStorage.setItem(FAVORITEN_KEY, JSON.stringify(favoriten))
  }, [favoriten])

  const kategorien = [...new Set(hoerspiele.map((h) => h.kategorie))]

  const toggleFavorit = (id) => {
    setFavoriten((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const gefilterteHoerspiele = hoerspiele.filter((h) => {
    const matchKategorie = aktiveKategorie === 'Alle' || h.kategorie === aktiveKategorie
    const matchFavorit = !nurFavoriten || favoriten.includes(h.id)
    const matchSuche =
      !suchbegriff ||
      h.titel.toLowerCase().includes(suchbegriff.toLowerCase()) ||
      h.beschreibung.toLowerCase().includes(suchbegriff.toLowerCase())
    return matchKategorie && matchFavorit && matchSuche
  })

  return (
    <div className="app">
      <header className="header">
        <h1>🎧 Kinder-Hörspiele</h1>
        <p className="subtitle">Tolle Geschichten zum Zuhören</p>
      </header>

      <div className="toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="🔍 Hörspiel suchen…"
          value={suchbegriff}
          onChange={(e) => setSuchbegriff(e.target.value)}
        />
        <button
          className={`btn btn-favoriten ${nurFavoriten ? 'aktiv' : ''}`}
          onClick={() => setNurFavoriten(!nurFavoriten)}
        >
          {nurFavoriten ? '❤️ Favoriten' : '🤍 Favoriten'}
        </button>
      </div>

      <Filter
        kategorien={kategorien}
        aktiveKategorie={aktiveKategorie}
        onKategorieChange={setAktiveKategorie}
      />

      <main className="grid">
        {gefilterteHoerspiele.length === 0 ? (
          <div className="empty-state">
            <span className="empty-emoji">🔇</span>
            <p>Keine Hörspiele gefunden.</p>
          </div>
        ) : (
          gefilterteHoerspiele.map((h) => (
            <HoerspielCard
              key={h.id}
              hoerspiel={h}
              onPlay={setAktuellesHoerspiel}
              isFavorit={favoriten.includes(h.id)}
              onToggleFavorit={toggleFavorit}
            />
          ))
        )}
      </main>

      {aktuellesHoerspiel && (
        <Player
          hoerspiel={aktuellesHoerspiel}
          onClose={() => setAktuellesHoerspiel(null)}
        />
      )}
    </div>
  )
}
