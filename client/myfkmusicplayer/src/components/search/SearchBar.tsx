import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearSearch, setSearchQuery, setTypingFinished } from "../../store/searchSlice";
import { apiFetch } from "../../services/api";

export default function SearchBar() {
    const dispatch = useDispatch();
    const [value, setValue] = useState("");

    useEffect(() => {
        if (value.trim() === "") {
            dispatch(clearSearch());
            return;
        }

        const debounce = setTimeout(() => {
            dispatch(setSearchQuery(value));
            dispatch(setTypingFinished());
            // apiFetch(`/search?q=${encodeURIComponent(value)}`).then(response => {
            //     console.log(response);
            // });
        }, 1000);

        return () => clearTimeout(debounce);
    }, [value]);

    return (
        <div className="w-full mt-5">
            <input
                type="text"
                placeholder="Search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}