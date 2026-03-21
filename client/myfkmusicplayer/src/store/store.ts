import { configureStore } from "@reduxjs/toolkit";
import { searchSlice } from "./searchSlice";
import { playlistSlice } from "./playlistSlice";

export const store = configureStore({
    reducer: {
        search: searchSlice.reducer,
        playlist: playlistSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;