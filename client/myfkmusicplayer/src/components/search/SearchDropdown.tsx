import SearchItem from './SearchItem';

export default function SearchDropdown() {
    return (
        <div className="absolute top-full w-full bg-white border rounded-lg shadow-lg mt-2 z-10">
            <SearchItem title="Castle on the Hill" artist="Ed Sheeran" imageUrl="https://e-cdns-images.dzcdn.net/images/cover/000a9228cecfcc7c2093d9cd7bb66447/250x250-000000-80-0-0.jpg" />
        </div>
    );
}