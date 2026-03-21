import { useState } from "react";
import { login, register } from "../services/authService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";

function Login() {
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function submitForm() {
        const normalizedEmail = email.trim();

        if (!normalizedEmail || !password) {
            alert("Please enter email and password.");
            return;
        }

        if (isRegisterMode && password !== confirmPassword) {
            alert("Password and confirm password do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            if (isRegisterMode) {
                const registerResponse = await register(normalizedEmail, password);
                if (!registerResponse.id) {
                    alert("Register failed: " + (registerResponse.error ?? "Unknown error"));
                    return;
                }

                const loginResponse = await login(normalizedEmail, password);
                if (loginResponse.id && loginResponse.email) {
                    window.location.href = "/";
                    return;
                }

                alert("Registered, but auto-login failed. Please sign in.");
                setIsRegisterMode(false);
                setPassword("");
                setConfirmPassword("");
                return;
            }

            const loginResponse = await login(normalizedEmail, password);
            if (loginResponse.id && loginResponse.email) {
                window.location.href = "/";
            } else {
                alert("Login failed: " + (loginResponse.error ?? "Unknown error"));
            }
        } catch (error) {
            console.error("Error during auth:", error);
            alert("An error occurred during authentication.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/70 p-6 shadow-xl backdrop-blur sm:p-8">
                <div className="mb-6 flex items-center justify-center gap-2">
                    <Music2 className="size-5 text-primary" />
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {isRegisterMode ? "Create your account" : "Welcome back"}
                    </h1>
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
                        placeholder={isRegisterMode ? "Create password" : "Password"}
                        autoComplete={isRegisterMode ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                submitForm();
                            }
                        }}
                    />

                    {isRegisterMode && (
                        <Input
                            type="password"
                            placeholder="Confirm password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    submitForm();
                                }
                            }}
                        />
                    )}

                    <Button className="mt-2 w-full" onClick={submitForm} disabled={isSubmitting}>
                        {isSubmitting
                            ? (isRegisterMode ? "Creating account..." : "Signing in...")
                            : (isRegisterMode ? "Create account" : "Sign in")}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                            setIsRegisterMode(prev => !prev);
                            setPassword("");
                            setConfirmPassword("");
                        }}
                    >
                        {isRegisterMode ? "Already have an account? Sign in" : "Don’t have an account? Register"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Login
