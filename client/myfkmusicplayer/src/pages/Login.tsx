function Login() {
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
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 mb-4 border rounded"
                />

                <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    Login
                </button>

            </div>
        </div>
    )
}

export default Login
