import { refreshToken } from "./authService";

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<any> {
    const res = await fetch(`/api${endpoint}`, {
        ...options,
        credentials: "include",
    });

    if (res.status != 401) return res.json();

    if (await refreshToken()) {
        const retryRes = await fetch(`/api${endpoint}`, {
            ...options,
            credentials: "include",
        });
        return retryRes.json();
    }

    return res.json();
}

export async function apiDownload(
    endpoint: string,
): Promise<Blob> {
    let res = await fetch(`/api${endpoint}`, {
        credentials: "include",
    });

    if (res.status === 401) {
        if (await refreshToken()) {
            res = await fetch(`/api${endpoint}`, {
                credentials: "include",
            });
        }
    }

    if (!res.ok) {
        throw new Error('Download failed');
    }

    return res.blob();
}
