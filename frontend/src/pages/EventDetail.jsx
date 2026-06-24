// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext";

// export default function EventDetail() {
//   const { id } = useParams();
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [event, setEvent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [booking, setBooking] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     const fetchEvent = async () => {
//       try {
//         const res = await api.get(`/events/${id}`);
//         setEvent(res.data);
//       } catch {
//         setError("Event not found.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEvent();
//   }, [id]);

//   const handleBook = async () => {
//     if (!user) { navigate("/login"); return; }
//     setBooking(true);
//     setError("");
//     setSuccess("");
//     try {
//       await api.post(`/events/${id}/book`);
//       setSuccess("🎉 Booking confirmed! Check My Bookings.");
//       // Refresh event to update seat count
//       const res = await api.get(`/events/${id}`);
//       setEvent(res.data);
//     } catch (err) {
//       setError(err.response?.data?.message || "Booking failed. Please try again.");
//     } finally {
//       setBooking(false);
//     }
//   };

//   if (loading) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
//     </div>
//   );

//   if (!event) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
//       Event not found.
//     </div>
//   );

//   const date = new Date(event.eventDate).toLocaleDateString("en-IN", {
//     weekday: "long", day: "numeric", month: "long", year: "numeric",
//     hour: "2-digit", minute: "2-digit",
//   });

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4">
//       <div className="max-w-3xl mx-auto">
//         <button onClick={() => navigate(-1)} className="text-indigo-600 text-sm mb-6 hover:underline">
//           ← Back to Events
//         </button>

//         <div className="bg-white rounded-2xl shadow-md overflow-hidden">
//           <div className="bg-indigo-700 px-8 py-10 text-white">
//             <div className="flex items-start justify-between gap-4">
//               <h1 className="text-3xl font-bold">{event.title}</h1>
//               {event.isSoldOut ? (
//                 <span className="shrink-0 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
//                   SOLD OUT
//                 </span>
//               ) : (
//                 <span className="shrink-0 bg-green-400 text-white text-sm font-bold px-3 py-1 rounded-full">
//                   {event.seatsRemaining} seats left
//                 </span>
//               )}
//             </div>
//             <p className="text-indigo-200 mt-2 text-lg">{event.venue}</p>
//           </div>

//           <div className="p-8">
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <p className="text-xs text-gray-400 mb-1">Date & Time</p>
//                 <p className="text-sm font-medium text-gray-700">🗓️ {date}</p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <p className="text-xs text-gray-400 mb-1">Price</p>
//                 <p className="text-sm font-bold text-indigo-700">
//                   {event.price === 0 ? "🎟️ Free" : `₹${event.price}`}
//                 </p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <p className="text-xs text-gray-400 mb-1">Capacity</p>
//                 <p className="text-sm font-medium text-gray-700">
//                   👥 {event.bookedSeats} / {event.capacity} booked
//                 </p>
//               </div>
//             </div>

//             <div className="mb-8">
//               <h2 className="text-lg font-semibold text-gray-800 mb-2">About this event</h2>
//               <p className="text-gray-600 leading-relaxed">{event.description}</p>
//             </div>

//             {success && (
//               <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-4 text-sm">
//                 {success}
//               </div>
//             )}
//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4 text-sm">
//                 {error}
//               </div>
//             )}

//             {user?.role !== "ORGANIZER" && (
//               <button
//                 onClick={handleBook}
//                 disabled={booking || event.isSoldOut}
//                 className={`w-full py-3 rounded-xl font-semibold text-white transition ${
//                   event.isSoldOut
//                     ? "bg-gray-300 cursor-not-allowed"
//                     : "bg-indigo-600 hover:bg-indigo-700"
//                 }`}
//               >
//                 {booking ? "Booking..." : event.isSoldOut ? "Sold Out" : "Book a Seat"}
//               </button>
//             )}

//             {!user && (
//               <p className="text-center text-sm text-gray-400 mt-3">
//                 <button onClick={() => navigate("/login")} className="text-indigo-600 hover:underline">
//                   Login
//                 </button>{" "}
//                 to book this event
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch {
        setError("Event not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    setBooking(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/events/${id}/book`);
      setSuccess("🎉 Booking confirmed! Check My Bookings.");
      // Refresh event to update seat count
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
      Event not found.
    </div>
  );

  const date = new Date(event.eventDate).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-indigo-600 text-sm mb-6 hover:underline">
          ← Back to Events
        </button>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-indigo-700 px-8 py-10 text-white">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              {event.isSoldOut ? (
                <span className="shrink-0 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  SOLD OUT
                </span>
              ) : (
                <span className="shrink-0 bg-green-400 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {event.seatsRemaining} seats left
                </span>
              )}
            </div>
            <p className="text-indigo-200 mt-2 text-lg">{event.venue}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Date & Time</p>
                <p className="text-sm font-medium text-gray-700">🗓️ {date}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Price</p>
                <p className="text-sm font-bold text-indigo-700">
                  {event.price === 0 ? "🎟️ Free" : `₹${event.price}`}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Capacity</p>
                <p className="text-sm font-medium text-gray-700">
                  👥 {event.bookedSeats} / {event.capacity} booked
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Organizer</p>
                <p className="text-sm font-medium text-gray-700">🎤 {event.organizer?.name}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">About this event</h2>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-4 text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4 text-sm">
                {error}
              </div>
            )}

            {user?.role !== "ORGANIZER" && (
              <button
                onClick={handleBook}
                disabled={booking || event.isSoldOut}
                className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                  event.isSoldOut
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {booking ? "Booking..." : event.isSoldOut ? "Sold Out" : "Book a Seat"}
              </button>
            )}

            {!user && (
              <p className="text-center text-sm text-gray-400 mt-3">
                <button onClick={() => navigate("/login")} className="text-indigo-600 hover:underline">
                  Login
                </button>{" "}
                to book this event
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
