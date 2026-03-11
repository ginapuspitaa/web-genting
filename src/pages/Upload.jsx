import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Upload as UploadIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const [isOpen, setIsOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: "",
    petugas: "",
    upload_date: "",
  });

  useEffect(() => {
    fetchCategories();

    // Read logged-in user
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
        if (parsed.role !== 'admin') {
          // Non-admin: auto-fill petugas with own name
          setForm(prev => ({ ...prev, petugas: parsed.name }));
        } else {
          // Admin: fetch user list for dropdown
          fetchUsers();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const submitDocument = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      if (form.category_id) formData.append("category_id", form.category_id);
      formData.append("petugas", form.petugas);
      if (form.upload_date) formData.append("upload_date", form.upload_date);
      
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch('http://localhost:5000/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create document');
      }
      
      // Jika sukses, kembalikan ke halaman Dokumen
      navigate("/document");
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan dokumen: ' + err.message);
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
                <UploadIcon size={20} />
                Upload Dokumen Baru
              </h1>
              <button 
                onClick={() => navigate("/document")}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={submitDocument} className="space-y-4 max-w-2xl">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dokumen</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInput}
                    placeholder="Masukkan nama dokumen"
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleInput}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Petugas Uploader</label>
                  {currentUser && currentUser.role === 'admin' ? (
                    <select
                      name="petugas"
                      value={form.petugas}
                      onChange={handleInput}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="">-- Pilih Petugas --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.petugas}
                      readOnly
                      className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Upload</label>
                  <input
                    name="upload_date"
                    type="date"
                    value={form.upload_date}
                    onChange={handleInput}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Dokumen</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format yang didukung: PDF, DOCX, JPG, dsb.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Deskripsi</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    placeholder="Tambahkan keterangan opsional..."
                    rows={4}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* FORM ACTIONS */}
                <div className="flex gap-3 pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => navigate("/document")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 flex items-center gap-2 cursor-pointer"
                  >
                    <UploadIcon size={16} />
                    Simpan Dokumen
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
