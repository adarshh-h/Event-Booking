import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Attendees() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/organizer/events/${id}/attendees`);
        setAttendees(res.data);
      } catch {
        setError("Failed to load attendees.");
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-indigo-600 text-sm mb-6 hover:underline">
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Attendees</h1>
          <p className="text-gray-500 text-sm mb-6">{attendees.length} confirmed booking{attendees.length !== 1 ? "s" : ""}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm">{error}</div>
          )}

          {attendees.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">👥</p>
              <p>No attendees yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">#</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Booked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendees.map((a, i) => (
                    <tr key={a.bookingId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{a.name}</td>
                      <td className="px-4 py-3 text-gray-500">{a.email}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(a.bookedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
