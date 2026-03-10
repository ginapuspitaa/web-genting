import { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            setMessage("Semua field wajib diisi!");
            return;
        }

        if (password.length < 6) {
            setMessage("Password minimal 6 karakter!");
            return;
        }

        try {
            setIsLoading(true);
            setMessage("");

            const response = await fetch("http://localhost:5000/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Akun berhasil dibuat! Mengalihkan ke halaman login...");
                
                setTimeout(() => {
                    navigate("/");
                }, 1500);
            } else {
                setMessage(data.error || "Gagal membuat akun.");
            }
        } catch (err) {
            console.error("Signup Error:", err);
            setMessage("Terjadi kesalahan pada server. Coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 px-4">

            <div className="bg-white/95 backdrop-blur-sm p-10 rounded-3xl shadow-2xl w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Create Account
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Sign up to get started
                    </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">

                    {/* NAME */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>

                        <div className="relative">
                            <User
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 
                           focus:border-transparent transition duration-200"
                            />
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>

                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 
                           focus:border-transparent transition duration-200"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>

                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 
                           focus:border-transparent transition duration-200"
                            />
                        </div>
                    </div>

                    {message && (
                        <p className="text-sm text-center text-red-500">{message}</p>
                    )}

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white py-3 rounded-xl font-medium transition duration-200 shadow-md hover:shadow-lg ${
                            isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                    >
                        {isLoading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    Already have an account?{" "}
                    <Link to="/" className="text-indigo-600 font-medium hover:underline cursor-pointer">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}