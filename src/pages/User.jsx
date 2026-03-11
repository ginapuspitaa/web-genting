import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Plus, Edit, Trash, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function User() {
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

  // Sidebar
  const [isOpen, setIsOpen] = useState(true);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "petugas" });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/users");
      if (!response.ok) {
        throw new Error("Gagal mengambil data dari server");
      }
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "", // Jangan tampilkan password lama
      role: user.role || "petugas",
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.password) {
        delete payload.password; // Don't send empty password if not changing
      }
      const res = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengupdate user");
      }
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus user");
      }
      setDeleteModalOpen(false);
      fetchUsers();
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
            <div className="bg-rose-200 px-6 py-4 rounded-t-xl">
              <h1 className="text-lg font-semibold">User</h1>
            </div>

            <div className="p-6 space-y-4">

              {/* BUTTON TAMBAH */}
              <button 
                onClick={() => navigate("/add-user")}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm cursor-pointer"
              >
                <Plus size={16} />
                Tambah User
              </button>

              {/* TABLE CONTROL */}
              <div className="flex justify-between items-center text-sm">
                <div>
                  Show
                  <select className="mx-2 border rounded px-2 py-1">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  entries
                </div>

                <div>
                  Search:
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari user..."
                    className="ml-2 border rounded px-2 py-1"
                  />
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-red-900 text-white text-left">
                      <th className="p-3">No.</th>
                      <th className="p-3 text-center">Foto</th>
                      <th className="p-3">Nama</th>
                      <th className="p-3">Email</th>
                      <th className="p-3 text-center">Role</th>
                      <th className="p-3 text-center w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan="5" className="p-4 text-center">Loading data...</td>
                      </tr>
                    )}
                    {error && (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-red-500">Error: {error}</td>
                      </tr>
                    )}
                    {!loading && !error && data.filter(item => 
                        (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.role || "").toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-500">Tidak ada data yang cocok.</td>
                      </tr>
                    )}
                    {!loading && !error && data
                      .filter(item => 
                        (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.role || "").toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item, index) => (
                      <tr
                        key={item.id}
                        className="bg-rose-300 even:bg-rose-200"
                      >
                        <td className="p-3">{index + 1}.</td>

                        {/* FOTO */}
                        <td className="p-3">
                          <div className="w-10 h-10 mx-auto rounded-full bg-white flex items-center justify-center text-black text-lg">
                            {/* Ganti emoji dengan teks/inisial atau avatar lain jika mau */}
                            👤
                          </div>
                        </td>

                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.email}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {item.role === 'admin' ? 'Admin Utama' : 'Petugas Biasa'}
                          </span>
                        </td>

                        {/* AKSI */}
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => openEditModal(item)}
                              className="bg-green-500 hover:bg-green-600 p-1 rounded text-white cursor-pointer"
                              title="Edit User"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(item)}
                              className="bg-red-600 hover:bg-red-700 p-1 rounded text-white cursor-pointer"
                              title="Hapus User"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </main>

        {/* EDIT MODAL */}
        {editModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative transform scale-100 transition-all border border-gray-100">
              <button 
                onClick={() => setEditModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                <Edit size={20} /> Edit User
              </h2>
              
              <form onSubmit={submitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInput}
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
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru (Opsional)</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleInput}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah password.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Jabatan</label>
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
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {deleteModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center text-sm transform scale-100 transition-all border border-red-50">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Hapus User?</h3>
              <p className="text-gray-500 mb-6">
                Anda yakin ingin menghapus akun <strong>"{selectedUser.name}"</strong>? Aksi ini akan menghapus akun tersebut dari sistem.
              </p>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}