import {
  LayoutDashboard,
  FileText,
  Folder,
  Users,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-rose-400 text-white flex flex-col justify-between transition-all duration-300`}
    >
      <div>
        {/* LOGO */}
        <div className="flex items-center gap-2 px-6 py-6 text-xl font-bold">
          <span className="bg-white text-rose-400 p-2 rounded-lg">G</span>
          {isOpen && <span>Genting</span>}
        </div>

        {/* MENU */}
        <nav className="mt-6 space-y-2 px-2">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
            isOpen={isOpen}
            active={location.pathname === "/dashboard"}
            onClick={() => navigate("/dashboard")}
          />

          <SidebarItem
            icon={<FileText size={18} />}
            text="Document"
            isOpen={isOpen}
            active={location.pathname === "/document"}
            onClick={() => navigate("/document")}
          />

          <SidebarItem
            icon={<Folder size={18} />}
            text="Category"
            isOpen={isOpen}
            active={location.pathname === "/category"}
            onClick={() => navigate("/category")}
          />

          <SidebarItem
            icon={<Users size={18} />}
            text="User"
            isOpen={isOpen}
            active={location.pathname === "/user"}
            onClick={() => navigate("/user")}
          />
        </nav>
      </div>

      {/* LOGOUT */}
      <div className="px-2 mb-6">
        <SidebarItem
          icon={<LogOut size={18} />}
          text="Logout"
          isOpen={isOpen}
          active={false}
          onClick={() => {
            if (window.confirm("Apakah Anda yakin ingin logout?")) {
              navigate("/");
            }
          }}
        />
      </div>
    </aside>
  );
}

function SidebarItem({ icon, text, isOpen, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
        ${
          active
            ? "bg-white text-rose-400 font-semibold shadow"
            : "hover:bg-rose-500 text-white"
        }`}
    >
      {icon}
      {isOpen && <span>{text}</span>}
    </div>
  );
}