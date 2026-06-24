import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EventDetail from "./pages/EventDetail";
import MyBookings from "./pages/MyBookings";

import OrganizerDashboard from "./pages/organizer/Dashboard";
import CreateEvent from "./pages/organizer/CreateEvent";
import EditEvent from "./pages/organizer/EditEvent";
import Attendees from "./pages/organizer/Attendees";
import Analytics from "./pages/organizer/Analytics";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/events/:id" element={<EventDetail />} />

            <Route path="/my-bookings" element={
              <ProtectedRoute><MyBookings /></ProtectedRoute>
            } />

            <Route path="/organizer/dashboard" element={
              <ProtectedRoute role="ORGANIZER"><OrganizerDashboard /></ProtectedRoute>
            } />
            <Route path="/organizer/events/create" element={
              <ProtectedRoute role="ORGANIZER"><CreateEvent /></ProtectedRoute>
            } />
            <Route path="/organizer/events/:id/edit" element={
              <ProtectedRoute role="ORGANIZER"><EditEvent /></ProtectedRoute>
            } />
            <Route path="/organizer/events/:id/attendees" element={
              <ProtectedRoute role="ORGANIZER"><Attendees /></ProtectedRoute>
            } />
            <Route path="/organizer/events/:id/analytics" element={
              <ProtectedRoute role="ORGANIZER"><Analytics /></ProtectedRoute>
            } />

            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-6xl mb-4">404</p>
                  <p className="text-lg">Page not found</p>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
