import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSearch, closeDropdown, openDropdown, setAutoDownloadOnAdd, setSearchQuery, setTypingFinished, setDropdownTracks } from "../../store/searchSlice";
import { apiFetch } from "../../services/api";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppDispatch, RootState } from "@/store/store";
import SearchDropdown from "./SearchDropdown";

export default function SearchBar() {
    const dispatch = useDispatch<AppDispatch>();
    const [value, setValue] = useState("");
    const { showDropdown, autoDownloadOnAdd } = useSelector((state: RootState) => state.search);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (value.trim() === "") {
            dispatch(clearSearch());
            return;
        }

        const debounce = setTimeout(() => {
            dispatch(setSearchQuery(value));
            dispatch(setTypingFinished());
            apiFetch(`/api/search?q=${encodeURIComponent(value)}`).then(response => {
                console.log("Search response:", response);
                dispatch(setDropdownTracks(response));
            });
        }, 500);

        return () => clearTimeout(debounce);
    }, [dispatch, value]);

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                dispatch(closeDropdown());
            }
        }

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [dispatch]);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search for songs or artists..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => {
                        if (value.trim() !== "") {
                            dispatch(openDropdown());
                        }
                    }}
                    className="h-11 rounded-xl border-border/70 bg-background/80 pl-10 pr-11"
                />

                {value.length > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2"
                        onClick={() => setValue("")}
                        title="Clear search"
                    >
                        <X className="size-4" />
                    </Button>
                )}
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <input
                    type="checkbox"
                    checked={autoDownloadOnAdd}
                    onChange={(e) => dispatch(setAutoDownloadOnAdd(e.target.checked))}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Auto-download songs when adding to a playlist
            </label>

            {showDropdown && <SearchDropdown />}
        </div>
    );
}
