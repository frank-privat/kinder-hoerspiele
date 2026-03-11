export default function Filter({ kategorien, aktiveKategorie, onKategorieChange }) {
  return (
    <div className="filter-bar">
      <button
        className={`filter-btn ${aktiveKategorie === 'Alle' ? 'aktiv' : ''}`}
        onClick={() => onKategorieChange('Alle')}
      >
        Alle
      </button>
      {kategorien.map((kat) => (
        <button
          key={kat}
          className={`filter-btn ${aktiveKategorie === kat ? 'aktiv' : ''}`}
          onClick={() => onKategorieChange(kat)}
        >
          {kat}
        </button>
      ))}
    </div>
  )
}
