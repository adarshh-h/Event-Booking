import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", venue: "",
    eventDate: "", capacity: "", price: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/organizer/events", {
        ...form,
        capacity: Number(form.capacity),
        price: Number(form.price),
      });
      navigate("/organizer/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-indigo-600 text-sm mb-6 hover:underline">
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Event</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: "Event Title", name: "title", type: "text", placeholder: "React Workshop 2027" },
              { label: "Venue", name: "venue", type: "text", placeholder: "Bangalore Tech Hub" },
              { label: "Date & Time", name: "eventDate", type: "datetime-local", placeholder: "" },
              { label: "Capacity (seats)", name: "capacity", type: "number", placeholder: "100" },
              { label: "Price (₹) — enter 0 for free", name: "price", type: "number", placeholder: "499" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                  min={field.type === "number" ? "0" : undefined}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Tell attendees what this event is about..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
