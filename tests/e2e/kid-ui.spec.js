import { test, expect } from '@playwright/test'

const mockStories = [
  {
    id: 'album-1',
    spotifyId: 'album-1',
    spotifyUri: 'spotify:album:album-1',
    title: 'Folge 35: Die Schoko Erpressung',
    artist: 'TKKG Junior',
    coverUrl: 'https://i.scdn.co/image/ab67616d00001e02677ee265be17a672080c70da',
    type: 'album',
    trackCount: 3,
    tracks: [
      {
        id: 'track-1',
        title: '35 - Die Schoko Erpressung - Teil 01',
        uri: 'spotify:track:track-1',
        durationMs: 183000,
        trackNumber: 1,
        artists: 'TKKG Junior',
      },
      {
        id: 'track-2',
        title: '35 - Die Schoko Erpressung - Teil 02',
        uri: 'spotify:track:track-2',
        durationMs: 190000,
        trackNumber: 2,
        artists: 'TKKG Junior',
      },
      {
        id: 'track-3',
        title: '35 - Die Schoko Erpressung - Teil 03',
        uri: 'spotify:track:track-3',
        durationMs: 186000,
        trackNumber: 3,
        artists: 'TKKG Junior',
      },
    ],
  },
  {
    id: 'album-2',
    spotifyId: 'album-2',
    spotifyUri: 'spotify:album:album-2',
    title: 'Folge 19: Urlaub auf Spökeroog',
    artist: 'Ghostsitter',
    coverUrl: 'https://i.scdn.co/image/ab67616d00001e02e202dbbd5821451bd0ba934d',
    type: 'album',
    trackCount: 2,
    tracks: [
      {
        id: 'track-4',
        title: 'Kapitel 01: Urlaub auf Spökeroog',
        uri: 'spotify:track:track-4',
        durationMs: 201000,
        trackNumber: 1,
        artists: 'Ghostsitter',
      },
      {
        id: 'track-5',
        title: 'Kapitel 02: Zurück im Hotel',
        uri: 'spotify:track:track-5',
        durationMs: 198000,
        trackNumber: 2,
        artists: 'Ghostsitter',
      },
    ],
  },
]

test.beforeEach(async ({ page }) => {
  await page.addInitScript((stories) => {
    const future = Date.now() + 60 * 60 * 1000
    localStorage.setItem('spotify_token', 'playwright-token')
    localStorage.setItem('spotify_token_expiry', String(future))
    localStorage.setItem(
      'spotify-audiobook-store',
      JSON.stringify({
        state: {
          stories,
          playlists: [
            { id: 'playlist-1', name: 'Hörspiele', storyCount: stories.length, loadedAt: new Date().toISOString() },
          ],
          playbackState: {},
          parentalSettings: {
            maxListeningTimePerDayMs: 60 * 60 * 1000,
            currentListeningTimeMs: 0,
            lastResetDate: new Date().toDateString(),
            quietHoursStart: null,
            quietHoursEnd: null,
            contentRestrictions: [],
          },
          selectedPlaylistId: 'playlist-1',
          adminPin: '1234',
        },
        version: 0,
      })
    )
  }, mockStories)
})

test('zeigt im Coverflow nur Alben und oeffnet die Titelliste', async ({ page }) => {
  await page.goto('')

  await expect(page.getByRole('button', { name: 'Coverflow' })).toBeVisible()
  await expect(page.getByText('Folge 35: Die Schoko Erpressung')).toBeVisible()
  await expect(page.getByText('Folge 19: Urlaub auf Spökeroog')).toBeVisible()

  await page.getByText('Folge 35: Die Schoko Erpressung').click()

  await expect(page.getByText('35 - Die Schoko Erpressung - Teil 01')).toBeVisible()
  await expect(page.getByText('35 - Die Schoko Erpressung - Teil 02')).toBeVisible()
  await expect(page.getByRole('button', { name: '▶ Vom Anfang spielen' })).toBeVisible()
})

test('wechselt in die Playlist-Ansicht und filtert nach Titeln', async ({ page }) => {
  await page.goto('')

  await page.getByRole('button', { name: 'Playlist' }).click()

  await expect(page.getByText('Playlist-Ansicht')).toBeVisible()
  await expect(page.getByText('Folge 35: Die Schoko Erpressung')).toBeVisible()
  await expect(page.getByText('Kapitel 02: Zurück im Hotel')).toBeVisible()

  await page.getByPlaceholder('Album oder Titel suchen').fill('Spökeroog')

  await expect(page.getByText('Folge 19: Urlaub auf Spökeroog')).toBeVisible()
  await expect(page.getByText('Kapitel 01: Urlaub auf Spökeroog')).toBeVisible()
  await expect(page.getByText('Folge 35: Die Schoko Erpressung')).toHaveCount(0)
})