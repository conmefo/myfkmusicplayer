import { useEffect, useState } from "react";

export default function SearchBar() {
    const [query, setQuery] = useState("");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query) {
                console.log("Searching for:", query);
            }
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="w-full max-w-md mx-auto mt-5">
            <input
                type="text"
                placeholder="Search"
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}