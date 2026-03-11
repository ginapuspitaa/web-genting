import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Upload, Download, Trash2, Eye, Edit, Trash, X } from "lucide-react";

export default function Document() {
  const [isOpen, setIsOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Edit Form state
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [editForm, setEditForm] = useState({
    name: "", description: "", category_id: "", petugas: "", upload_date: ""
  });
  const [editFile, setEditFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
    fetchUsers();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = dayNames[date.getDay()];
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${dayName}, ${d}/${m}/${y}`;
  };

  // Helper for input type date
  const formatInputDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  };

  const openViewModal = (doc) => {
    setSelectedDoc(doc);
    setViewModalOpen(true);
  };

  const openEditModal = (doc) => {
    setSelectedDoc(doc);
    setEditForm({
      name: doc.name || "",
      description: doc.description || "",
      category_id: doc.category_id || "",
      petugas: doc.petugas || "",
      upload_date: formatInputDate(doc.upload_date) || ""
    });
    setEditFile(null);
    setEditModalOpen(true);
  };

  const openDeleteModal = (doc) => {
    setSelectedDoc(doc);
    setDeleteModalOpen(true);
  };

  const handleEditInput = (e) => {
    const { name, value } = e.target;
    setEditForm((s) => ({ ...s, [name]: value }));
  };

  const handleEditFileChange = (e) => {
    setEditFile(e.target.files[0]);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      if (editForm.category_id) formData.append("category_id", editForm.category_id);
      formData.append("petugas", editForm.petugas);
      if (editForm.upload_date) formData.append("upload_date", editForm.upload_date);
      
      if (editFile) {
        formData.append("file", editFile);
      }

      const res = await fetch(`http://localhost:5000/api/documents/${selectedDoc.id}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update document');
      }
      
      setEditModalOpen(false);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate dokumen: ' + err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${selectedDoc.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete document');
      
      setDeleteModalOpen(false);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus dokumen: ' + err.message);
    }
  };

  const confirmDeleteAll = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/all`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete all documents');
      
      setDeleteAllModalOpen(false);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus semua dokumen: ' + err.message);
    }
  };

  const handleDownloadAll = () => {
    if (documents.length === 0) {
      alert("Tidak ada data untuk didownload.");
      return;
    }
    
    // Download zip file directly from backend
    window.location.href = "http://localhost:5000/api/documents/download-all";
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
              <h1 className="text-lg font-semibold">Semua Arsip</h1>
            </div>

            <div className="p-6 space-y-4">

              {/* BUTTON AREA */}
              <div className="flex gap-3">
                <button onClick={() => navigate("/upload")} className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
                  <Upload size={16} />
                  Upload File
                </button>

                <button onClick={handleDownloadAll} className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
                  <Download size={16} />
                  Download Semua Data
                </button>

                <button onClick={() => setDeleteAllModalOpen(true)} className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
                  <Trash2 size={16} />
                  Hapus Semua Data
                </button>
              </div>


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
                    placeholder="Cari dokumen..."
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
                      <th className="p-3">Nama Dokumen</th>
                      <th className="p-3">Deskripsi</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Petugas</th>
                      <th className="p-3">Tanggal Upload</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents
                      .filter(item => 
                        (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.category_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.petugas || "").toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item, index) => (
                      <tr
                        key={item.id}
                        className="bg-rose-300 even:bg-rose-200"
                      >
                        <td className="p-3">{index + 1}.</td>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.description}</td>
                        <td className="p-3">{item.category_name || '-'}</td>
                        <td className="p-3">{item.petugas}</td>
                        <td className="p-3">{formatDate(item.upload_date)}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => openViewModal(item)}
                              className="cursor-pointer bg-gray-400 p-1 rounded text-white hover:bg-gray-500"
                              title="Lihat Detail"
                            >
                              <Eye size={14} />
                            </button>
                            {item.file_path ? (
                              <a 
                                href={`http://localhost:5000${item.file_path}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer bg-blue-500 p-1 rounded text-white inline-block hover:bg-blue-600"
                                title="Download File"
                              >
                                <Download size={14} />
                              </a>
                            ) : (
                              <button className="bg-gray-300 p-1 rounded text-white cursor-not-allowed" title="Tidak ada file">
                                <Download size={14} />
                              </button>
                            )}
                            <button 
                              onClick={() => openEditModal(item)}
                              className="cursor-pointer bg-green-500 p-1 rounded text-white hover:bg-green-600"
                              title="Edit Dokumen"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(item)}
                              className="cursor-pointer bg-red-600 p-1 rounded text-white hover:bg-red-700"
                              title="Hapus Dokumen"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {documents.filter(item => 
                        (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.category_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.petugas || "").toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-6 text-center text-gray-500">
                          Data tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </main>

        {/* VIEW MODAL */}
        {viewModalOpen && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative transform scale-100 transition-all border border-gray-100">
              <button 
                onClick={() => setViewModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Detail Dokumen</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="block font-medium text-gray-500">Nama Dokumen</span>
                  <div className="text-gray-900">{selectedDoc.name}</div>
                </div>
                <div>
                  <span className="block font-medium text-gray-500">Deskripsi</span>
                  <div className="text-gray-900">{selectedDoc.description || '-'}</div>
                </div>
                <div>
                  <span className="block font-medium text-gray-500">Kategori</span>
                  <div className="text-gray-900">{selectedDoc.category_name || '-'}</div>
                </div>
                <div>
                  <span className="block font-medium text-gray-500">Petugas Uploader</span>
                  <div className="text-gray-900">{selectedDoc.petugas || '-'}</div>
                </div>
                <div>
                  <span className="block font-medium text-gray-500">Tanggal Upload</span>
                  <div className="text-gray-900">{formatDate(selectedDoc.upload_date)}</div>
                </div>
                <div>
                  <span className="block font-medium text-gray-500">File File</span>
                  <div className="mt-1">
                    {selectedDoc.file_path ? (
                      <a 
                        href={`http://localhost:5000${selectedDoc.file_path}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Download size={14} /> Preview File
                      </a>
                    ) : (
                      <span className="text-gray-400">Tidak ada file lampiran</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setViewModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editModalOpen && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-10 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 relative transform scale-100 transition-all border border-gray-100">
              <button 
                onClick={() => setEditModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                <Edit size={20} /> Edit Dokumen
              </h2>
              
              <form onSubmit={submitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dokumen</label>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditInput}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    name="category_id"
                    value={editForm.category_id}
                    onChange={handleEditInput}
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
                  <select
                    name="petugas"
                    value={editForm.petugas}
                    onChange={handleEditInput}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- Pilih Petugas --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Upload</label>
                  <input
                    name="upload_date"
                    type="date"
                    value={editForm.upload_date}
                    onChange={handleEditInput}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ganti File (Opsional)</label>
                  <input
                    type="file"
                    onChange={handleEditFileChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengganti file lama.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Deskripsi</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditInput}
                    rows={3}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t mt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {deleteModalOpen && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform scale-100 transition-all border border-red-50">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Hapus Dokumen?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Apakah Anda yakin ingin menghapus dokumen <strong>"{selectedDoc.name}"</strong>? File yang terkait juga akan dihapus secara permanen.
              </p>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE ALL MODAL */}
        {deleteAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform scale-100 transition-all border border-red-50">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Peringatan: Hapus Semua Data!</h3>
              <p className="text-sm text-gray-500 mb-6">
                Apakah Anda <strong>YAKIN</strong> ingin menghapus <strong>SELURUH</strong> data dokumen secara permanen? Semua file fisik di server juga tidak dapat dikembalikan lagi.
              </p>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteAllModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteAll}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                >
                  Ya, Hapus Semua
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}