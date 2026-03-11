export default function HoerspielCard({ hoerspiel, onPlay, isFavorit, onToggleFavorit }) {
  return (
    <div className="card">
      <div className="card-emoji">{hoerspiel.bild}</div>
      <div className="card-body">
        <h3 className="card-titel">{hoerspiel.titel}</h3>
        <p className="card-beschreibung">{hoerspiel.beschreibung}</p>
        <div className="card-meta">
          <span className="badge">{hoerspiel.kategorie}</span>
          <span className="badge">ab {hoerspiel.ab} J.</span>
          <span className="badge">⏱ {hoerspiel.dauer}</span>
        </div>
        <div className="card-actions">
          <button className="btn btn-play" onClick={() => onPlay(hoerspiel)}>
            ▶️ Anhören
          </button>
          <button
            className={`btn btn-fav ${isFavorit ? 'aktiv' : ''}`}
            onClick={() => onToggleFavorit(hoerspiel.id)}
            aria-label={isFavorit ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
          >
            {isFavorit ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  )
}
