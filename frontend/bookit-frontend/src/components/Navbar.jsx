import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-indigo-200">
          🎟️ BookIt
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-indigo-200">Events</Link>

          {!user ? (
            <>
              <Link to="/login" className="hover:text-indigo-200">Login</Link>
              <Link to="/signup" className="bg-white text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {user.role === "ORGANIZER" ? (
                <Link to="/organizer/dashboard" className="hover:text-indigo-200">
                  Dashboard
                </Link>
              ) : (
                <Link to="/my-bookings" className="hover:text-indigo-200">
                  My Bookings
                </Link>
              )}
              <span className="text-indigo-300 hidden sm:inline">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-600 border border-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-800"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
