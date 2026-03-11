import { buildAlbumStories } from '../utils/playlistLoader'

/**
 * Spotify Web API Service
 * Handles authentication, API calls, and Web Playback SDK
 */

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const REDIRECT_URI =
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}${import.meta.env.BASE_URL}`
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-playback-position',
  'user-library-read',
]

function generateRandomString(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  const randomValues = crypto.getRandomValues(new Uint8Array(length))
  randomValues.forEach((v) => {
    result += chars[v % chars.length]
  })
  return result
}

async function sha256(plain) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64UrlEncode(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

class SpotifyService {
  constructor() {
    this.token = localStorage.getItem('spotify_token')
    this.refreshToken = localStorage.getItem('spotify_refresh_token')
    this.tokenExpiry = parseInt(localStorage.getItem('spotify_token_expiry') || '0')
    this.player = null
    this.deviceId = null
    this._playerReadyPromise = null
    this._onStateChange = null
  }

  // ===== AUTH =====

  async getAuthUrl() {
    const state = Math.random().toString(36).substring(7)
    const codeVerifier = generateRandomString(96)
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64UrlEncode(hashed)

    localStorage.setItem('spotify_auth_state', state)
    localStorage.setItem('spotify_code_verifier', codeVerifier)

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES.join(' '),
      state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    })

    return `${SPOTIFY_AUTH_URL}?${params}`
  }

  async exchangeCodeForToken(code) {
    try {
      const codeVerifier = localStorage.getItem('spotify_code_verifier')
      if (!codeVerifier) {
        throw new Error('Missing PKCE code verifier')
      }

      const body = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      })

      const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`)
      }

      const data = await response.json()

      this.token = data.access_token
      this.refreshToken = data.refresh_token
      this.tokenExpiry = Date.now() + data.expires_in * 1000

      localStorage.setItem('spotify_token', this.token)
      localStorage.setItem('spotify_refresh_token', this.refreshToken)
      localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString())
      localStorage.removeItem('spotify_code_verifier')

      return true
    } catch (error) {
      console.error('Token exchange failed:', error)
      return false
    }
  }

  isTokenValid() {
    return this.token && Date.now() < this.tokenExpiry
  }

  async refreshAccessToken() {
    if (!this.refreshToken) return false

    try {
      const body = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      })

      const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const data = await response.json()

      this.token = data.access_token
      this.refreshToken = data.refresh_token || this.refreshToken
      this.tokenExpiry = Date.now() + data.expires_in * 1000

      localStorage.setItem('spotify_token', this.token)
      localStorage.setItem('spotify_refresh_token', this.refreshToken)
      localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString())

      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  // ===== API CALLS =====

  async apiCall(endpoint, options = {}) {
    if (!this.isTokenValid()) {
      const refreshed = await this.refreshAccessToken()
      if (!refreshed) throw new Error('Not authenticated')
    }

    const response = await fetch(`${SPOTIFY_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken()
      if (!refreshed) throw new Error('Session expired')
      return this.apiCall(endpoint, options)
    }

    if (response.status === 204) return null
    if (!response.ok) {
      let detail = ''
      try { detail = await response.text() } catch (_) {}
      console.error(`Spotify API ${response.status}:`, endpoint, detail)
      if (response.status === 403) {
        throw new Error('Zugriff verweigert – prüfe, ob die Playlist öffentlich oder mit dir geteilt ist.')
      }
      throw new Error(`Spotify API Fehler: ${response.status} - ${detail}`)
    }

    return response.json()
  }

  async getPlaylistTracks(playlistId) {
    const items = []

    // Strategy 1: Try getting tracks from the full playlist object
    try {
      const playlist = await this.apiCall(`/playlists/${playlistId}`)
      if (playlist.tracks?.items) {
        items.push(...playlist.tracks.items)
        // Handle pagination if more than 100 tracks
        let nextUrl = playlist.tracks.next
        while (nextUrl) {
          const data = await this.apiCall(nextUrl.replace(SPOTIFY_API_URL, ''))
          items.push(...(data.items || []))
          nextUrl = data.next
        }
        return items
      }
    } catch (e) {
      console.warn('Playlist full fetch failed, trying tracks endpoint:', e.message)
    }

    // Strategy 2: Fallback to /tracks endpoint (market aus Token abgeleitet)
    let url = `/playlists/${playlistId}/tracks?limit=50`
    while (url) {
      const data = await this.apiCall(url)
      items.push(...(data.items || []))
      if (data.next) {
        url = data.next.replace(SPOTIFY_API_URL, '')
      } else {
        url = null
      }
    }

    return items
  }

  async getPlaylist(playlistId) {
    return this.apiCall(`/playlists/${playlistId}`)
  }

  async loadPlaylistAlbums(playlistId) {
    // Alles in einem Call: Playlist-Metadaten + erste Tracks-Seite
    const playlist = await this.apiCall(`/playlists/${playlistId}`)

    // Spotify API: tracks können unter "tracks" oder "items" liegen
    const trackWrapper = playlist.tracks || playlist.items || {}
    const items = [...(trackWrapper.items || [])]

    // Pagination: Spotify bettet max. 100 Tracks ein, Rest nachladen
    let nextUrl = trackWrapper.next
    while (nextUrl) {
      const relative = nextUrl.replace(SPOTIFY_API_URL, '')
      const data = await this.apiCall(relative)
      items.push(...(data.items || []))
      nextUrl = data.next
    }

    // Debug: Typen der Items loggen
    const types = {}
    items.forEach((i) => {
      // Spotify API: track-Daten unter "track" oder "item"
      const tr = i?.track || i?.item
      const t = tr?.type || (tr === null ? 'null' : 'unknown')
      types[t] = (types[t] || 0) + 1
    })
    console.log(`[Playlist ${playlistId}] ${items.length} Items, total: ${trackWrapper.total}`, types)

    return {
      id: playlistId,
      name: playlist?.name || 'Playlist',
      url: playlist?.external_urls?.spotify || `https://open.spotify.com/playlist/${playlistId}`,
      stories: buildAlbumStories(items),
    }
  }

  async getAlbum(albumId) {
    return this.apiCall(`/albums/${albumId}`)
  }

  async getCurrentUser() {
    return this.apiCall('/me')
  }

  async search(query, type = 'playlist') {
    const params = new URLSearchParams({ q: query, type, limit: 20 })
    return this.apiCall(`/search?${params}`)
  }

  // ===== WEB PLAYBACK SDK =====

  initPlayer(onStateChange) {
    this._onStateChange = onStateChange

    if (this.player) {
      return Promise.resolve(this.deviceId)
    }

    this._playerReadyPromise = new Promise((resolve, reject) => {
      const setup = () => {
        const player = new window.Spotify.Player({
          name: 'Kinder-Hörspiele',
          getOAuthToken: async (cb) => {
            if (!this.isTokenValid()) {
              await this.refreshAccessToken()
            }
            cb(this.token)
          },
          volume: 0.8,
        })

        player.addListener('ready', ({ device_id }) => {
          console.log('Spotify Player ready, device:', device_id)
          this.deviceId = device_id
          resolve(device_id)
        })

        player.addListener('not_ready', ({ device_id }) => {
          console.warn('Spotify Player not ready:', device_id)
        })

        player.addListener('player_state_changed', (state) => {
          if (this._onStateChange) this._onStateChange(state)
        })

        player.addListener('initialization_error', ({ message }) => {
          console.error('Init error:', message)
          reject(new Error(message))
        })

        player.addListener('authentication_error', ({ message }) => {
          console.error('Auth error:', message)
          reject(new Error(message))
        })

        player.addListener('account_error', ({ message }) => {
          console.error('Account error (Premium required):', message)
          reject(new Error('Spotify Premium erforderlich'))
        })

        player.connect()
        this.player = player
      }

      if (window.spotifySDKReady) {
        setup()
      } else {
        window.addEventListener('spotify-sdk-ready', setup, { once: true })
      }
    })

    return this._playerReadyPromise
  }

  async play(spotifyUri, positionMs = 0) {
    if (!this.deviceId) {
      throw new Error('Player nicht bereit')
    }

    if (!this.isTokenValid()) {
      await this.refreshAccessToken()
    }

    // Determine if it's a track, album, or playlist
    const body = {}
    if (spotifyUri.includes(':track:')) {
      body.uris = [spotifyUri]
    } else {
      // album or playlist
      body.context_uri = spotifyUri
    }
    body.position_ms = positionMs

    const response = await fetch(
      `${SPOTIFY_API_URL}/me/player/play?device_id=${this.deviceId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok && response.status !== 204) {
      const err = await response.text()
      throw new Error(`Play failed: ${err}`)
    }
  }

  async pause() {
    if (!this.player) return
    await this.player.pause()
  }

  async resume() {
    if (!this.player) return
    await this.player.resume()
  }

  async seek(positionMs) {
    if (!this.player) return
    await this.player.seek(positionMs)
  }

  async getPlayerState() {
    if (!this.player) return null
    return this.player.getCurrentState()
  }

  async setVolume(value) {
    if (!this.player) return
    await this.player.setVolume(value)
  }

  disconnectPlayer() {
    if (this.player) {
      this.player.disconnect()
      this.player = null
      this.deviceId = null
    }
  }

  // ===== LOGOUT =====

  logout() {
    this.disconnectPlayer()
    this.token = null
    this.refreshToken = null
    this.tokenExpiry = 0
    localStorage.removeItem('spotify_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_token_expiry')
  }
}

export default new SpotifyService()
