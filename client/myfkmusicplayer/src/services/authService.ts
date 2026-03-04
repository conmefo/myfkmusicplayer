export async function refreshToken(): Promise<boolean> {
    const res = await fetch("http://localhost:8080/users/refresh", {
        method: "POST",
        credentials: "include"
    });

    return res.ok;
}
