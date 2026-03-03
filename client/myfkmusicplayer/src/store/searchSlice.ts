import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SearchState {
    query: string;
    isTyping: boolean;
    showDropdown: boolean;
}

const initialState: SearchState = {
    query: "",
    isTyping: false,
    showDropdown: false,
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
        }
    }
});

export const { setSearchQuery, setTypingFinished, clearSearch } = searchSlice.actions;

export default searchSlice.reducer;