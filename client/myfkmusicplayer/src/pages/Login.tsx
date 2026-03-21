import { useState } from "react";
import { apiFetch } from "../services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    async function submitForm() {
        apiFetch("/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
            .then((data) => {
                if (data.id && data.email) {
                    window.location.href = "/";
                } else {
                    alert("Login failed: " + data.error);
                }
            })
            .catch((error) => {
                console.error("Error during login:", error);
                alert("An error occurred");
            });
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/70 p-6 shadow-xl backdrop-blur sm:p-8">
                <div className="mb-6 flex items-center justify-center gap-2">
                    <Music2 className="size-5 text-primary" />
                    <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                </div>

                <div className="space-y-3">
                    <Input
                        placeholder="Email"
                        value={email}
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                submitForm();
                            }
                        }}
                    />

                    <Button className="mt-2 w-full" onClick={submitForm}>
                        Sign in
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Login
