import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, checkAuth, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper to check active link
  const isActive = (path) => location.pathname === path ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50";

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span className="font-bold text-xl tracking-tight text-gray-900">Ideas<span className="text-blue-600">Hub</span></span>
          </Link>

          {/* Desktop Menu */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/dashboard")}`}
              >
                Dashboard
              </Link>
              <Link
                to="/ideas"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/ideas")}`}
              >
                Feed
              </Link>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <span className="text-sm text-gray-500 mr-2">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition"
              >
                Logout
              </button>
              <Link
                to="/ideas/create"
                className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow transition"
              >
                + New Idea
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium text-sm">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}