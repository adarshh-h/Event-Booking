import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import EventCard from "../components/EventCard";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page };
      if (search) params.search = search;
      if (date) params.date = date;
      const res = await api.get("/events", { params });
      setEvents(res.data.events);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, date]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const clearFilters = () => {
    setSearch("");
    setDate("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[linear-gradient(135deg,_#312e81_0%,_#4338ca_45%,_#4f46e5_100%)] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center sm:text-left">
          <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-indigo-100">
            Curated experiences
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">Find your next unforgettable event</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-indigo-100 sm:text-lg sm:mx-0">
            Browse, book, and enjoy live events with a polished experience built for every screen size.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="submit"
              className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Search
            </button>
            {(search || date) && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-2xl px-3 py-3 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-red-500"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">{total} event{total !== 1 ? "s" : ""} found</p>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow h-52 animate-pulse" />
            ))}
          </div>
        )}

        {/* Events grid */}
        {!loading && events.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🎭</p>
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm">Try a different search or clear filters</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 transition"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
