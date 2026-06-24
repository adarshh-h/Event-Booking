import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/me/bookings");
      setBookings(res.data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId) => {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(bookingId);
    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: "CANCELLED" } : b)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel.");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4 text-sm">{error}</div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🎟️</p>
            <p className="text-lg font-medium">No bookings yet</p>
            <Link to="/" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const date = new Date(booking.event.eventDate).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              });
              return (
                <div key={booking.id} className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{booking.event.title}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">📍 {booking.event.venue}</p>
                    <p className="text-sm text-gray-500">🗓️ {date}</p>
                    <p className="text-sm font-medium text-indigo-700 mt-1">
                      {booking.event.price === 0 ? "Free" : `₹${booking.event.price}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/events/${booking.event.id}`}
                      className="text-sm border border-indigo-300 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition"
                    >
                      View
                    </Link>
                    {booking.status === "CONFIRMED" && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                        className="text-sm border border-red-300 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {cancelling === booking.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
