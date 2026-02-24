import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Email dan Password wajib diisi!");
      return;
    }

    if (email === "admin@gmail.com" && password === "123456") {
      setMessage("Login berhasil!");

      setTimeout(() => {
            navigate("/dashboard");
        }, 1000);
    } else {
      setMessage("Email atau Password salah!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 px-4">

      <div className="bg-white/95 backdrop-blur-sm p-10 rounded-3xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm">
            Please login to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">

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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Forgot Password di bawah input */}
            <div className="flex justify-end mt-2">
              <span className="text-xs text-indigo-600 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
          </div>

          {/* MESSAGE */}
          {message && (
            <p className="text-sm text-center text-red-500">{message}</p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 
                       text-white py-3 rounded-xl font-medium 
                       transition duration-200 shadow-md hover:shadow-lg"
          >
            Login
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}