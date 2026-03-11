import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  
  // Forgot password states
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Email dan Password wajib diisi!");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Login berhasil!");
        // Optional: Save user data/token here (e.g., localStorage)
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        setMessage(data.error || "Email atau Password salah!");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setMessage("Terjadi kesalahan pada server. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email || !newPassword) {
      setMessage("Email dan Password Baru wajib diisi!");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Berhasil! " + data.message);
        setTimeout(() => {
          setIsForgotMode(false);
          setPassword("");
          setNewPassword("");
          setMessage(""); // clear success message before switching to login mode
        }, 2500);
      } else {
        setMessage(data.error || "Gagal mereset password!");
      }
    } catch (err) {
      console.error("Reset Password Error:", err);
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
            {isForgotMode ? "Reset Password" : "Welcome Back"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isForgotMode 
              ? "Masukkan email akun Anda dan password baru" 
              : "Please login to your account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={isForgotMode ? handleForgotPassword : handleLogin} className="space-y-6">

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
          {!isForgotMode ? (
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

              {/* Forgot Password Link */}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(true);
                    setMessage("");
                  }}
                  className="text-xs text-indigo-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  placeholder="Enter new password (min. 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 
                   focus:border-transparent transition duration-200"
                  minLength={6}
                />
              </div>
            </div>
          )}

          {/* MESSAGE */}
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
            {isLoading ? "Memproses..." : (isForgotMode ? "Reset Password" : "Login")}
          </button>
          
          {/* CANCEL BUTTON FOR FORGOT MODE */}
          {isForgotMode && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setIsForgotMode(false);
                setMessage("");
              }}
              className="w-full text-gray-600 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-medium transition duration-200 cursor-pointer"
            >
              Kembali ke Login
            </button>
          )}
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