import PlaylistItem from "./PlaylistItem";
import PlaylistView from "./Playlist";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { setSelectedPlaylist, createPlaylist, renamePlaylist, deletePlaylist } from "../../store/playlistSlice";
import { Plus, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Library() {
    const dispatch = useDispatch<AppDispatch>();
    const playlists = useSelector((state: RootState) => state.playlist.playlists);
    const selectedPlaylist = useSelector((state: RootState) => state.playlist.selectedPlaylist);

    function handlePlaylistClick(playlistId: string) {
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist) {
            dispatch(setSelectedPlaylist(playlist));
        }
    }

    function addNewPlaylist() {
        const name = window.prompt("Enter new playlist name:");
        if (name && name.trim() !== "") {
            dispatch(createPlaylist({
                id: "",
                name: name.trim(),
                tracks: [],
            })).unwrap().catch((err: any) => {
                alert(err.message || "Failed to create playlist");
            });
        }
    }

    function handleRename(id: string, currentName: string) {
        const newName = window.prompt("Enter new name for playlist:", currentName);
        if (newName && newName.trim() !== "" && newName !== currentName) {
            dispatch(renamePlaylist({ id, name: newName.trim() }));
        }
    }

    function handleDelete(id: string) {
        if (window.confirm("Are you sure you want to delete this playlist?")) {
            dispatch(deletePlaylist(id));
        }
    }

    if (selectedPlaylist) {
        return (
            <section className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => dispatch(setSelectedPlaylist(null))}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ChevronLeft className="size-5" />
                        </Button>
                        <h2 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                            {selectedPlaylist.name}
                        </h2>
                    </div>
                </div>
                <PlaylistView />
            </section>
        );
    }

    return (
        <section className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur sm:p-6">
            <div className="mb-6 flex items-center justify-between px-1">
                <h2 className="text-2xl font-bold tracking-tight">
                    Your Library
                </h2>
                <Button
                    onClick={addNewPlaylist}
                    title="Create Playlist"
                    variant="outline"
                    size="sm"
                >
                    <Plus className="size-4" />
                    New Playlist
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                {playlists.map((playlist) => (
                    <PlaylistItem
                        key={playlist.id}
                        name={playlist.name}
                        isDefault={playlist.id === "liked-songs"}
                        imageUrl={playlist.tracks.length > 0 ? playlist.tracks[0].image : undefined}
                        onClick={() => handlePlaylistClick(playlist.id)}
                        onRename={() => handleRename(playlist.id, playlist.name)}
                        onDelete={() => handleDelete(playlist.id)}
                    />
                ))}
            </div>
        </section>
    );
}