import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // ===== AUTH =====
      isAuthenticated: !!localStorage.getItem('spotify_token'),
      spotifyUser: null,
      setSpotifyUser: (user) => set({ spotifyUser: user }),
      setAuthenticated: (auth) => set({ isAuthenticated: auth }),

      // ===== CONTENT =====
      stories: [],
      playlists: [], // [{ id, name, sourceUrl, storyCount, loadedAt, lastSyncedAt }]
      selectedPlaylistId: null,

      setStories: (stories) => set({ stories }),
      setSelectedPlaylist: (id) => set({ selectedPlaylistId: id }),

      addPlaylist: ({ id, name, sourceUrl, stories }) =>
        set((state) => {
          const updatedPlaylists = [
            ...state.playlists.filter((p) => p.id !== id),
            {
              id,
              name,
              sourceUrl: sourceUrl || `https://open.spotify.com/playlist/${id}`,
              storyCount: stories.length,
              loadedAt: state.playlists.find((p) => p.id === id)?.loadedAt || new Date().toISOString(),
              lastSyncedAt: new Date().toISOString(),
            },
          ]
          // Bekannte Playlist-IDs nach dem Update
          const validPlaylistIds = new Set(updatedPlaylists.map((p) => p.id))
          return {
            stories: [
              // Nur Stories behalten die zu einer noch existierenden Playlist gehören
              ...state.stories.filter((s) => s.playlistId && s.playlistId !== id && validPlaylistIds.has(s.playlistId)),
              ...stories.map((s) => ({ ...s, playlistId: id })),
            ],
            playlists: updatedPlaylists,
            selectedPlaylistId: id,
          }
        }),

      removePlaylist: (playlistId) =>
        set((state) => ({
          stories: state.stories.filter((s) => s.playlistId !== playlistId),
          playlists: state.playlists.filter((p) => p.id !== playlistId),
          selectedPlaylistId:
            state.selectedPlaylistId === playlistId ? null : state.selectedPlaylistId,
        })),

      addStory: (story) => set((state) => ({ stories: [...state.stories, story] })),

      removeStory: (storyId) =>
        set((state) => ({ stories: state.stories.filter((s) => s.id !== storyId) })),

      // ===== PLAYBACK =====
      currentStoryId: null,
      currentTrackUri: null,
      playbackState: {},

      setCurrentStory: (storyId) => set({ currentStoryId: storyId, currentTrackUri: null }),

      setCurrentTrack: (storyId, trackUri) =>
        set({ currentStoryId: storyId, currentTrackUri: trackUri }),

      setPlaybackState: (storyId, state) =>
        set((s) => ({
          playbackState: { ...s.playbackState, [storyId]: state },
        })),

      getPlaybackState: (storyId) => {
        const state = get().playbackState[storyId]
        return state || { positionMs: 0, isPlaying: false, lastPlayed: null }
      },

      // ===== PARENTAL CONTROLS =====
      parentalSettings: {
        timerEnabled: true,
        maxListeningTimePerDayMs: 60 * 60 * 1000,
        currentListeningTimeMs: 0,
        lastResetDate: new Date().toDateString(),
        quietHoursStart: null,
        quietHoursEnd: null,
        contentRestrictions: [],
      },
      adminPin: '1234',

      updateParentalSettings: (settings) =>
        set((state) => ({
          parentalSettings: { ...state.parentalSettings, ...settings },
        })),

      setAdminPin: (pin) => set({ adminPin: pin }),

      incrementListeningTime: (ms) =>
        set((state) => {
          const today = new Date().toDateString()
          const shouldResetDaily = state.parentalSettings.lastResetDate !== today
          return {
            parentalSettings: {
              ...state.parentalSettings,
              currentListeningTimeMs: shouldResetDaily
                ? ms
                : state.parentalSettings.currentListeningTimeMs + ms,
              lastResetDate: today,
            },
          }
        }),

      getListeningTimeRemaining: () => {
        const { parentalSettings } = get()
        return Math.max(
          0,
          parentalSettings.maxListeningTimePerDayMs - parentalSettings.currentListeningTimeMs
        )
      },

      hasExceededListeningTime: () => {
        const { parentalSettings } = get()
        return parentalSettings.currentListeningTimeMs > parentalSettings.maxListeningTimePerDayMs
      },

      resetDailyListeningTime: () =>
        set((state) => ({
          parentalSettings: {
            ...state.parentalSettings,
            currentListeningTimeMs: 0,
            lastResetDate: new Date().toDateString(),
          },
        })),

      // ===== SYNC =====
      isSyncing: false,
      setSyncing: (value) => set({ isSyncing: value }),

      // ===== ADMIN MODE =====
      isAdminMode: false,
      setAdminMode: (isAdmin) => set({ isAdminMode: isAdmin }),

      // ===== RESET =====
      reset: () =>
        set({
          isAuthenticated: false,
          spotifyUser: null,
          stories: [],
          playlists: [],
          selectedPlaylistId: null,
          currentStoryId: null,
          currentTrackUri: null,
          playbackState: {},
          parentalSettings: {
            maxListeningTimePerDayMs: 60 * 60 * 1000,
            currentListeningTimeMs: 0,
            lastResetDate: new Date().toDateString(),
            quietHoursStart: null,
            quietHoursEnd: null,
            contentRestrictions: [],
          },
        }),
    }),
    {
      name: 'spotify-audiobook-store',
      partialize: (state) => ({
        stories: state.stories,
        playlists: state.playlists,
        spotifyUser: state.spotifyUser,
        playbackState: state.playbackState,
        parentalSettings: state.parentalSettings,
        selectedPlaylistId: state.selectedPlaylistId,
        adminPin: state.adminPin,
      }),
    }
  )
)
