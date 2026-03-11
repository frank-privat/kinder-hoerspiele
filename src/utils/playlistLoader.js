export function extractPlaylistId(input) {
  if (!input) return null
  const match = input.match(/playlist\/([a-zA-Z0-9]+)/)
  return match?.[1] || null
}

export function buildAlbumStories(trackItems) {
  const albumMap = new Map()

  trackItems
    .filter((item) => {
      // Spotify API: track-Daten unter "track" oder "item"
      const tr = item?.track || item?.item
      return tr && (tr.type === 'track' || tr.type === 'episode')
    })
    .forEach((item) => {
      const track = item.track || item.item
      const isEpisode = track.type === 'episode'

      // Episoden: "show" ist das Album-Äquivalent
      const album = isEpisode ? (track.show || {}) : (track.album || {})
      const albumName = isEpisode ? (album.name || track.name) : album.name
      const albumId = album.id || null
      const albumArtist = isEpisode
        ? (album.publisher || 'Unbekannt')
        : (album.artists?.map((a) => a.name).join(', '))
      const trackArtist = isEpisode
        ? (album.publisher || 'Unbekannt')
        : (track.artists?.map((a) => a.name).join(', '))
      const coverImages = album.images || track.images || []

      const groupingKey =
        albumId ||
        [albumName, albumArtist || trackArtist]
          .filter(Boolean)
          .join('::')
          .toLowerCase()

      if (!groupingKey || !albumName) return

      if (!albumMap.has(groupingKey)) {
        albumMap.set(groupingKey, {
          id: albumId || groupingKey,
          spotifyId: albumId || groupingKey,
          spotifyUri: album.uri || track.uri,
          title: albumName,
          artist: albumArtist || trackArtist || 'Unbekannt',
          coverUrl: coverImages[0]?.url || coverImages[1]?.url || null,
          durationMs: track.duration_ms,
          type: isEpisode ? 'show' : 'album',
          trackCount: 0,
          tracks: [],
        })
      }

      const entry = albumMap.get(groupingKey)
      entry.trackCount += 1
      entry.tracks.push({
        id: track.id,
        title: track.name,
        uri: track.uri,
        durationMs: track.duration_ms,
        trackNumber: track.track_number ?? entry.trackCount,
        artists: trackArtist || '',
      })
    })

  return Array.from(albumMap.values()).map((album) => ({
    ...album,
    tracks: album.tracks.sort((left, right) => (left.trackNumber || 0) - (right.trackNumber || 0)),
  }))
}