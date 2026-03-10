import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    categories: 0,
    documents: 0,
    chartData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  // Warna berbeda tiap bar
  const colors = ["#f43f5e", "#fb7185", "#f97316", "#14b8a6", "#3b82f6", "#8b5cf6"];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} />

      <div className="flex-1 flex flex-col">
        <Topbar toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="p-6 space-y-6 overflow-y-auto">
          {/* STAT CARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Dokumen" value={stats.documents || 0} />
            <StatCard title="Kategori" value={stats.categories || 0} />
            <StatCard title="User" value={stats.users || 0} />
          </div>

          {/* CHART */}
          <div className="bg-white rounded-xl shadow p-6 h-[400px]">
            <h2 className="text-lg font-semibold mb-4">
              Jumlah Dokumen per Kategori
            </h2>

            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
                <Bar dataKey="value">
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-cyan-200 rounded-2xl p-6 flex justify-between items-center shadow">
      <div>
        <h3 className="text-gray-700 font-semibold">{title}</h3>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <div className="bg-rose-400 p-4 rounded-full text-white">📄</div>
    </div>
  );
}