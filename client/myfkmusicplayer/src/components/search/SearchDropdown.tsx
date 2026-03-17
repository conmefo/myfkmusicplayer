
import SearchItem from './SearchItem';
import type { RootState } from '../../store/store';
import { useSelector } from 'react-redux';

export default function SearchDropdown() {
    const tracks = useSelector((state: RootState) => state.search.tracks);

    return (
        <div className="absolute top-full w-full bg-white border rounded-lg shadow-lg mt-2 z-10">
            {tracks.map((track) => (
                <SearchItem key={track.id} id={track.id.toString()} title={track.title} artist={track.artist} imageUrl={track.image} />
            ))}
        </div>
    );
}