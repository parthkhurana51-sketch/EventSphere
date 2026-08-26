import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function OrganizerDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({
    total_events: 0,
    total_registrations: 0,
    checked_in: 0,
    attendance_percentage: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");



  const userName = localStorage.getItem("user_name");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
        navigate("/");
        return;
    }

    const fetchDashboardData = async () => {
        try {
        const eventsResponse = await fetch(
            `${API_BASE_URL}/api/events/`
        );

        const eventsData = await eventsResponse.json();

        if (!eventsResponse.ok) {
            throw new Error(
            eventsData.detail ||
                "Failed to load events"
            );
        }

        const userId = Number(
            localStorage.getItem("user_id")
        );

        const organizerEvents = eventsData.filter(
            (event) =>
            event.organizer_id === userId
        );

        setEvents(organizerEvents);

        const statsResponse = await fetch(
            `${API_BASE_URL}/api/registrations/organizer/stats`,
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );

        const statsData =
            await statsResponse.json();

        if (!statsResponse.ok) {
            throw new Error(
            statsData.detail ||
                "Failed to load statistics"
            );
        }

        setStats(statsData);

        } catch (err) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    };

    fetchDashboardData();

    }, [navigate, token]);

  const handleLogout = () => {
  const confirmed = window.confirm(
    "Are you sure you want to log out?"
  );

  if (!confirmed) {
    return;
  }

  localStorage.clear();
  navigate("/");
 };

  return (
    <div className="dashboard-page">

      <header className="dashboard-navbar">

            <div
                className="logo"
                onClick={() => navigate("/organizer-home")}
            >
                EventSphere
            </div>

            <nav className="dashboard-nav-links">

                <button
                    onClick={() => navigate("/organizer-home")}
                >
                    Home
                </button>

                <button
                    onClick={() => navigate("/events")}
                >
                    Events
                </button>

                <button
                    onClick={() => navigate("/organizer")}
                >
                    My Events
                </button>

                <button
                    onClick={() => navigate("/organizer/attendance")}
                >
                    Attendance
                </button>

            </nav>

            <div className="dashboard-user">

                <span>
                Hi, {userName}
                </span>

                <button onClick={handleLogout}>
                Logout
                </button>

            </div>

        </header>

      <main className="dashboard-content">

        <section className="dashboard-welcome organizer-welcome">
          <div>
            <p className="dashboard-label">
              ORGANIZER DASHBOARD
            </p>

            <h1>
              Welcome back, {userName} 👋
            </h1>

            <p>
              Create, manage and monitor your events.
            </p>
          </div>

        <div className="organizer-actions">

            <button
                className="attendance-button"
                onClick={() =>
                navigate("/organizer/attendance")
                }
            >
                ✓ Attendance
            </button>

            <button
                className="create-event-button"
                onClick={() =>
                navigate("/organizer/create-event")
                }
            >
                + Create Event
            </button>

        </div>
        </section>

        <section className="dashboard-stats">

            <div className="stat-card">
                <span>Total Events</span>
                <strong>
                {stats.total_events}
                </strong>
            </div>

            <div className="stat-card">
                <span>Total Registrations</span>
                <strong>
                {stats.total_registrations}
                </strong>
            </div>

            <div className="stat-card">
                <span>Attendance</span>
                <strong>
                {stats.attendance_percentage}%
                </strong>
            </div>

        </section>

        <section className="dashboard-section">

          <div className="section-title">
            <p>EVENT MANAGEMENT</p>
            <h2>My Events</h2>
          </div>

          {loading && (
            <div className="dashboard-message">
              Loading your events...
            </div>
          )}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            events.length === 0 && (
              <div className="dashboard-message">
                <h3>No events yet</h3>
                <p>
                  Create your first event to get started.
                </p>
              </div>
            )}

          <div className="registration-grid">

            {events.map((event) => (

              <div
                className="registration-card"
                key={event.id}
              >

                <div className="registration-top">

                  <span className="event-category">
                    {event.category}
                  </span>

                  <span className="registered-status">
                    Active
                  </span>

                </div>

                <h3>{event.name}</h3>

                <div className="registration-info">
                  <p>📅 {event.date}</p>

                  <p>
                    🕐 {event.start_time} –{" "}
                    {event.end_time}
                  </p>

                  <p>📍 {event.venue}</p>

                  <p>
                    👥 Capacity: {event.capacity}
                  </p>
                </div>

                <div className="registration-footer">

                  <span>
                    Event #{event.id}
                  </span>

                  <button
                    className="manage-event-button"
                    onClick={() =>
                      navigate(
                        `/organizer/events/${event.id}`
                      )
                    }
                  >
                    Manage
                  </button>

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
}

export default OrganizerDashboard;

