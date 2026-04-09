import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#141414]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 no-underline hover:opacity-80 transition-opacity">
          Adaptive Learning
        </Link>
        <div className="hidden sm:flex gap-4">
          <Link to="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Dashboard</Link>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-400 hidden sm:block">
          Welcome, <span className="text-white font-medium">{user?.full_name || user?.email || "Student"}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
