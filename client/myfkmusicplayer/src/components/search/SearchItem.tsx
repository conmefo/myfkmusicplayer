import { useState } from 'react';
import { apiDownload } from '../../services/api';
import { storeSong } from '../../services/db';
import { useDispatch, useSelector } from 'react-redux';
import { addTrackToPlaylistApi } from '../../store/playlistSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SearchItem({ id, title, artist, imageUrl }: { id: string; title: string; artist: string, imageUrl?: string }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const selectedPlaylist = useSelector((state: RootState) => state.playlist.selectedPlaylist);

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const queryParams = new URLSearchParams({ id, title, artist });
            const blob = await apiDownload(`/api/download?${queryParams.toString()}`);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title} - ${artist}.mp3`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            await storeSong(blob, title, artist, "Unknown Album");
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Failed to download", e);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleAddToPlaylist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedPlaylist) {
            dispatch(addTrackToPlaylistApi({
                playlistId: selectedPlaylist.id,
                track: { id, title, artist, image: imageUrl || "" }
            }));
        } else {
            alert("Select a playlist first to add tracks.");
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
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {selectedPlaylist && (
                        <Button
                            onClick={handleAddToPlaylist}
                            title="Add to current playlist"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Plus className="size-4" />
                        </Button>
                    )}
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
