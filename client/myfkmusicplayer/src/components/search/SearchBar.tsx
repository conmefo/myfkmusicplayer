import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearSearch, setSearchQuery, setTypingFinished, setDropdownTracks } from "../../store/searchSlice";
import { apiFetch } from "../../services/api";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppDispatch } from "@/store/store";

export default function SearchBar() {
    const dispatch = useDispatch<AppDispatch>();
    const [value, setValue] = useState("");

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

    return (
        <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search for songs or artists..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
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
    );
}