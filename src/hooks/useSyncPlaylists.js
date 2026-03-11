import { useState, useEffect, useCallback, useRef } from 'react'
import { useStore } from '../contexts/store'
import spotifyService from '../services/spotify'

/** Automatische Synchronisierung alle 30 Minuten */
const SYNC_INTERVAL_MS = 30 * 60 * 1000

/**
 * Verhindert parallele Sync-Läufe über alle Hook-Instanzen hinweg
 * (z. B. App.jsx + PlaylistSelector nutzen denselben Lock)
 */
let syncLock = false

export function useSyncPlaylists() {
  const [syncError, setSyncError] = useState(null)

  const playlists = useStore((s) => s.playlists)
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const addPlaylist = useStore((s) => s.addPlaylist)
  const isSyncing = useStore((s) => s.isSyncing)
  const setSyncing = useStore((s) => s.setSyncing)

  // Stabile Refs – vermeiden stale closures in setInterval / visibilitychange
  const playlistsRef = useRef(playlists)
  const isAuthRef = useRef(isAuthenticated)
  const addPlaylistRef = useRef(addPlaylist)
  const setSyncingRef = useRef(setSyncing)

  useEffect(() => { playlistsRef.current = playlists }, [playlists])
  useEffect(() => { isAuthRef.current = isAuthenticated }, [isAuthenticated])
  useEffect(() => { addPlaylistRef.current = addPlaylist }, [addPlaylist])
  useEffect(() => { setSyncingRef.current = setSyncing }, [setSyncing])

  const syncAll = useCallback(async () => {
    const currentPlaylists = playlistsRef.current
    if (syncLock || !isAuthRef.current || currentPlaylists.length === 0) return false

    syncLock = true
    setSyncingRef.current(true)
    setSyncError(null)

    let allOk = true
    try {
      const results = await Promise.allSettled(
        currentPlaylists.map((pl) => spotifyService.loadPlaylistAlbums(pl.id))
      )

      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') return
        addPlaylistRef.current({
          id: currentPlaylists[index].id,
          name: result.value.name,
          sourceUrl: result.value.url || currentPlaylists[index].sourceUrl,
          stories: result.value.stories,
        })
      })

      const failedCount = results.filter((r) => r.status === 'rejected').length
      if (failedCount > 0) {
        setSyncError(`${failedCount} Playlist(s) konnten nicht synchronisiert werden.`)
        allOk = false
      }
    } catch {
      allOk = false
    } finally {
      syncLock = false
      setSyncingRef.current(false)
    }
    return allOk
  }, []) // stabil – liest alles über Refs

  // Einmaliger Startup-Sync (wird bei Fehler beim nächsten Render erneut versucht)
  const startupDoneRef = useRef(false)
  useEffect(() => {
    if (!isAuthenticated || playlists.length === 0 || startupDoneRef.current) return
    syncAll().then((ok) => {
      if (ok) startupDoneRef.current = true
    })
  }, [isAuthenticated, playlists.length, syncAll])

  // Periodischer Sync alle 30 Minuten
  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(syncAll, SYNC_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [isAuthenticated, syncAll])

  // Sync wenn Tab nach langer Abwesenheit wieder aktiv wird
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return
      const lastSync = playlistsRef.current[0]?.lastSyncedAt
      if (!lastSync) return
      const age = Date.now() - new Date(lastSync).getTime()
      if (age > SYNC_INTERVAL_MS) syncAll()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [syncAll])

  return { syncAll, isSyncing, syncError }
}
