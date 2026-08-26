import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function ParticipantHome() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = localStorage.getItem("user_name");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/events/`
        );

        const data = await response.json();

        if (response.ok) {
          setEvents(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate, token]);

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    localStorage.clear();
    navigate("/");
  };

  const featuredEvent = events[0];
  const otherEvents = events.slice(1, 4);

  return (
    <div className="participant-home">

      {/* NAVBAR */}

      <header className="home-navbar">

        <div
          className="home-logo"
          onClick={() => navigate("/participant-home")}
        >
          EventSphere
        </div>

        <nav className="home-nav">

            <button
                className="home-nav-active"
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
                onClick={() => navigate("/dashboard")}
            >
                Dashboard
            </button>

        </nav>

        <div className="home-account">

          <span>
            {userName}
          </span>

          <button
            onClick={handleLogout}
            className="home-logout"
          >
            Logout
          </button>

        </div>

      </header>

      {/* HERO */}

      <main>

        <section className="participant-hero">

          <div className="participant-hero-content">

            <span className="home-eyebrow">
              YOUR EVENT UNIVERSE
            </span>

            <h1>
              Discover experiences
              <br />
              worth showing up for.
            </h1>

            <p>
              Find workshops, competitions, conferences
              and experiences happening around you.
            </p>

            <div className="participant-hero-actions">

              <button
                className="home-primary-button"
                onClick={() => navigate("/events")}
              >
                Explore Events
                <span>→</span>
              </button>

              <button
                className="home-text-button"
                onClick={() => navigate("/dashboard")}
              >
                View my registrations
              </button>

            </div>

          </div>

          {/* FEATURED EVENT */}

          {featuredEvent && (

            <div className="featured-event">

              <div
                className="featured-event-image"
                style={
                  featuredEvent.image_url
                    ? {
                        backgroundImage:
                          `url(${featuredEvent.image_url})`
                      }
                    : undefined
                }
              >

                {!featuredEvent.image_url && (
                  <span>
                    EVENT
                  </span>
                )}

                <div className="featured-overlay"></div>

                <div className="featured-event-label">
                  FEATURED
                </div>

              </div>

              <div className="featured-event-content">

                <span>
                  {featuredEvent.category}
                </span>

                <h2>
                  {featuredEvent.name}
                </h2>

                <p>
                  📅 {featuredEvent.date}
                </p>

                <button
                  onClick={() =>
                    navigate(
                      `/events/${featuredEvent.id}`
                    )
                  }
                >
                  Discover Event →
                </button>

              </div>

            </div>

          )}

        </section>

        {/* EVENTS */}

        <section className="participant-events-section">

          <div className="home-section-heading">

            <div>

              <span>
                DISCOVER
              </span>

              <h2>
                Upcoming experiences
              </h2>

            </div>

            <button
              onClick={() => navigate("/events")}
            >
              View all events →
            </button>

          </div>

          {loading ? (

            <div className="home-loading">
              Loading experiences...
            </div>

          ) : otherEvents.length === 0 ? (

            <div className="home-empty">
              <h3>
                More experiences are coming soon.
              </h3>

              <p>
                Check back later for new EventSphere events.
              </p>
            </div>

          ) : (

            <div className="participant-event-grid">

              {otherEvents.map((event) => (

                <article
                  className="participant-event-card"
                  key={event.id}
                >

                  <div
                    className="participant-event-image"
                    style={
                      event.image_url
                        ? {
                            backgroundImage:
                              `url(${event.image_url})`
                          }
                        : undefined
                    }
                  >

                    {!event.image_url && (
                      <span>
                        {event.category}
                      </span>
                    )}

                  </div>

                  <div className="participant-event-body">

                    <div className="participant-event-meta">

                      <span>
                        {event.category}
                      </span>

                      <span>
                        {event.date}
                      </span>

                    </div>

                    <h3>
                      {event.name}
                    </h3>

                    <p>
                      {event.description ||
                        "An exciting EventSphere experience."}
                    </p>

                    <div className="participant-event-footer">

                      <span>
                        📍 {event.venue}
                      </span>

                      <button
                        onClick={() =>
                          navigate(
                            `/events/${event.id}`
                          )
                        }
                      >
                        View →
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        {/* BOTTOM CTA */}

        <section className="participant-cta">

          <div>

            <span>
              FIND YOUR NEXT EXPERIENCE
            </span>

            <h2>
              There's always something
              happening.
            </h2>

          </div>

          <button
            onClick={() => navigate("/events")}
          >
            Browse All Events →
          </button>

        </section>

      </main>

    </div>
  );
}

export default ParticipantHome;

