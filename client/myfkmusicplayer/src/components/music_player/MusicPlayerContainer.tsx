import { db } from "@/services/db";
import { useEffect, useState } from "react";
import type { Playlist, track } from "@/store/playlistSlice";
import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward } from "lucide-react";
import { apiDownload } from "@/services/api";
import { storeSong } from "@/services/db";

interface MusicPlayerContainerProps {
    playlist: Playlist | null;
    currentTrack: track | null;
    onNext: () => void;
    onPrevious: () => void;
}

export default function MusicPlayerContainer({ playlist, currentTrack, onNext, onPrevious }: MusicPlayerContainerProps) {
    const [songUrl, setSongUrl] = useState<string | null>(null);
    const [isLoadingTrack, setIsLoadingTrack] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let activeUrl: string | null = null;
        let isCancelled = false;

        if (!currentTrack) {
            setSongUrl(null);
            setIsLoadingTrack(false);
            setLoadError(null);
            return;
        }

        const loadSong = async () => {
            setIsLoadingTrack(true);
            setLoadError(null);

            try {
                let newSong = await db.songs
                    .filter(song => song.title === currentTrack.title && song.artist === currentTrack.artist)
                    .first();

                if (!newSong) {
                    console.log("Song not found in IndexedDB, downloading:", currentTrack.title);
                    const queryParams = new URLSearchParams({
                        id: currentTrack.id,
                        title: currentTrack.title,
                        artist: currentTrack.artist,
                    });

                    const blob = await apiDownload(`/api/download?${queryParams.toString()}`);
                    await storeSong(blob, currentTrack.title, currentTrack.artist, "Unknown Album");

                    newSong = await db.songs
                        .filter(song => song.title === currentTrack.title && song.artist === currentTrack.artist)
                        .first();
                }

                if (!newSong) {
                    throw new Error("Downloaded track could not be found in local storage.");
                }

                if (isCancelled) {
                    return;
                }

                const url = window.URL.createObjectURL(newSong.blob);
                activeUrl = url;
                setSongUrl(url);
                console.log("Loaded song from IndexedDB:", currentTrack.title);
            }
            catch (e) {
                console.error("Failed to load song from IndexedDB", e);
                if (!isCancelled) {
                    setLoadError("Failed to load/download this track.");
                }
                setSongUrl(null);
            }
            finally {
                if (!isCancelled) {
                    setIsLoadingTrack(false);
                }
            }
        };

        loadSong();

        return () => {
            isCancelled = true;
            if (activeUrl) {
                window.URL.revokeObjectURL(activeUrl);
            }
        };
    }, [currentTrack]);

    const canNavigate = !!playlist && playlist.tracks.length > 1;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="truncate text-sm text-muted-foreground">
                        {playlist ? `Playlist: ${playlist.name}` : "No playlist playing"}
                    </p>
                    <p className="truncate text-base font-semibold">
                        {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : "Select a track from a playlist"}
                    </p>
                    {isLoadingTrack && currentTrack && (
                        <p className="text-xs text-muted-foreground">Preparing track... downloading if needed.</p>
                    )}
                    {loadError && (
                        <p className="text-xs text-destructive">{loadError}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onPrevious}
                        disabled={!canNavigate}
                        title="Previous track"
                    >
                        <SkipBack className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onNext}
                        disabled={!canNavigate}
                        title="Next track"
                    >
                        <SkipForward className="size-4" />
                    </Button>
                </div>
            </div>

            <audio
                src={songUrl ?? undefined}
                controls
                onEnded={onNext}
                aria-busy={isLoadingTrack}
                className="w-full"
            >
            </audio>
        </div>
    );
}