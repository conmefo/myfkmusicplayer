import SearchItem from './SearchItem';

const tracks = [
    {
        title: "Castle on the Hill",
        artist: "Ed Sheeran",
        imageUrl: "https://e-cdns-images.dzcdn.net/images/cover/000a9228cecfcc7c2093d9cd7bb66447/250x250-000000-80-0-0.jpg"
    },
    {
        title: "Shape of You",
        artist: "Ed Sheeran",
        imageUrl: "https://e-cdns-images.dzcdn.net/images/cover/000a9228cecfcc7c2093d9cd7bb66447/250x250-000000-80-0-0.jpg"
    },
];
export default function SearchDropdown() {
    return (
        <div className="absolute top-full w-full bg-white border rounded-lg shadow-lg mt-2 z-10">
            {tracks.map((track) => (
                <SearchItem title={track.title} artist={track.artist} imageUrl={track.imageUrl} />
            ))}
        </div>
    );
}