import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { apiFetch } from "../services/api";

function syncSelected(state: PlaylistState, playlist: Playlist) {
    if (state.selectedPlaylist?.id === playlist.id) {
        state.selectedPlaylist = { ...playlist };
    }
}

function syncCurrentPlaying(state: PlaylistState) {
    if (!state.currentPlayingPlaylistId) {
        state.currentPlayingTrackId = null;
        return;
    }

    const playlist = state.playlists.find(p => p.id === state.currentPlayingPlaylistId);
    if (!playlist) {
        state.currentPlayingPlaylistId = null;
        state.currentPlayingTrackId = null;
        return;
    }

    if (!playlist.tracks.length) {
        state.currentPlayingTrackId = null;
        return;
    }

    const hasCurrentTrack = state.currentPlayingTrackId
        ? playlist.tracks.some(t => t.id === state.currentPlayingTrackId)
        : false;

    if (!hasCurrentTrack) {
        state.currentPlayingTrackId = playlist.tracks[0].id;
    }
}


export interface track {
    id: string;
    title: string;
    artist: string;
    image: string;
}

export interface Playlist {
    id: string;
    name: string;
    tracks: track[];
}

export interface PlaylistState {
    playlists: Playlist[];
    selectedPlaylist: Playlist | null;
    currentPlayingPlaylistId: string | null;
    currentPlayingTrackId: string | null;
}


export const initialPlaylistState: PlaylistState = {
    playlists: [],
    selectedPlaylist: null,
    currentPlayingPlaylistId: null,
    currentPlayingTrackId: null,
};

export const fetchPlaylists = createAsyncThunk(
    "playlist/fetchPlaylists",
    async () => {
        const response = await apiFetch("/api/playlists");
        console.log(response);
        return response;
    }
);

export const fetchPlaylistsWithTracks = createAsyncThunk(
    "playlist/fetchPlaylistsWithTracks",
    async () => {
        const playlists = await apiFetch("/api/playlists");

        const withTracks: Playlist[] = await Promise.all(
            playlists.map(async (p: any) => {
                const tracksResponse = await apiFetch(`/api/playlists/${p.id}/tracks`);
                const tracks = Array.isArray(tracksResponse)
                    ? tracksResponse.map((t: any) => ({
                        id: t.id ?? t.track_id ?? t.trackId ?? "",
                        title: t.title ?? "",
                        artist: t.artist ?? "",
                        image: t.image ?? t.image_url ?? "",
                    }))
                    : [];

                return {
                    id: p.id?.toString?.() ?? String(p.id),
                    name: p.name ?? "Untitled Playlist",
                    tracks,
                } satisfies Playlist;
            })
        );

        return withTracks;
    }
);

export const createPlaylist = createAsyncThunk(
    "playlist/createPlaylist",
    async (playlist: Playlist) => {
        const response = await apiFetch("/api/playlists", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: playlist.name }),
        });
        console.log(response);
        return {
            ...response,
            tracks: []
        };
    }
);

export const addTrackToPlaylistApi = createAsyncThunk(
    "playlist/addTrackToPlaylistApi",
    async ({ playlistId, track }: { playlistId: string; track: track }) => {
        await apiFetch(`/api/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: track.id,
                title: track.title,
                artist: track.artist,
                image: track.image,
            }),
        });

        return { playlistId, track };
    }
);

export const removeTrackFromPlaylistApi = createAsyncThunk(
    "playlist/removeTrackFromPlaylistApi",
    async ({ playlistId, trackId }: { playlistId: string; trackId: string }) => {
        await apiFetch(`/api/playlists/${playlistId}/tracks/${trackId}`, {
            method: "DELETE",
        });

        return { playlistId, trackId };
    }
);

export const removePlaylistApi = async (playlistId: string) => {
    await apiFetch(`/api/playlists/${playlistId}`, {
        method: "DELETE",
    });
}

export const reorderTracksApi = createAsyncThunk(
    "playlist/reorderTracksApi",
    async ({ playlistId, trackIds }: { playlistId: string; trackIds: string[] }) => {
        await apiFetch(`/api/playlists/${playlistId}/reorder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ trackIds }),
        });

        return { playlistId, trackIds };
    }
);

