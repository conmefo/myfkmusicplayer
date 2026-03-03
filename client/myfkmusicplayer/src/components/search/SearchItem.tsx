export default function SearchItem({ title, artist, imageUrl }: { title: string; artist: string, imageUrl?: string }) {
    return (
        <div className="w-full flex items-center p-4 border-b">
            <div className="flex">
                {imageUrl && <img src={imageUrl} alt={`${title} cover`} className="w-16 h-16 mt-2 rounded" />}
                <div className="ml-4">
                    <p className="text-lg font-semibold">{title}</p>
                    <p className="text-sm text-gray-600">{artist}</p>
                </div>
            </div>
        </div>
    );
}