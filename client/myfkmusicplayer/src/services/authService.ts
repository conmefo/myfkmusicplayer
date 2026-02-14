export async function refreshToken(): Promise<boolean> {
    const res = await fetch("/auth/refresh", {
        method: "POST",
        credentials: "include"
    });

    return res.ok;
}
