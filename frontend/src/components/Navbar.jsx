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
    <nav className="border-b border-indigo-800/50 bg-indigo-700 text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="text-xl font-semibold tracking-tight transition hover:text-indigo-200 sm:text-2xl">
          🎟️ BookIt
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-medium sm:gap-3">
          <Link to="/" className="rounded-full px-3 py-1.5 transition hover:bg-white/10">Events</Link>

          {!user ? (
            <>
              <Link to="/login" className="rounded-full px-3 py-1.5 transition hover:bg-white/10">Login</Link>
              <Link to="/signup" className="rounded-full bg-white px-3 py-1.5 text-indigo-700 transition hover:bg-indigo-100">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {user.role === "ORGANIZER" ? (
                <Link to="/organizer/dashboard" className="rounded-full px-3 py-1.5 transition hover:bg-white/10">
                  Dashboard
                </Link>
              ) : (
                <Link to="/my-bookings" className="rounded-full px-3 py-1.5 transition hover:bg-white/10">
                  My Bookings
                </Link>
              )}
              <span className="hidden rounded-full bg-white/10 px-3 py-1.5 text-indigo-100 sm:inline">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-indigo-400 bg-indigo-600 px-3 py-1.5 transition hover:bg-indigo-800"
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
