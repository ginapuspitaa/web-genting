import { Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar({ toggleSidebar }) {
  const navigate = useNavigate();

  return (
    <header className="bg-orange-500 h-16 flex items-center justify-between px-6 text-white">
      <button onClick={toggleSidebar} className="cursor-pointer">
        <Menu size={22} />
      </button>

      <div
        onClick={() => navigate("/profile")}
        className="flex items-center gap-2 cursor-pointer hover:bg-orange-600 px-3 py-2 rounded-lg transition"
      >
        <User size={18} />
        <span>Nama Pengguna</span>
      </div>
    </header>
  );
}