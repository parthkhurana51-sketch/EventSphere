import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function Dashboard() {
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userName = localStorage.getItem("user_name");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchRegistrations = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/registrations/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load registrations"
          );
        }

        setRegistrations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
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

  const checkedInCount = registrations.filter(
    (registration) =>
      registration.status === "checked_in"
  ).length;

  const upcomingCount = registrations.filter(
    (registration) =>
      registration.status !== "checked_in"
  ).length;

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}

      <header className="dashboard-navbar">

        <div
          className="logo"
          onClick={() => navigate("/participant-home")}
        >
          EventSphere
        </div>

        <nav className="dashboard-nav-links">

            <button
                onClick={() => navigate("/participant-home")}
            >
                Home
            </button>

            <button
                onClick={() => navigate("/events")}
            >
                Events
            </button>
            <button
            onClick={() => navigate("/certificates")}
            >
            Certificates
            </button>
            <button
                onClick={() => {
                document
                    .getElementById("my-registrations")
                    ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    });
                }}
            >
                My Registrations
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

      {/* MAIN CONTENT */}

      <main className="dashboard-content">

        {/* WELCOME */}

        <section className="dashboard-welcome">

          <div>

            <p className="dashboard-label">
              PARTICIPANT DASHBOARD
            </p>

            <h1>
              Welcome back, {userName} 👋
            </h1>

            <p>
              Manage your events and registrations
              from one place.
            </p>

          </div>

        </section>

        {/* STATISTICS */}

        <section className="dashboard-stats">

          <div className="stat-card">

            <span>
              My Registrations
            </span>

            <strong>
              {registrations.length}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              Checked In
            </span>

            <strong>
              {checkedInCount}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              Upcoming Events
            </span>

            <strong>
              {upcomingCount}
            </strong>

          </div>

        </section>

        {/* REGISTRATIONS */}

        <section className="dashboard-section" id="my-registrations"  >

          <div className="section-title">

            <p>
              YOUR EVENTS
            </p>

            <h2>
              My Registrations
            </h2>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="dashboard-message">
              Loading your registrations...
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            registrations.length === 0 && (

              <div className="dashboard-message">

                <h3>
                  No event registrations yet
                </h3>

                <p>
                  Discover an event and register
                  to see it here.
                </p>

                <button
                  className="event-register-button"
                  onClick={() =>
                    navigate("/events")
                  }
                >
                  Explore Events
                </button>

              </div>

          )}

          {/* REGISTRATION CARDS */}

          {!loading &&
            !error &&
            registrations.length > 0 && (

              <div className="registration-grid">

                {registrations.map(
                  (registration) => (

                    <div
                      className="registration-card"
                      key={
                        registration.registration_id
                      }
                    >

                      <div className="registration-top">

                        <span className="event-category">
                          {registration.category}
                        </span>

                        <span
                          className={
                            registration.status ===
                            "checked_in"
                              ? "checked-status"
                              : "registered-status"
                          }
                        >
                          {registration.status ===
                          "checked_in"
                            ? "Checked In"
                            : "Registered"}
                        </span>

                      </div>

                      <h3>
                        {registration.event_name}
                      </h3>

                      <div className="registration-info">

                        <p>
                          📅{" "}
                          {registration.date}
                        </p>

                        <p>
                          🕐{" "}
                          {registration.start_time}
                          {" – "}
                          {registration.end_time}
                        </p>

                        <p>
                          📍{" "}
                          {registration.venue}
                        </p>

                      </div>

                      <div className="registration-footer">

                            <span>
                                Registration #{registration.registration_id}
                            </span>

                            <div className="registration-actions">

                                <button
                                className="manage-event-button"
                                onClick={() =>
                                    navigate(
                                    `/events/${registration.event_id}`
                                    )
                                }
                                >
                                View Event
                                </button>

                                <button
                                className="qr-button"
                                onClick={() =>
                                    window.open(
                                    `http://127.0.0.1:8000${registration.qr_code_url}`,
                                    "_blank"
                                    )
                                }
                                >
                                View QR
                                </button>

                            </div>

                        </div>

                    </div>

                  )
                )}

              </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;