import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function OrganizerHome() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    total_events: 0,
    total_registrations: 0,
    checked_in: 0,
    attendance_percentage: 0,
  });

  const [loading, setLoading] = useState(true);

  const userName = localStorage.getItem("user_name");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchHomeData = async () => {
      try {
        const eventsResponse = await fetch(
          "http://127.0.0.1:8000/api/events/"
        );

        const eventsData =
          await eventsResponse.json();

        if (eventsResponse.ok) {
          const userId = Number(
            localStorage.getItem("user_id")
          );

          const organizerEvents =
            eventsData.filter(
              (event) =>
                event.organizer_id === userId
            );

          setEvents(organizerEvents);
        }

        const statsResponse = await fetch(
          "http://127.0.0.1:8000/api/registrations/organizer/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const statsData =
          await statsResponse.json();

        if (statsResponse.ok) {
          setStats(statsData);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

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
    <div className="organizer-home">

      {/* NAVBAR */}

      <header className="organizer-home-navbar">

        <div
          className="organizer-home-logo"
          onClick={() =>
            navigate("/organizer-home")
          }
        >
          EventSphere
        </div>

        <nav className="organizer-home-nav">

          <button
            className="organizer-home-active"
            onClick={() =>
              navigate("/organizer-home")
            }
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
            onClick={() =>
              navigate("/organizer/attendance")
            }
          >
            Attendance
          </button>

        </nav>

        <div className="organizer-home-account">

          <span>
            Hi, {userName}
          </span>

          <button
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="organizer-home-content">

        {/* HERO */}

        <section className="organizer-home-hero">

          <div className="organizer-home-hero-text">

            <span>
              ORGANIZER HOME
            </span>

            <h1>
              Build events people
              <br />
              remember.
            </h1>

            <p>
              Create experiences, manage
              registrations and keep your
              events running smoothly.
            </p>

            <div className="organizer-home-actions">

              <button
                className="organizer-primary-button"
                onClick={() =>
                  navigate(
                    "/organizer/create-event"
                  )
                }
              >
                + Create Event
              </button>

              <button
                className="organizer-secondary-button"
                onClick={() =>
                  navigate("/organizer")
                }
              >
                Manage My Events →
              </button>

            </div>

          </div>

          <div className="organizer-home-visual">

            <div className="organizer-visual-card">

              <div className="organizer-visual-top">
                <span>
                  EVENTSPHERE
                </span>

                <span>
                  ORGANIZER
                </span>
              </div>

              <div className="organizer-visual-number">
                {stats.total_events
                  .toString()
                  .padStart(2, "0")}
              </div>

              <div className="organizer-visual-label">
                EVENTS CREATED
              </div>

              <div className="organizer-visual-line"></div>

              <div className="organizer-visual-footer">
                <span>
                  {stats.total_registrations}
                  {" "}registrations
                </span>

                <span>
                  {stats.attendance_percentage}%
                  {" "}attendance
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* STATISTICS */}

        <section className="organizer-statistics">

          <div className="organizer-stat">

            <span>
              EVENTS
            </span>

            <strong>
              {stats.total_events}
            </strong>

            <p>
              Total events
            </p>

          </div>

          <div className="organizer-stat">

            <span>
              REGISTRATIONS
            </span>

            <strong>
              {stats.total_registrations}
            </strong>

            <p>
              Across your events
            </p>

          </div>

          <div className="organizer-stat">

            <span>
              ATTENDANCE
            </span>

            <strong>
              {stats.attendance_percentage}%
            </strong>

            <p>
              Overall attendance
            </p>

          </div>

        </section>

        {/* EVENTS */}

        <section className="organizer-home-events">

          <div className="organizer-section-heading">

            <div>

              <span>
                YOUR EVENTS
              </span>

              <h2>
                Recently created
              </h2>

            </div>

            <button
              onClick={() =>
                navigate("/organizer")
              }
            >
              View all →
            </button>

          </div>

          {loading ? (

            <div className="organizer-home-message">
              Loading your events...
            </div>

          ) : events.length === 0 ? (

            <div className="organizer-home-empty">

              <div className="organizer-empty-icon">
                +
              </div>

              <h3>
                Create your first event
              </h3>

              <p>
                Start building an experience
                for your participants.
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/organizer/create-event"
                  )
                }
              >
                Create Event
              </button>

            </div>

          ) : (

            <div className="organizer-event-list">

              {events.slice(0, 4).map(
                (event) => (

                  <article
                    className="organizer-event-row"
                    key={event.id}
                  >

                    <div className="organizer-event-date">

                      <span>
                        {event.date
                          ? event.date
                              .split("-")[2]
                          : "--"}
                      </span>

                      <small>
                        {event.date
                          ? event.date
                              .split("-")[1]
                          : "---"}
                      </small>

                    </div>

                    <div className="organizer-event-details">

                      <span>
                        {event.category}
                      </span>

                      <h3>
                        {event.name}
                      </h3>

                      <p>
                        📍 {event.venue}
                      </p>

                    </div>

                    <div className="organizer-event-capacity">

                      <strong>
                        {event.capacity}
                      </strong>

                      <span>
                        seats
                      </span>

                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/organizer/events/${event.id}`
                        )
                      }
                    >
                      Manage →
                    </button>

                  </article>

                )
              )}

            </div>

          )}

        </section>

        {/* QUICK ACTIONS */}

        <section className="organizer-quick-actions">

          <button
            onClick={() =>
              navigate(
                "/organizer/create-event"
              )
            }
          >
            <span>＋</span>

            <div>
              <strong>
                Create Event
              </strong>

              <small>
                Start a new experience
              </small>
            </div>
          </button>

          <button
            onClick={() =>
              navigate("/organizer")
            }
          >
            <span>◫</span>

            <div>
              <strong>
                Manage Events
              </strong>

              <small>
                Edit and monitor events
              </small>
            </div>
          </button>

          <button
            onClick={() =>
              navigate(
                "/organizer/attendance"
              )
            }
          >
            <span>✓</span>

            <div>
              <strong>
                Attendance
              </strong>

              <small>
                Check in participants
              </small>
            </div>
          </button>

        </section>

      </main>

    </div>
  );
}

export default OrganizerHome;