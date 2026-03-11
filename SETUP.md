Lass uns gemeinsam weitermachen. Ich möchte einmal mit dir die UI besprechen. Auf der anderen Seite möchte ich auch nochmal mit dir einen Plan machen, wie wir weiter mit den Playlisten machen wollen. Dazu kommt, ich hätte gerne auf der Kachelseite von dem Kind, dass man immer nur das Cover von einem Album sieht. Also das heißt, zeig nicht, dass die Playlist in den Einzelsachen, sondern nur die Alben. Kannst du das irgendwie über Spotify erledigen? Dann möchte ich, dass die App von den Farben her angepasst wird. Bitte nimm dazu ein schönes, freundliches Design. Das Ganze soll dann auch in einem guten Look sein. Kannst du hier eine Design Library empfehlen? Versuch dafür freundliche und nette Farben rauszusuchen, die kindgerecht sind. Außerdem würde ich dann später gerne mit dir den Header überarbeiten.# 🎧 Spotify Kinder-Hörspiele Player

Ein kindgerechter Audiobook-Player für Spotify mit Elternkontrolle.

## Features

- **👶 Kid Interface**: Große Cover-Karten, einfache Steuerung
- **⏰ Elternkontrolle**: Zeitlimits pro Tag, Ruhezeiten
- **💾 Fortsetzen**: Spielposition wird automatisch gespeichert
- **🔄 Neustarten**: Mit Klick auf "Neustarten" von vorne spielen
- **📻 Spotify Integration**: Lade ganze Playlists über Spotify Web API

## Setup

### 1. Spotify Developer Account

1. Gehe zu https://developer.spotify.com/dashboard
2. Erstelle eine neue App
3. Du erhältst:
   - `Client ID`

### 2. Environment Variables

Kopiere `.env.example` zu `.env.local` und ersetze:

```bash
cp .env.example .env.local
```

Dann Werte eintragen:

```env
VITE_SPOTIFY_CLIENT_ID=dein_client_id_hier
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/
# Optional nur lokal in der Entwicklung:
# VITE_DISABLE_PIN_PROTECTION=true
# VITE_MASTER_PIN=9999
```

### 3. Spotify App Einstellungen

Im Spotify Dashboard:
- **Redirect URI hinzufügen**: `http://localhost:5173/`
- Für Deploy zusätzlich: `https://frank-privat.github.io/kinder-hoerspiele/`
- **App Art**: Web Application
- **User Agreement**: Akzeptieren

### 4. Authorisierung

Die App wird dich auffordern, dich mit Spotify Premium anzumelden. Du brauchst ein **Premium**-Konto für Playback.

### 5. Auth-Flow

Diese App nutzt OAuth mit PKCE. Das funktioniert ohne Client Secret im Frontend.

## Architecture

```
src/
├── App.jsx                  # Router, Main App
├── pages/
│   ├── kid/                 # Kid Interface
│   └── admin/               # Parent Admin Panel
├── components/
│   ├── StoryGrid.jsx        # Cover-Grid
│   ├── SpotifyPlayer.jsx    # Player-Kontrolle
│   └── admin/               # Admin-Komponenten
├── contexts/
│   └── store.js             # Zustand Store
├── services/
│   └── spotify.js           # Spotify API-Wrapper
└── index.css                # Tailwind + Styles
```

## State Management (Zustand)

Der Store speichert:
- Authentifizierung
- Stories (geladene Alben mit Tracks)
- Playlist-Quellen für automatisches Aktualisieren beim Start
- Playback-Position pro Story
- Eltern-Settings (Zeitlimit, Ruhezeiten)

Alles wird in `localStorage` persistiert unter `spotify-audiobook-store`.

## Spotify Web Playback SDK

In `src/components/SpotifyPlayer.jsx`:
- Simplified Demo-Player (Platzhalter)
- Production: Nutze echten Spotify SDK:

```javascript
const player = new Spotify.Player({
  name: 'Kinder-Hörspiele',
  getOAuthToken: (callback) => callback(accessToken),
  volume: 0.5,
})
```

## Eltern-Features

### Admin Panel (`/admin`)

1. **📻 Playlist**
   - Spotify-Playlist per URL laden
   - Tracks automatisch als Stories anzeigen

2. **📚 Inhalte**
   - Tracks hinzufügen/entfernen
   - Ansicht aller verfügbaren Stories

3. **⏱️ Zeitlimits**
   - Max. Hördauer pro Tag (z.B. 60 Minuten)
   - Ruhezeiten (z.B. 21:00 - 7:00)
   - Tageszeit zurücksetzen

## Kind-Features

### Kid Interface

1. **Große Cover-Karten**
   - Klick zum Abspielen
   - Visueller "Playing"-Status

2. **Player**
   - Play/Pause/Neustarten
   - Fortschrittsbalken
   - Zeit-Anzeige

3. **Automatische Speicherung**
   - Spielposition wird alle 30 Sekunden gespeichert
   - Beim Neustarten wird die Position wiederhergestellt

4. **Zeitlimit-Schutz**
   - Meldung wenn Limit erreicht
   - Verbleibende Minuten anzeigen
   - Auto-Disable des Players

## Deployment

### GitHub Pages

```bash
npm run deploy
```

→ App deployed zu `https://frank-privat.github.io/kinder-hoerspiele/`

### Spotify Redirect URI für Production

Ändere in `.env.production`:
```env
VITE_SPOTIFY_REDIRECT_URI=https://frank-privat.github.io/kinder-hoerspiele/
```

## Sicherheit

- ⚠️ Client Secret sollte **niemals** im Frontend sichtbar sein
- Diese Implementierung nutzt PKCE und braucht kein Secret im Browser
- Redirect URI muss in Spotify Dashboard registriert sein
- Tokens werden in `localStorage` gespeichert (für Demo OK, Production: HttpOnly Cookies)

## Troubleshooting

### "Ungültiger Redirect URI"
- Prüfe `.env.local` → `VITE_SPOTIFY_REDIRECT_URI`
- Registriere die URI im Spotify Dashboard

### "Access Denied / Unauthorized"
- Premium Konto nötig für Playback
- Token möglicherweise abgelaufen — Refresh über Button

### Playlist wurde nicht geladen
- Prüfe die Playlist-URL Format: `https://open.spotify.com/playlist/PLAYLIST_ID`
- API Token möglicherweise ungültig

## Nächste Schritte

1. ✅ Environment Variables setzen
2. ✅ Spotify App im Dashboard erstellen
3. ✅ Dev Server: `npm run dev`
4. ✅ Mit Spotify anmelden
5. ✅ Admin Panel → Playlist laden
6. ✅ Kid Interface → Hören!

---

**Made with 🎧 for kids everywhere**
