import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface track {
    id: number;
    title: string;
    artist: string;
    image: string;
}

export interface SearchState {
    query: string;
    isTyping: boolean;
    showDropdown: boolean;
    tracks: track[];
}

const initialState: SearchState = {
    query: "",
    isTyping: false,
    showDropdown: false,
    tracks: [],
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
        clearSearch(state: SearchState) {
            state.query = "";
            state.isTyping = false;
            state.showDropdown = false;
            state.tracks = [];
        },
        setDropdownTracks(state: SearchState, action: PayloadAction<track[]>) {
            console.log("Setting dropdown tracks:", action.payload);
            state.tracks = action.payload;
        }
    }
});

export const { setSearchQuery, setTypingFinished, clearSearch, setDropdownTracks } = searchSlice.actions;

export default searchSlice.reducer;