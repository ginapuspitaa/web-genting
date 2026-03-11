import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddUser() {
  const navigate = useNavigate();

  // Role Protection
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        navigate("/");
        return;
      }
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== "admin") {
        navigate("/dashboard");
      }
    } catch (e) {
      navigate("/");
    }
  }, [navigate]);

  const [isOpen, setIsOpen] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "petugas" });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menambahkan user");
      }
      navigate("/user");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} />

      <div className="flex-1 flex flex-col relative">
        <Topbar toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow border">
              
              {/* HEADER */}
              <div className="bg-rose-200 px-6 py-4 rounded-t-xl flex justify-between items-center">
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <Plus size={20} />
                  Tambah User Baru
                </h1>
                <button 
                  onClick={() => navigate("/user")}
                  className="text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={submitAdd} className="space-y-4 max-w-2xl">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleInput}
                      placeholder="Masukkan nama"
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleInput}
                      placeholder="Masukkan email"
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleInput}
                      placeholder="Masukkan password"
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Akun (Role)</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleInput}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="petugas">Petugas Biasa</option>
                      <option value="admin">Admin Utama</option>
                    </select>
                  </div>

                  {/* FORM ACTIONS */}
                  <div className="flex gap-3 pt-4 border-t border-black mt-6">
                    <button
                      type="button"
                      onClick={() => navigate("/user")}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-rose-500 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus size={16} />
                      Simpan User
                    </button>
                  </div>

                </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
