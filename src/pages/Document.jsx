import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Upload, Download, Trash2, Eye, Edit, Trash } from "lucide-react";

export default function Document() {
  const [isOpen, setIsOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} />

      <div className="flex-1 flex flex-col">
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

                <button className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
                  <Download size={16} />
                  Download Semua Data
                </button>

                <button className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
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
                    {documents.map((item, index) => (
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
                            <button className="cursor-pointer bg-gray-400 p-1 rounded text-white">
                              <Eye size={14} />
                            </button>
                            {item.file_path ? (
                              <a 
                                href={`http://localhost:5000${item.file_path}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="cursor-pointer bg-blue-500 p-1 rounded text-white inline-block"
                                title="Download File"
                              >
                                <Download size={14} />
                              </a>
                            ) : (
                              <button className="bg-gray-300 p-1 rounded text-white cursor-not-allowed" title="Tidak ada file">
                                <Download size={14} />
                              </button>
                            )}
                            <button className="cursor-pointer bg-green-500 p-1 rounded text-white">
                              <Edit size={14} />
                            </button>
                            <button className="cursor-pointer bg-red-600 p-1 rounded text-white">
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
      </div>
    </div>
  );
}