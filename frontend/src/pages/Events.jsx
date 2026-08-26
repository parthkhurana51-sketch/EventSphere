import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");
  const userName = localStorage.getItem("user_name");
  const userRole = localStorage.getItem("user_role");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/events/`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load events"
          );
        }

        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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

  const handleDashboard = () => {
    if (userRole === "organizer") {
      navigate("/organizer");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogoClick = () => {
    if (!token) {
      navigate("/");
      return;
    }

    if (userRole === "organizer") {
      navigate("/organizer-home");
      return;
    }

    navigate("/participant-home");
  };

  return (
    <div className="events-page">

      <header className="dashboard-navbar">

        <div
          className="logo"
          onClick={handleLogoClick}
        >
          EventSphere
        </div>

        <div className="dashboard-user">

          {token ? (
            <>
              <button
                onClick={handleDashboard}
              >
                {userRole === "organizer"
                  ? "My Events"
                  : "Dashboard"}
              </button>

              <span>
                Hi, {userName}
              </span>

              <button
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>

              <button
                className="register-btn"
                onClick={() => navigate("/register")}
              >
                Get Started
              </button>
            </>
          )}

        </div>

      </header>

      <main className="events-container">

        <section className="events-header">

          <p>
            DISCOVER EVENTS
          </p>

          <h1>
            Find your next experience.
          </h1>

          <span>
            Explore workshops, conferences,
            competitions and other events
            happening around you.
          </span>

        </section>

        {loading && (
          <div className="dashboard-message">
            Loading events...
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
              No events available right now.
            </div>
          )}

        <div className="events-grid">

          {events.map((event) => (

            <div
              className="event-discovery-card"
              key={event.id}
            >

              <div className="event-card-top">

                <span className="event-category">
                  {event.category}
                </span>

                <span className="event-capacity">
                  {event.capacity} seats
                </span>

              </div>

              <h2>
                {event.name}
              </h2>

              <p className="event-description">
                {event.description ||
                  "Join this exciting EventSphere event."}
              </p>

              <div className="event-details">

                <p>
                  📅 {event.date}
                </p>

                <p>
                  🕐 {event.start_time} –{" "}
                  {event.end_time}
                </p>

                <p>
                  📍 {event.venue}
                </p>

              </div>

              <button
                className="event-register-button"
                onClick={() =>
                  navigate(`/events/${event.id}`)
                }
              >
                View Event
              </button>

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}

export default Events;

