import { Menu, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function Topbar({ toggleSidebar }) {
  const [userName, setUserName] = useState("Nama Pengguna");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.name) {
          setUserName(parsed.name);
        }
      }
    } catch (e) {
      console.error("Gagal membaca nama user:", e);
    }
  }, []);

  return (
    <header className="bg-orange-500 h-16 flex items-center justify-between px-6 text-white relative z-40">
      <button onClick={toggleSidebar} className="cursor-pointer">
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
        <User size={18} />
        <span>{userName}</span>
      </div>
    </header>
  );
}