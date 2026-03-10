import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Plus, Edit, Trash } from "lucide-react";

export default function User() {
  const [isOpen, setIsOpen] = useState(true);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk mengambil data dari backend
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

  // Panggil fetchUsers saat komponen pertama kali dimuat
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} />

      <div className="flex-1 flex flex-col">
        <Topbar toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow border">

            {/* HEADER */}
            <div className="bg-rose-200 px-6 py-4 rounded-t-xl">
              <h1 className="text-lg font-semibold">User</h1>
            </div>

            <div className="p-6 space-y-4">

              {/* BUTTON TAMBAH */}
              <button className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
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
                      <th className="p-3">Foto</th>
                      <th className="p-3">Nama</th>
                      <th className="p-3">Email</th>
                      <th className="p-3 text-center">Aksi</th>
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
                        {!loading && !error && data.length === 0 && (
                          <tr>
                            <td colSpan="5" className="p-4 text-center">Tidak ada data user.</td>
                          </tr>
                        )}
                        {!loading && !error && data.map((item, index) => (
                          <tr
                            key={item.id}
                            className="bg-rose-300 even:bg-rose-200"
                          >
                            <td className="p-3">{index + 1}.</td>

                            {/* FOTO */}
                            <td className="p-3">
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black text-lg">
                                {/* Ganti emoji dengan teks/inisial atau avatar lain jika mau */}
                                👤
                              </div>
                            </td>

                            <td className="p-3">{item.name}</td>
                            <td className="p-3">{item.email}</td>

                            {/* AKSI */}
                            <td className="p-3">
                              <div className="flex justify-center gap-2">
                                <button className="bg-green-500 p-1 rounded text-white">
                                  <Edit size={14} />
                                </button>
                                <button className="bg-red-600 p-1 rounded text-white">
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