export const playlistSlice = createSlice({
    name: "playlist",
    initialState: initialPlaylistState,
    reducers: {
        setPlaylists(state: PlaylistState, action: PayloadAction<Playlist[]>) {
            const fetchedPlaylists = action.payload;
            const hasLikedSongs = fetchedPlaylists.some(p => p.id === "liked-songs");
            if (!hasLikedSongs) {
                state.playlists = [...fetchedPlaylists];
            } else {
                state.playlists = fetchedPlaylists;
            }
            if (state.selectedPlaylist) {
                const matched = state.playlists.find(p => p.id === state.selectedPlaylist?.id);
                state.selectedPlaylist = matched ?? state.selectedPlaylist;
            }
            syncCurrentPlaying(state);
        },
        addPlaylist(state: PlaylistState, action: PayloadAction<Playlist>) {
            state.playlists.push(action.payload);
        },
        renamePlaylist(state: PlaylistState, action: PayloadAction<{ id: string; name: string }>) {
            const playlist = state.playlists.find(p => p.id === action.payload.id);
            if (playlist && playlist.id !== "liked-songs") {
                playlist.name = action.payload.name;
                syncSelected(state, playlist);
            }
        },
        reorderTracks(state: PlaylistState, action: PayloadAction<{ playlistId: string; oldIndex: number; newIndex: number }>) {
            const playlist = state.playlists.find(p => p.id === action.payload.playlistId);
            if (playlist) {
                const tracks = Array.from(playlist.tracks);
                const [movedTrack] = tracks.splice(action.payload.oldIndex, 1);
                tracks.splice(action.payload.newIndex, 0, movedTrack);
                playlist.tracks = tracks;
                syncSelected(state, playlist);
                syncCurrentPlaying(state);
            }
        },
        addTrackToPlaylist(state: PlaylistState, action: PayloadAction<{ playlistId: string; track: track }>) {
            const { playlistId, track } = action.payload;
            const playlist = state.playlists.find(p => p.id === playlistId);
            if (playlist) {
                if (!playlist.tracks.some(t => t.id === track.id)) {
                    playlist.tracks.push(track);
                    syncSelected(state, playlist);
                }
            }
        },
        removeTrackFromPlaylist(state: PlaylistState, action: PayloadAction<{ playlistId: string; trackId: string }>) {
            const { playlistId, trackId } = action.payload;
            const playlist = state.playlists.find(p => p.id === playlistId);
            if (playlist) {
                const removedIndex = playlist.tracks.findIndex(t => t.id === trackId);
                playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
                syncSelected(state, playlist);

                if (
                    state.currentPlayingPlaylistId === playlistId &&
                    state.currentPlayingTrackId === trackId
                ) {
                    if (playlist.tracks.length === 0) {
                        state.currentPlayingTrackId = null;
                    } else {
                        const nextIndex = Math.min(removedIndex, playlist.tracks.length - 1);
                        state.currentPlayingTrackId = playlist.tracks[nextIndex].id;
                    }
                }
            }
        },
        deletePlaylist(state: PlaylistState, action: PayloadAction<string>) {
            state.playlists = state.playlists.filter(p => p.id !== action.payload);
            removePlaylistApi(action.payload);
            if (state.selectedPlaylist?.id === action.payload) {
                state.selectedPlaylist = null;
            }
            if (state.currentPlayingPlaylistId === action.payload) {
                state.currentPlayingPlaylistId = null;
                state.currentPlayingTrackId = null;
            }

        },
        setSelectedPlaylist(state: PlaylistState, action: PayloadAction<Playlist | null>) {
            if (!action.payload) {
                state.selectedPlaylist = null;
                return;
            }
            const id = action.payload.id;
            const playlist = state.playlists.find(p => p.id === id);
            state.selectedPlaylist = playlist ?? action.payload;
        },
        setCurrentPlayingTrack(state: PlaylistState, action: PayloadAction<{ playlistId: string; trackId: string } | null>) {
            if (!action.payload) {
                state.currentPlayingPlaylistId = null;
                state.currentPlayingTrackId = null;
                return;
            }

            const { playlistId, trackId } = action.payload;
            const playlist = state.playlists.find(p => p.id === playlistId);
            if (!playlist) {
                return;
            }

            const trackExists = playlist.tracks.some(t => t.id === trackId);
            if (!trackExists) {
                return;
            }

            state.currentPlayingPlaylistId = playlistId;
            state.currentPlayingTrackId = trackId;
        },
        playNextTrack(state: PlaylistState) {
            if (!state.currentPlayingPlaylistId || !state.currentPlayingTrackId) {
                return;
            }

            const playlist = state.playlists.find(p => p.id === state.currentPlayingPlaylistId);
            if (!playlist || !playlist.tracks.length) {
                return;
            }

            const currentIndex = playlist.tracks.findIndex(t => t.id === state.currentPlayingTrackId);
            if (currentIndex === -1) {
                state.currentPlayingTrackId = playlist.tracks[0].id;
                return;
            }

            const nextIndex = (currentIndex + 1) % playlist.tracks.length;
            state.currentPlayingTrackId = playlist.tracks[nextIndex].id;
        },
        playPreviousTrack(state: PlaylistState) {
            if (!state.currentPlayingPlaylistId || !state.currentPlayingTrackId) {
                return;
            }

            const playlist = state.playlists.find(p => p.id === state.currentPlayingPlaylistId);
            if (!playlist || !playlist.tracks.length) {
                return;
            }

            const currentIndex = playlist.tracks.findIndex(t => t.id === state.currentPlayingTrackId);
            if (currentIndex === -1) {
                state.currentPlayingTrackId = playlist.tracks[0].id;
                return;
            }

            const previousIndex = (currentIndex - 1 + playlist.tracks.length) % playlist.tracks.length;
            state.currentPlayingTrackId = playlist.tracks[previousIndex].id;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPlaylists.fulfilled, (state, action) => {
            const fetchedPlaylists = action.payload;
            const hasLikedSongs = fetchedPlaylists.some((p: Playlist) => p.id === "liked-songs");
            if (!hasLikedSongs) {
                state.playlists = [...fetchedPlaylists];
            } else {
                state.playlists = fetchedPlaylists;
            }

            if (state.selectedPlaylist) {
                const matched = state.playlists.find(p => p.id === state.selectedPlaylist?.id);
                state.selectedPlaylist = matched ?? state.selectedPlaylist;
            }
            syncCurrentPlaying(state);
        });
        builder.addCase(fetchPlaylistsWithTracks.fulfilled, (state, action) => {
            const fetchedPlaylists = action.payload;
            const hasLikedSongs = fetchedPlaylists.some((p: Playlist) => p.id === "liked-songs");
            if (!hasLikedSongs) {
                state.playlists = [...fetchedPlaylists];
            } else {
                state.playlists = fetchedPlaylists;
            }
            if (state.selectedPlaylist) {
                const matched = state.playlists.find(p => p.id === state.selectedPlaylist?.id);
                state.selectedPlaylist = matched ?? state.selectedPlaylist;
            }
            syncCurrentPlaying(state);
        });
        builder.addCase(createPlaylist.fulfilled, (state, action) => {
            state.playlists.push(action.payload);
        });
        builder.addCase(addTrackToPlaylistApi.fulfilled, (state, action) => {
            playlistSlice.caseReducers.addTrackToPlaylist(state, {
                type: addTrackToPlaylistApi.fulfilled.type,
                payload: action.payload,
            });
        });
        builder.addCase(removeTrackFromPlaylistApi.fulfilled, (state, action) => {
            playlistSlice.caseReducers.removeTrackFromPlaylist(state, {
                type: removeTrackFromPlaylistApi.fulfilled.type,
                payload: action.payload,
            });
        });
        builder.addCase(reorderTracksApi.fulfilled, (state, action) => {
            const { playlistId, trackIds } = action.payload;
            const playlist = state.playlists.find(p => p.id === playlistId);
            if (playlist) {
                const reordered: track[] = [];
                trackIds.forEach(id => {
                    const found = playlist.tracks.find(t => t.id === id);
                    if (found) reordered.push(found);
                });
                // include any stray tracks not in provided list at end
                playlist.tracks.forEach(t => {
                    if (!trackIds.includes(t.id)) reordered.push(t);
                });
                playlist.tracks = reordered;
                syncSelected(state, playlist);
                syncCurrentPlaying(state);
            }
        });
    }
});

export const {
    setPlaylists,
    addPlaylist,
    renamePlaylist,
    reorderTracks,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    deletePlaylist,
    setSelectedPlaylist,
    setCurrentPlayingTrack,
    playNextTrack,
    playPreviousTrack,
} = playlistSlice.actions;

export default playlistSlice.reducer;