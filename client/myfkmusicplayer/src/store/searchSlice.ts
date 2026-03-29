import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface track {
    id: string;
    title: string;
    artist: string;
    image: string;
}

export interface SearchState {
    query: string;
    isTyping: boolean;
    showDropdown: boolean;
    tracks: track[];
    autoDownloadOnAdd: boolean;
}

const getInitialAutoDownload = () => {
    if (typeof window === "undefined") {
        return false;
    }

    return window.localStorage.getItem("auto-download-on-add") === "true";
};

const initialState: SearchState = {
    query: "",
    isTyping: false,
    showDropdown: false,
    tracks: [],
    autoDownloadOnAdd: getInitialAutoDownload(),
};

export const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
        setSearchQuery(state: SearchState, action: PayloadAction<string>) {
            console.log("Setting search query:", action.payload);
            state.query = action.payload;
            state.isTyping = true;
        },
        setTypingFinished(state: SearchState) {
            state.isTyping = false;
            state.showDropdown = true;
        },
        openDropdown(state: SearchState) {
            if (state.query.trim() !== "") {
                state.showDropdown = true;
            }
        },
        closeDropdown(state: SearchState) {
            state.showDropdown = false;
        },
        clearSearch(state: SearchState) {
            state.query = "";
            state.isTyping = false;
            state.showDropdown = false;
            state.tracks = [];
        },
        setDropdownTracks(state: SearchState, action: PayloadAction<track[]>) {
            console.log("Setting dropdown tracks:", action.payload);
            state.tracks = action.payload;
        },
        setAutoDownloadOnAdd(state: SearchState, action: PayloadAction<boolean>) {
            state.autoDownloadOnAdd = action.payload;
            if (typeof window !== "undefined") {
                window.localStorage.setItem("auto-download-on-add", String(action.payload));
            }
        }
    }
});

export const { setSearchQuery, setTypingFinished, openDropdown, closeDropdown, clearSearch, setDropdownTracks, setAutoDownloadOnAdd } = searchSlice.actions;

export default searchSlice.reducer;
