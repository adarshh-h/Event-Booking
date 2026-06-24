// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../api/axios";

// export default function CreateEvent() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     title: "", description: "", venue: "",
//     eventDate: "", capacity: "", price: "",
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       await api.post("/organizer/events", {
//         ...form,
//         capacity: Number(form.capacity),
//         price: Number(form.price),
//       });
//       navigate("/organizer/dashboard");
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to create event.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4">
//       <div className="max-w-2xl mx-auto">
//         <button onClick={() => navigate(-1)} className="text-indigo-600 text-sm mb-6 hover:underline">
//           ← Back to Dashboard
//         </button>

//         <div className="bg-white rounded-2xl shadow p-8">
//           <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Event</h1>

//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {[
//               { label: "Event Title", name: "title", type: "text", placeholder: "React Workshop 2027" },
//               { label: "Venue", name: "venue", type: "text", placeholder: "Bangalore Tech Hub" },
//               { label: "Date & Time", name: "eventDate", type: "datetime-local", placeholder: "" },
//               { label: "Capacity (seats)", name: "capacity", type: "number", placeholder: "100" },
//               { label: "Price (₹) — enter 0 for free", name: "price", type: "number", placeholder: "499" },
//             ].map((field) => (
//               <div key={field.name}>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
//                 <input
//                   type={field.type}
//                   name={field.name}
//                   value={form[field.name]}
//                   onChange={handleChange}
//                   required
//                   min={field.type === "number" ? "0" : undefined}
//                   placeholder={field.placeholder}
//                   className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                 />
//               </div>
//             ))}

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//               <textarea
//                 name="description"
//                 value={form.description}
//                 onChange={handleChange}
//                 required
//                 rows={4}
//                 placeholder="Tell attendees what this event is about..."
//                 className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
//             >
//               {loading ? "Creating..." : "Create Event"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", venue: "",
    eventDate: "", eventTime: "", capacity: "", price: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.eventDate || !form.eventTime) {
      setError("Please select both date and time.");
      return;
    }

    const combinedDateTime = new Date(`${form.eventDate}T${form.eventTime}`);
    if (isNaN(combinedDateTime.getTime())) {
      setError("Invalid date or time.");
      return;
    }
    if (combinedDateTime <= new Date()) {
      setError("Event date must be in the future.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/organizer/events", {
        title: form.title,
        description: form.description,
        venue: form.venue,
        eventDate: combinedDateTime.toISOString(),
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

  // Min date = today
  const today = new Date().toISOString().split("T")[0];

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

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input
                type="text" name="title" value={form.title} onChange={handleChange}
                required placeholder="React Workshop 2027"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input
                type="text" name="venue" value={form.venue} onChange={handleChange}
                required placeholder="Bangalore Tech Hub"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Date & Time — split into two friendly fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📅</span>
                  <input
                    type="date" name="eventDate" value={form.eventDate} onChange={handleChange}
                    required min={today}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🕐</span>
                  <input
                    type="time" name="eventTime" value={form.eventTime} onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                  />
                </div>
              </div>
              {form.eventDate && form.eventTime && (
                <p className="text-xs text-indigo-600 mt-1.5">
                  📍 {new Date(`${form.eventDate}T${form.eventTime}`).toLocaleDateString("en-IN", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              )}
            </div>

            {/* Capacity & Price side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (seats)</label>
                <input
                  type="number" name="capacity" value={form.capacity} onChange={handleChange}
                  required min="1" placeholder="100"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) — 0 for free</label>
                <input
                  type="number" name="price" value={form.price} onChange={handleChange}
                  required min="0" placeholder="499"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                required rows={4}
                placeholder="Tell attendees what this event is about..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <button
              type="submit" disabled={loading}
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
