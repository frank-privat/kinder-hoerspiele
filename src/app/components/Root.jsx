import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router'
import { useStore } from '../../contexts/store'
import { useSyncPlaylists } from '../../hooks/useSyncPlaylists'
import spotifyService from '../../services/spotify'
import { extractPlaylistId } from '../../utils/playlistLoader'
import { LoadingScreen } from './LoadingScreen'

export function Root() {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const setAuthenticated = useStore((s) => s.setAuthenticated)
  const setSpotifyUser = useStore((s) => s.setSpotifyUser)
  const addPlaylist = useStore((s) => s.addPlaylist)
  const playlists = useStore((s) => s.playlists)

  useSyncPlaylists()

  // Initial auth check + OAuth callback handler
  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        // OAuth callback: exchange code for token
        const success = await spotifyService.exchangeCodeForToken(code)
        if (success) {
          setAuthenticated(true)
          try {
            const user = await spotifyService.getCurrentUser()
            setSpotifyUser(user)
          } catch (_) {}

          // Handle ?setup= (load playlist from URL param after auth)
          const setupParam = localStorage.getItem('pending_setup')
          if (setupParam) {
            const playlistId = extractPlaylistId(setupParam) || setupParam
            try {
              const loaded = await spotifyService.loadPlaylistAlbums(playlistId)
              addPlaylist({ id: playlistId, name: loaded.name, sourceUrl: loaded.url, stories: loaded.stories })
            } catch (_) {}
            localStorage.removeItem('pending_setup')
          }

          window.history.replaceState({}, document.title, window.location.pathname)
          setLoading(false)
          navigate('/player')
          return
        }
        window.history.replaceState({}, document.title, window.location.pathname)
        setLoading(false)
        return
      }

      // Regular auth check
      const token = localStorage.getItem('spotify_token')
      let authenticated = false
      if (token && spotifyService.isTokenValid()) {
        authenticated = true
      } else if (token) {
        authenticated = await spotifyService.refreshAccessToken()
      }

      setAuthenticated(authenticated)

      if (authenticated) {
        try {
          const user = await spotifyService.getCurrentUser()
          setSpotifyUser(user)
        } catch (_) {}
      }

      setLoading(false)
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle ?setup= in URL after login (iOS PWA flow)
  useEffect(() => {
    if (!isAuthenticated) return
    const params = new URLSearchParams(window.location.search)
    const setupParam = params.get('setup') || localStorage.getItem('pending_setup')
    const playlistId = setupParam ? (extractPlaylistId(setupParam) || setupParam) : null
    if (!playlistId) return
    if (playlists.some((p) => p.id === playlistId)) {
      localStorage.removeItem('pending_setup')
      return
    }
    localStorage.removeItem('pending_setup')
    spotifyService.loadPlaylistAlbums(playlistId)
      .then((loaded) => addPlaylist({ id: playlistId, name: loaded.name, sourceUrl: loaded.url, stories: loaded.stories }))
      .catch(console.error)
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auth-based redirects
  useEffect(() => {
    if (loading) return
    if (isAuthenticated && location.pathname === '/') {
      navigate('/player')
    } else if (!isAuthenticated && location.pathname !== '/') {
      navigate('/')
    }
  }, [isAuthenticated, loading, location.pathname, navigate])

  if (loading) return <LoadingScreen />

  return (
    <div className="size-full min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
