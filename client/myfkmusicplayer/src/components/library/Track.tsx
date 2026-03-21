import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { removeTrackFromPlaylistApi } from '../../store/playlistSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { Button } from '@/components/ui/button';

export default function Track({ id, title, artist, imageUrl }: { id: string; title: string; artist: string, imageUrl?: string }) {
    const dispatch = useDispatch<AppDispatch>();
    const selectedPlaylist = useSelector((state: RootState) => state.playlist.selectedPlaylist);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const handleRemoveFromPlaylist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedPlaylist) {
            dispatch(removeTrackFromPlaylistApi({
                playlistId: selectedPlaylist.id,
                trackId: id
            }));
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex w-full items-center rounded-xl border border-transparent p-2 transition-colors ${isDragging ? "bg-accent/70 shadow-md opacity-90" : "hover:bg-accent/35"}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab p-2 text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
                title="Drag to reorder"
            >
                <GripVertical size={20} />
            </div>

            <div className="flex w-full items-center">
                {imageUrl ? (
                    <img src={imageUrl} alt={`${title} cover`} className="w-12 h-12 rounded-md flex-shrink-0 object-cover" />
                ) : (
                    <div className="h-12 w-12 flex-shrink-0 rounded-md bg-muted" />
                )}
                <div className="ml-4 flex min-w-0 flex-grow flex-col justify-center">
                    <p className="truncate text-base font-semibold text-foreground">
                        {title}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{artist}</p>
                </div>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        onClick={handleRemoveFromPlaylist}
                        title="Remove from playlist"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
