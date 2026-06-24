import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "ORGANIZER") navigate("/organizer/dashboard");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.2),_transparent_38%),linear-gradient(135deg,_#eef2ff_0%,_#f8fafc_70%,_#fef3c7_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center">
        <div className="flex-1 rounded-3xl border border-white/70 bg-slate-900/90 p-8 text-white shadow-2xl sm:p-10">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-indigo-200">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Discover events that match your energy.</h1>
          <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
            Sign in to keep your bookings organized, stay updated, and move through your next experience effortlessly.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">⚡ Fast booking flow</div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">📍 Nearby experiences</div>
          </div>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl sm:p-8">
          <div className="mb-7 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
              🎟️
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">Log in to BookIt</h2>
            <p className="mt-2 text-sm text-slate-500">Use your email and password to continue.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-indigo-600 transition hover:text-indigo-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
