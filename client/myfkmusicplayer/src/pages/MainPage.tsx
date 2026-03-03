import SearchBar from "../components/search/SearchBar";
import SearchDropdown from "../components/search/SearchDropdown";

export default function MainPage() {
    return (
        <div className="min-h-screen flex items-start bg-gray-100">
            <div className="w-full max-w-2xl mx-auto relative">
                <SearchBar />
                <SearchDropdown />
            </div>
        </div>
    )
}