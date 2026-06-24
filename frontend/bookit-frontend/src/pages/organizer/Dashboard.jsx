import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/organizer/events");
        setEvents(res.data);
      } catch {
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Events</h1>
          <Link
            to="/organizer/events/create"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            + Create Event
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4 text-sm">{error}</div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🎪</p>
            <p className="text-lg font-medium">No events yet</p>
            <Link to="/organizer/events/create" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Event</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Sold</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Capacity</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Price</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((event) => {
                  const date = new Date(event.eventDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  });
                  const pct = Math.round((event.soldCount / event.capacity) * 100);
                  return (
                    <tr key={event.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{event.title}</td>
                      <td className="px-6 py-4 text-gray-500">{date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{event.soldCount}/{event.capacity}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{event.capacity}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {event.price === 0 ? "Free" : `₹${event.price}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/organizer/events/${event.id}/edit`}
                            className="text-xs border border-indigo-300 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-50"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/organizer/events/${event.id}/attendees`}
                            className="text-xs border border-gray-200 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100"
                          >
                            Attendees
                          </Link>
                          <Link
                            to={`/organizer/events/${event.id}/analytics`}
                            className="text-xs border border-gray-200 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100"
                          >
                            Analytics
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
