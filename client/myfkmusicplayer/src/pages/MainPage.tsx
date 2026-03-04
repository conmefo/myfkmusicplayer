import { use, useEffect } from "react";
import SearchBar from "../components/search/SearchBar";
import SearchDropdown from "../components/search/SearchDropdown";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { refreshToken } from "../services/authService";

export default function MainPage() {
    const showDropdown = useSelector((state: RootState) => state.search.showDropdown);

    useEffect(() => {
        refreshToken().then(success => {
            if (!success) {
                console.error("Failed to refresh token");
                window.location.href = "/login";
            }
        });
    }, []);

    return (
        <div className="min-h-screen flex items-start bg-gray-100">
            <div className="w-full max-w-2xl mx-auto relative">
                <SearchBar />
                {showDropdown && <SearchDropdown />}
            </div>
        </div>
    )
}

