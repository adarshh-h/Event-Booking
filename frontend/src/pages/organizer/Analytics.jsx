import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/organizer/events/${id}/analytics`);
        setData(res.data);
      } catch {
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  const stats = data ? [
    { label: "Total Views", value: data.views, icon: "👁️", color: "bg-blue-50 text-blue-700 border-blue-100" },
    { label: "Bookings Started", value: data.bookingStarted, icon: "🛒", color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
    { label: "Bookings Confirmed", value: data.bookingConfirmed, icon: "✅", color: "bg-green-50 text-green-700 border-green-100" },
    { label: "Bookings Cancelled", value: data.bookingCancelled, icon: "❌", color: "bg-red-50 text-red-700 border-red-100" },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-indigo-600 text-sm mb-6 hover:underline">
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Analytics</h1>
          <p className="text-gray-500 text-sm mb-8">View → Booking conversion funnel</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm">{error}</div>
          )}

          {data && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {stats.map((s) => (
                  <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
                    <p className="text-2xl mb-1">{s.icon}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs mt-1 opacity-80">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Conversion rate highlight */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
                <p className="text-sm text-indigo-500 mb-1">View → Booking Conversion Rate</p>
                <p className="text-5xl font-bold text-indigo-700">{data.conversionRate}%</p>
                <p className="text-xs text-indigo-400 mt-2">
                  {data.bookingConfirmed} confirmed out of {data.views} views
                </p>
              </div>

              {/* Funnel bar */}
              {data.views > 0 && (
                <div className="mt-8 space-y-3">
                  <p className="text-sm font-medium text-gray-600 mb-4">Funnel Breakdown</p>
                  {[
                    { label: "Views", value: data.views, color: "bg-blue-400" },
                    { label: "Started", value: data.bookingStarted, color: "bg-yellow-400" },
                    { label: "Confirmed", value: data.bookingConfirmed, color: "bg-green-400" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-20">{row.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div
                          className={`${row.color} h-3 rounded-full transition-all`}
                          style={{ width: `${Math.min(100, (row.value / data.views) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-6 text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
