import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { reorderTracks, reorderTracksApi, setCurrentPlayingTrack } from "../../store/playlistSlice";
import Track from "./Track";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ListMusic } from 'lucide-react';

export default function PlaylistView() {
    const dispatch = useDispatch<AppDispatch>();
    const selectedPlaylist = useSelector((state: RootState) => state.playlist.selectedPlaylist);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    if (!selectedPlaylist) return null;

    const tracks = selectedPlaylist.tracks;

    function handleTrackPlay(trackId: string) {
        dispatch(setCurrentPlayingTrack({
            playlistId: selectedPlaylist.id,
            trackId,
        }));
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = tracks.findIndex(t => t.id === active.id);
            const newIndex = tracks.findIndex(t => t.id === over.id);

            // optimistic update
            dispatch(reorderTracks({
                playlistId: selectedPlaylist!.id,
                oldIndex,
                newIndex
            }));

            const newOrder = Array.from(tracks);
            const [moved] = newOrder.splice(oldIndex, 1);
            newOrder.splice(newIndex, 0, moved);

            dispatch(reorderTracksApi({
                playlistId: selectedPlaylist!.id,
                trackIds: newOrder.map(t => t.id)
            }));
        }
    }

    if (tracks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-10 text-muted-foreground">
                <ListMusic size={48} className="mb-4 opacity-30" />
                <p>This playlist is empty.</p>
                <p className="text-sm mt-2">Search for songs above and add them here!</p>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-1 pb-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={tracks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tracks.map((track) => (
                        <Track
                            key={track.id}
                            id={track.id.toString()}
                            title={track.title}
                            artist={track.artist}
                            imageUrl={track.image}
                            onPlay={handleTrackPlay}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}