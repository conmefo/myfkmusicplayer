import ProgressBar from "./ProgressBar";

export default function MusicPlayerContainer({ progress }: { progress: number }) {
    const current_playing_track = {
        title: "Track Title",
        artist: "Artist Name",
        album: "Album Name",
        duration: 240,
        image: "https://via.placeholder.com/150",
    };

    return (
        <audio src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" controls autoPlay className="w-full">
        </audio>
        <ProgressBar progress={progress} />
    );
}