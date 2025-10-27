import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Menu, X, Shield, User, LogOut, Settings } from "lucide-react";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50" 
          : "bg-linear-to-r from-blue-600 to-indigo-700"
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo / App name */}
          <div 
            className={`flex items-center space-x-2 cursor-pointer transition-transform hover:scale-105 ${
              scrolled ? "text-gray-800" : "text-white"
            }`}
            onClick={() => navigate("/dashboard")}
          >
            <div className={`p-2 rounded-lg ${
              scrolled ? "bg-blue-100 text-blue-600" : "bg-white/20 text-white"
            }`}>
              <Shield size={20} />
            </div>
            <h1 className="text-lg sm:text-xl font-bold">
              Secure Key Manager
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/dashboard" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                scrolled 
                  ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" 
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <Settings size={16} />
              <span>Dashboard</span>
            </Link>

            {user?.role === "admin" && (
              <Link 
                to="/dashboard?admin=true" 
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  scrolled 
                    ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" 
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                <Shield size={16} />
                <span>Admin Panel</span>
              </Link>
            )}

            <Link 
              to="/profile" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                scrolled 
                  ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" 
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <User size={16} />
              <span>Profile</span>
            </Link>

            {/* User info and logout */}
            <div className={`flex items-center space-x-3 ml-4 pl-4 border-l ${
              scrolled ? "border-gray-300" : "border-white/30"
            }`}>
              <div className={`text-sm ${scrolled ? "text-gray-600" : "text-white/80"}`}>
                <div className="font-medium">{user?.name || user?.email}</div>
                <div className="text-xs capitalize">{user?.role}</div>
              </div>
              
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  scrolled 
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" 
                    : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                }`}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`md:hidden flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              scrolled 
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                : "bg-white/20 hover:bg-white/30 text-white"
            }`}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className={`md:hidden py-4 border-t ${
            scrolled 
              ? "bg-white border-gray-200" 
              : "bg-indigo-600 border-white/20"
          }`}>
            <div className="flex flex-col space-y-3">
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  scrolled 
                    ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Settings size={18} />
                <span>Dashboard</span>
              </Link>

              {user?.role === "admin" && (
                <Link
                  to="/dashboard?admin=true"
                  onClick={closeMenu}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    scrolled 
                      ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" 
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Shield size={18} />
                  <span>Admin Panel</span>
                </Link>
              )}

              <Link
                to="/profile"
                onClick={closeMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  scrolled 
                    ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                <User size={18} />
                <span>Profile</span>
              </Link>

              {/* User info in mobile */}
              <div className={`px-4 py-3 border-t ${
                scrolled ? "border-gray-200" : "border-white/20"
              }`}>
                <div className={`text-sm mb-3 ${scrolled ? "text-gray-600" : "text-white/80"}`}>
                  <div className="font-medium">{user?.name || user?.email}</div>
                  <div className="text-xs capitalize">{user?.role}</div>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-medium transition-all ${
                    scrolled 
                      ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" 
                      : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                  }`}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}