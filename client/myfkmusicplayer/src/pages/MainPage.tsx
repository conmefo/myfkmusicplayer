import { useEffect } from "react";
import SearchBar from "../components/search/SearchBar";
import SearchDropdown from "../components/search/SearchDropdown";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { refreshToken } from "../services/authService";
import Library from "../components/library/Library";
import { fetchPlaylistsWithTracks, playNextTrack, playPreviousTrack } from "../store/playlistSlice";
import { Button } from "@/components/ui/button";
import { Music, Settings } from "lucide-react";
import MusicPlayerContainer from "../components/music_player/MusicPlayerContainer";

export default function MainPage() {
    const dispatch = useDispatch<AppDispatch>();
    const showDropdown = useSelector((state: RootState) => state.search.showDropdown);
    const playlists = useSelector((state: RootState) => state.playlist.playlists);
    const currentPlayingPlaylistId = useSelector((state: RootState) => state.playlist.currentPlayingPlaylistId);
    const currentPlayingTrackId = useSelector((state: RootState) => state.playlist.currentPlayingTrackId);

    const currentPlayingPlaylist = playlists.find(p => p.id === currentPlayingPlaylistId) ?? null;
    const currentPlayingTrack = currentPlayingPlaylist?.tracks.find(t => t.id === currentPlayingTrackId) ?? null;

    useEffect(() => {
        refreshToken().then(success => {
            if (!success) {
                console.error("Failed to refresh token");
                window.location.href = "/login";
                return;
            }
            dispatch(fetchPlaylistsWithTracks());
        });
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
                <header className="rounded-xl z-20 border border-border/60 bg-card/60 p-4 backdrop-blur sm:p-5">
                    <div className="relative">
                        <SearchBar />
                        {showDropdown && <SearchDropdown />}
                    </div>
                </header>

                <div className="relative">
                    <Library />
                </div>

                <div className="fixed bottom-0 left-0 right-0 z-30 mx-auto w-full max-w-4xl rounded-t-2xl border border-border/70 bg-card/80 p-4 shadow-lg backdrop-blur sm:p-6">
                    <MusicPlayerContainer
                        playlist={currentPlayingPlaylist}
                        currentTrack={currentPlayingTrack}
                        onNext={() => dispatch(playNextTrack())}
                        onPrevious={() => dispatch(playPreviousTrack())}
                    />
                </div>
            </div>
        </div>
    )
}

