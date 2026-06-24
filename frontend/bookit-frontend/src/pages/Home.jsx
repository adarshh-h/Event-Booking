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
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-indigo-700 text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Find Your Next Event</h1>
        <p className="text-indigo-200 text-lg">Browse, book, and experience live events near you</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Search
          </button>
          {(search || date) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-gray-500 text-sm px-3 py-2 hover:text-red-500 transition"
            >
              Clear
            </button>
          )}
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
