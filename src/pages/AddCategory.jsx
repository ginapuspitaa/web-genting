import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddCategory() {
  const [isOpen, setIsOpen] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menambahkan kategori");
      }
      navigate("/category");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} />

      <div className="flex-1 flex flex-col">
        <Topbar toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow border">
            
            {/* HEADER */}
            <div className="bg-rose-200 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Plus size={20} />
                Tambah Kategori Baru
              </h1>
              <button 
                onClick={() => navigate("/category")}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={submitAdd} className="space-y-4 max-w-2xl">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInput}
                    placeholder="Masukkan nama kategori"
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Deskripsi (Opsional)</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    placeholder="Masukkan deskripsi untuk kategori ini..."
                    rows={4}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* FORM ACTIONS */}
                <div className="flex gap-3 pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => navigate("/category")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 flex items-center gap-2 cursor-pointer"
                  >
                    <Plus size={16} />
                    Simpan Kategori
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
