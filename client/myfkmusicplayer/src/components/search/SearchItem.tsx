import { useState } from 'react';
import { apiDownload } from '../../services/api';

export default function SearchItem({ id, title, artist, imageUrl }: { id: string; title: string; artist: string, imageUrl?: string }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
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
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Failed to download", e);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div 
            className="w-full flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={handleDownload}
        >
            <div className="flex w-full">
                {imageUrl && <img src={imageUrl} alt={`${title} cover`} className="w-16 h-16 mt-2 rounded flex-shrink-0" />}
                <div className="ml-4 flex flex-col justify-center flex-grow">
                    <p className="text-lg font-semibold flex items-center gap-2">
                        {title}
                        {isDownloading && <span className="text-sm text-blue-500 font-normal animate-pulse">(Downloading...)</span>}
                    </p>
                    <p className="text-sm text-gray-600">{artist}</p>
                </div>
            </div>
        </div>
    );
}
