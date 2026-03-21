export function InfoDisplay({ song_title, artist, image_url }: { song_title: string; artist: string; image_url: string }) {
    return (
        <div className="flex items-center gap-4">
            <img src={image_url} alt={`${song_title} cover`} className="w-16 h-16 object-cover rounded" />
            <div>
                <h2 className="text-lg font-semibold">{song_title}</h2>
                <p className="text-sm text-gray-600">{artist}</p>
            </div>
        </div>
    );
}