import { useEffect, useMemo, useRef, useState } from 'react';
import { apiDownload } from '../../services/api';
import { storeSong } from '../../services/db';
import { useDispatch, useSelector } from 'react-redux';
import { addTrackToPlaylistApi } from '../../store/playlistSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { Check, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SearchItem({ id, title, artist, imageUrl }: { id: string; title: string; artist: string, imageUrl?: string }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPlaylistMenuOpen, setIsPlaylistMenuOpen] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const playlists = useSelector((state: RootState) => state.playlist.playlists);
    const selectedPlaylist = useSelector((state: RootState) => state.playlist.selectedPlaylist);
    const autoDownloadOnAdd = useSelector((state: RootState) => state.search.autoDownloadOnAdd);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const playlistsContainingTrack = useMemo(() => (
        playlists.filter((playlist) => playlist.tracks.some((track) => track.id === id))
    ), [id, playlists]);

    useEffect(() => {
        if (!isPlaylistMenuOpen) {
            return;
        }

        function handlePointerDown(event: MouseEvent) {
            if (!menuRef.current?.contains(event.target as Node)) {
                setIsPlaylistMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [isPlaylistMenuOpen]);

    useEffect(() => {
        if (!feedback) {
            return;
        }

        const timeout = window.setTimeout(() => setFeedback(null), 2200);
        return () => window.clearTimeout(timeout);
    }, [feedback]);

    const downloadSong = async (saveToDevice: boolean) => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const queryParams = new URLSearchParams({ id, title, artist });
            const blob = await apiDownload(`/api/download?${queryParams.toString()}`);
            if (saveToDevice) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title} - ${artist}.mp3`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            }
            await storeSong(blob, title, artist, "Unknown Album");
        } catch (e) {
            console.error("Failed to download", e);
            throw e;
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await downloadSong(true);
        } catch {
            setFeedback("Could not download this song");
        }
    };

    const handleAddButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFeedback(null);
        setIsPlaylistMenuOpen((current) => !current);
    };

    const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
        try {
            await dispatch(addTrackToPlaylistApi({
                playlistId,
                track: { id, title, artist, image: imageUrl || "" }
            })).unwrap();

            if (!autoDownloadOnAdd) {
                setFeedback(`Added to ${playlistName}`);
                setIsPlaylistMenuOpen(false);
                return;
            }

            try {
                await downloadSong(false);
                setFeedback(`Added to ${playlistName} and downloaded`);
            } catch {
                setFeedback(`Added to ${playlistName}, but download failed`);
            }

            setIsPlaylistMenuOpen(false);
        } catch (error) {
            console.error("Failed to add track to playlist", error);
            setFeedback("Could not add this song");
        }
    };

    return (
        <div
            className="group flex w-full cursor-default items-center border-b border-border/50 p-3 transition-colors hover:bg-accent/40"
        >
            <div className="flex w-full items-center gap-3">
                {imageUrl ? (
                    <img src={imageUrl} alt={`${title} cover`} className="w-12 h-12 rounded-md flex-shrink-0 object-cover" />
                ) : (
                    <div className="h-12 w-12 flex-shrink-0 rounded-md bg-muted" />
                )}
                <div className="flex min-w-0 flex-grow flex-col justify-center">
                    <p className="truncate text-base font-semibold text-foreground">
                        {title}
                        {isDownloading && <span className="ml-2 animate-pulse text-sm font-normal text-primary">(Downloading...)</span>}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{artist}</p>
                    {playlistsContainingTrack.length > 0 && (
                        <p className="truncate text-xs text-muted-foreground">
                            In: {playlistsContainingTrack.map((playlist) => playlist.name).join(", ")}
                        </p>
                    )}
                    {feedback && (
                        <p className="text-xs text-primary">{feedback}</p>
                    )}
                </div>

                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <div ref={menuRef} className="relative">
                        <Button
                            onClick={handleAddButtonClick}
                            title={selectedPlaylist ? `Add to playlist (current: ${selectedPlaylist.name})` : "Add to playlist"}
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Plus className="size-4" />
                        </Button>

                        {isPlaylistMenuOpen && (
                            <div className="absolute right-0 top-full z-[80] mt-2 w-64 rounded-xl border border-border/70 bg-popover p-2 shadow-xl">
                                <div className="mb-2 px-2 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Add to playlist
                                </div>
                                {playlists.length > 0 ? (
                                    <div className="max-h-64 space-y-1 overflow-y-auto">
                                        {playlists.map((playlist) => {
                                            const alreadyAdded = playlist.tracks.some((track) => track.id === id);
                                            const isCurrentPlaylist = selectedPlaylist?.id === playlist.id;

                                            return (
                                                <button
                                                    key={playlist.id}
                                                    type="button"
                                                    disabled={alreadyAdded}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!alreadyAdded) {
                                                            handleAddToPlaylist(playlist.id, playlist.name);
                                                        }
                                                    }}
                                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <span className="truncate">
                                                        {playlist.name}
                                                        {isCurrentPlaylist ? " (current)" : ""}
                                                    </span>
                                                    {alreadyAdded ? (
                                                        <span className="flex items-center gap-1 text-xs text-primary">
                                                            <Check className="size-3.5" />
                                                            Added
                                                        </span>
                                                    ) : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="px-2 py-3 text-sm text-muted-foreground">
                                        Create a playlist first, then you can add songs here anytime.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={handleDownload}
                        title="Download"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Download className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
