import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Plus, Edit, Trash, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Category() {
  const [isOpen, setIsOpen] = useState(true);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  const [form, setForm] = useState({ name: "", description: "" });
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/categories");
      if (!response.ok) {
        throw new Error("Gagal mengambil data dari server");
      }
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const openAddModal = () => {
    setForm({ name: "", description: "" });
    setAddModalOpen(true);
  };

  const openEditModal = (cat) => {
    setSelectedCat(cat);
    setForm({ name: cat.name || "", description: cat.description || "" });
    setEditModalOpen(true);
  };

  const openDeleteModal = (cat) => {
    setSelectedCat(cat);
    setDeleteModalOpen(true);
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
      setAddModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${selectedCat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengupdate kategori");
      }
      setEditModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${selectedCat.id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus kategori");
      }
      setDeleteModalOpen(false);
      fetchCategories();
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
              <h1 className="text-lg font-semibold">Kategori</h1>
            </div>

            <div className="p-6 space-y-4">

              {/* BUTTON TAMBAH */}
              <button
                onClick={() => navigate("/add-category")}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm cursor-pointer"
              >
                <Plus size={16} />
                Tambah Kategori
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
                    placeholder="Cari kategori..."
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
                      <th className="p-3">Nama Kategori</th>
                      <th className="p-3">Keterangan</th>
                      <th className="p-3 text-center w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan="4" className="p-4 text-center">Loading data...</td>
                      </tr>
                    )}
                    {error && (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-red-500">Error: {error}</td>
                      </tr>
                    )}
                    {!loading && !error && data.filter(item => 
                        (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.description || "").toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-500">Tidak ada data yang cocok.</td>
                      </tr>
                    )}
                    {!loading && !error && data
                      .filter(item => 
                        (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.description || "").toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item, index) => (
                      <tr
                        key={item.id}
                        className="bg-rose-300 even:bg-rose-200"
                      >
                        <td className="p-3">{index + 1}.</td>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.description || '-'}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="bg-green-500 hover:bg-green-600 p-1 rounded text-white cursor-pointer"
                              title="Edit Kategori"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(item)}
                              className="bg-red-600 hover:bg-red-700 p-1 rounded text-white cursor-pointer"
                              title="Hapus Kategori"
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

        {/* ADD MODAL */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
              <button
                onClick={() => setAddModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                <Plus size={20} /> Tambah Kategori
              </h2>

              <form onSubmit={submitAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInput}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    rows={3}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editModalOpen && selectedCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
              <button
                onClick={() => setEditModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                <Edit size={20} /> Edit Kategori
              </h2>

              <form onSubmit={submitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInput}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    rows={3}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
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
        {deleteModalOpen && selectedCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-center text-sm">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Hapus Kategori?</h3>
              <p className="text-gray-500 mb-6">
                Anda yakin ingin menghapus kategori <strong>"{selectedCat.name}"</strong>? Data ini tidak dapat dikembalikan.
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