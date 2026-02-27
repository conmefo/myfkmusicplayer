import { refreshToken } from "./authService";

// export async function apiFetch(
//     endpoint: string,
//     options: RequestInit = {}
// ): Promise<any> {
//     const res = await fetch(`http://localhost:8080${endpoint}`, options);
//     return res.json();
// }

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<any> {
    const res = await fetch(`http://localhost:8080${endpoint}`, {
        ...options,
        credentials: "include",
    });

    if (res.status != 401) return res.json();

    if (await refreshToken()) {
        const retryRes = await fetch(`http://localhost:8080${endpoint}`, {
            ...options,
            credentials: "include",
        });
        return retryRes.json();
    }

    return res.json();
}