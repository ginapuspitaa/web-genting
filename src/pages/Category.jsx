import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Plus, Edit, Trash } from "lucide-react";

export default function Category() {
  const [isOpen, setIsOpen] = useState(true);

  const data = [
    {
      id: 1,
      nama: "Kategori 1",
      keterangan: "Keterangan 1",
    },
    {
      id: 2,
      nama: "Kategori 2",
      keterangan: "Keterangan 2",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} />

      <div className="flex-1 flex flex-col">
        <Topbar toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow border">

            {/* HEADER */}
            <div className="bg-rose-200 px-6 py-4 rounded-t-xl">
              <h1 className="text-lg font-semibold">Kategori</h1>
            </div>

            <div className="p-6 space-y-4">

              {/* BUTTON TAMBAH */}
              <button className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
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
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={item.id}
                        className="bg-rose-300 even:bg-rose-200"
                      >
                        <td className="p-3">{index + 1}.</td>
                        <td className="p-3">{item.nama}</td>
                        <td className="p-3">{item.keterangan}</td>
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