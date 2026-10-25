import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateEvent from "./pages/CreateEvent";
import Events from "./pages/Events";
import ProtectedRoute from "./components/ProtectedRoute";
import EventDetails from "./pages/EventDetails";
import Attendance from "./pages/Attendance";
import OrganizerEventDetails from "./pages/OrganizerEventDetails";
import EditEvent from "./pages/EditEvent";
import ParticipantHome from "./pages/ParticipantHome";
import OrganizerHome from "./pages/OrganizerHome";
import Certificates from "./pages/Certificates";
import CertificateCustomization from "./pages/CertificateCustomization";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute requiredRole="participant">
              <Certificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer-home"
          element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/participant-home"
          element={
            <ProtectedRoute requiredRole="participant">
              <ParticipantHome />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/organizer/events/:id/edit"
          element={
            <ProtectedRoute requiredRole="organizer">
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id/certificate"
          element={
            <ProtectedRoute requiredRole="organizer">
              <CertificateCustomization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id"
          element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerEventDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/attendance"
          element={
          <ProtectedRoute requiredRole="organizer">
          <Attendance />
          </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
          <ProtectedRoute requiredRole="participant">
          <Dashboard />
          </ProtectedRoute>
          }
        />
        <Route
          path="/organizer"
          element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/create-event"
          element={
            <ProtectedRoute requiredRole="organizer">
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route path="/events" element={<Events />} />
        <Route
          path="/events/:id"
          element={<EventDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

