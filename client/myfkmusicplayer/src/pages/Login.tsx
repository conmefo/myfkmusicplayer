import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    function submitForm() {
        console.log("Form submitted");
        fetch("http://localhost:8080/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.id && data.email) {
                    alert("Login successful!");
                } else {
                    alert("Login failed: " + data.error);
                }
            })
            .catch((error) => {
                console.error("Error during login:", error);
                alert("An error occurred. Please try again.");
            });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Login
                </h1>

                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-2 mb-3 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 mb-4 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    onClick={submitForm}>
                    Login
                </button>

            </div>
        </div>
    )
}

export default Login
