interface AuthResponse {
    id?: string | number;
    email?: string;
    error?: string;
}

async function parseAuthResponse(res: Response): Promise<AuthResponse> {
    try {
        return await res.json();
    } catch {
        return { error: "Invalid server response" };
    }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });

    return parseAuthResponse(res);
}

export async function register(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch("http://localhost:8080/users/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });

    return parseAuthResponse(res);
}

export async function logout(): Promise<boolean> {
    const res = await fetch("http://localhost:8080/users/logout", {
        method: "POST",
        credentials: "include",
    });

    return res.ok;
}

export async function refreshToken(): Promise<boolean> {
    const res = await fetch("http://localhost:8080/users/refresh", {
        method: "POST",
        credentials: "include"
    });

    return res.ok;
}
