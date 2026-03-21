import Dexie, { type Table } from "dexie";

export interface Song {
    id: string;
    title: string;
    artist: string;
    blob: Blob;
}

export class MusicPlayerDB extends Dexie {
    songs!: Table<Song>;
    constructor() {
        super("MusicPlayer");
        this.version(1).stores({
            songs: "++id, title, artist",
        });
    }
}

export const storeSong = async (blob: Blob, title: string, artistName: string, albumName: string) => {
    try {
        await db.songs.add({
            id: crypto.randomUUID(),
            title: title,
            artist: artistName,
            blob: blob
        });
        console.log("Song added successfully!");
    } catch (error) {
        console.error("Failed to add song:", error);
    }
}

export const db = new MusicPlayerDB();