
import SearchItem from './SearchItem';
import type { RootState } from '../../store/store';
import { useSelector } from 'react-redux';
import { Music } from 'lucide-react';

export default function SearchDropdown() {
    const tracks = useSelector((state: RootState) => state.search.tracks);

    return (
        <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-border/70 bg-popover/95 shadow-xl backdrop-blur-md custom-scrollbar">
            {tracks.length > 0 ? (
                tracks.map((track) => (
                    <SearchItem key={track.id} id={track.id.toString()} title={track.title} artist={track.artist} imageUrl={track.image} />
                ))
            ) : (
                <div className="flex items-center gap-3 px-4 py-5 text-sm text-muted-foreground">
                    <Music className="size-4" />
                    No results yet. Try another query.
                </div>
            )}
        </div>
    );
}