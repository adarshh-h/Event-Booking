import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  const date = new Date(event.eventDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition border border-gray-100 overflow-hidden flex flex-col">
      <div className="bg-indigo-600 h-2" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-800 leading-tight">{event.title}</h3>
          {event.isSoldOut ? (
            <span className="shrink-0 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
              SOLD OUT
            </span>
          ) : (
            <span className="shrink-0 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
              {event.seatsRemaining} left
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-1">📍 {event.venue}</p>
        <p className="text-sm text-gray-500 mb-3">🗓️ {date}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-indigo-700 font-bold text-lg">
            {event.price === 0 ? "Free" : `₹${event.price}`}
          </span>
          <Link
            to={`/events/${event.id}`}
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
