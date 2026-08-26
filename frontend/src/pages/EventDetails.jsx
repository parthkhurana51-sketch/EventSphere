import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../config";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access_token");
  const userName = localStorage.getItem("user_name");
  const userRole = localStorage.getItem("user_role");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/events/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load event"
          );
        }

        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setRegistering(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/registrations/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            event_id: Number(id),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Registration failed"
        );
      }

      setMessage(
        "Registration successful! You are registered for this event."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

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

  if (loading) {
    return (
      <div className="event-page-new">
        <div className="event-loading">
          <div className="event-loading-spinner"></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="event-page-new">
        <div className="event-error-page">
          <h2>Unable to load event</h2>
          <p>{error}</p>

          <button
            onClick={() => navigate("/events")}
            className="event-secondary-button"
          >
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-page-new">

      {/* NAVBAR */}

      <header className="event-navbar">

        <div
          className="event-logo"
          onClick={() => navigate("/participant-home")}
        >
          EventSphere
        </div>

        <nav className="event-nav">

          <button
            onClick={() => navigate("/events")}
          >
            Events
          </button>

          {token ? (
            <>
              <button
                onClick={handleDashboard}
              >
                {userRole === "organizer"
                  ? "My Events"
                  : "Dashboard"}
              </button>

              <span className="event-user">
                Hi, {userName}
              </span>

              <button
                className="event-logout"
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
                className="event-get-started"
                onClick={() => navigate("/register")}
              >
                Get Started
              </button>
            </>
          )}

        </nav>

      </header>

      {/* CONTENT */}

      <main className="event-details-main">

        <button
          className="event-back-button"
          onClick={() => navigate("/events")}
        >
          ← Back to Events
        </button>

        {/* HERO */}

        <section className="event-hero">

          <div
            className="event-hero-image"
            style={
              event.image_url
                ? {
                    backgroundImage: `url(${event.image_url})`,
                  }
                : undefined
            }
          >

            {!event.image_url && (
              <div className="event-hero-placeholder">
                <span>EVENT</span>
              </div>
            )}

            <div className="event-hero-overlay"></div>

            <div className="event-hero-content">

              <span className="event-hero-category">
                {event.category}
              </span>

              <span className="event-hero-capacity">
                {event.capacity} seats
              </span>

            </div>

          </div>

        </section>

        {/* EVENT INFORMATION */}

        <section className="event-main-card">

          <div className="event-title-section">

            <h1>
              {event.name}
            </h1>

            <p>
              {event.description ||
                "Join this exciting EventSphere event and enjoy an amazing experience."}
            </p>

          </div>

          {/* INFORMATION GRID */}

          <div className="event-info-grid">

            <div className="event-info-box">

              <div className="event-info-icon">
                📅
              </div>

              <div>
                <span>DATE</span>
                <strong>
                  {event.date}
                </strong>
              </div>

            </div>

            <div className="event-info-box">

              <div className="event-info-icon">
                🕐
              </div>

              <div>
                <span>TIME</span>
                <strong>
                  {event.start_time} –{" "}
                  {event.end_time}
                </strong>
              </div>

            </div>

            <div className="event-info-box">

              <div className="event-info-icon">
                📍
              </div>

              <div>
                <span>VENUE</span>
                <strong>
                  {event.venue}
                </strong>
              </div>

            </div>

            <div className="event-info-box">

              <div className="event-info-icon">
                🎟️
              </div>

              <div>
                <span>CAPACITY</span>
                <strong>
                  {event.capacity} people
                </strong>
              </div>

            </div>

          </div>

          {/* REGISTRATION */}

          <div className="event-registration-section">

            <div className="event-deadline">

              <span>
                REGISTRATION DEADLINE
              </span>

              <strong>
                📅 {event.registration_deadline}
              </strong>

            </div>

            <div className="event-registration-action">

              {error && (
                <div className="event-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="event-success">
                  ✓ {message}
                </div>
              )}

              <button
                className="event-register-large"
                onClick={handleRegister}
                disabled={
                  registering || !!message
                }
              >
                {registering
                  ? "Registering..."
                  : message
                  ? "Registered ✓"
                  : "Register Now"}
              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default EventDetails;

