import Dexie, { type Table } from "dexie";

export interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
    blob: Blob;
}

export class MusicPlayerDB extends Dexie {
    songs!: Table<Song>;
    constructor() {
        super("MusicPlayer");
        this.version(1).stores({
            songs: "++id, title, artist, url",
        });
    }
}

export const db = new MusicPlayerDB();