import "../App.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function Home() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/events/"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load events"
          );
        }

        setEvents(data);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        events
          .map((event) => event.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory =
        selectedCategory === "All" ||
        event.category === selectedCategory;

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        event.name?.toLowerCase().includes(searchText) ||
        event.description
          ?.toLowerCase()
          .includes(searchText) ||
        event.venue?.toLowerCase().includes(searchText) ||
        event.category
          ?.toLowerCase()
          .includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [events, search, selectedCategory]);

  const featuredEvents = events.slice(0, 3);

  const handleHostEvent = () => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      navigate("/register");
      return;
    }

    if (role === "organizer") {
      navigate("/organizer/create-event");
      return;
    }

    navigate("/register");
  };

  return (
    <div className="public-home">

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <header className="public-navbar">

        <div
          className="public-logo"
          onClick={() => navigate("/")}
        >
          EventSphere
        </div>

        <nav className="public-nav-links">

          <button
            onClick={() => navigate("/events")}
          >
            Events
          </button>

          <a href="#discover">
            Discover
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

          <a href="#about">
            About
          </a>

        </nav>

        <div className="public-nav-actions">

          <button
            className="public-login"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>

          <button
            className="public-get-started"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>

        </div>

      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <main>

        <section className="public-hero">

          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="public-hero-content">

            <div className="public-eyebrow">
              <span className="eyebrow-dot" />
              THE MODERN EVENT EXPERIENCE
            </div>

            <h1>
              Discover what's
              <br />
              <span>happening.</span>
            </h1>

            <p>
              Find workshops, conferences, competitions,
              meetups and experiences worth showing up for.
              Discover something new and make it memorable.
            </p>

            <div className="public-hero-actions">

              <button
                className="public-primary-btn"
                onClick={() => navigate("/events")}
              >
                Explore Events
                <span>→</span>
              </button>

              <button
                className="public-secondary-btn"
                onClick={handleHostEvent}
              >
                Host an Event
              </button>

            </div>

            <div className="public-hero-stats">

              <div className="hero-stat">
                <strong>
                  {events.length}+
                </strong>
                <span>
                  Events
                </span>
              </div>

              <div className="hero-stat-divider" />

              <div className="hero-stat">
                <strong>
                  QR
                </strong>
                <span>
                  Fast Check-In
                </span>
              </div>

              <div className="hero-stat-divider" />

              <div className="hero-stat">
                <strong>
                  1
                </strong>
                <span>
                  Simple Platform
                </span>
              </div>

            </div>

          </div>

          {/* HERO VISUAL */}

          <div className="hero-visual">

            <div className="hero-floating-card hero-floating-top">

              <span className="floating-icon">
                ✦
              </span>

              <div>
                <strong>
                  Discover
                </strong>

                <small>
                  Your next experience
                </small>
              </div>

            </div>

            <div className="hero-event-card">

              <div className="hero-event-art">

                <div className="hero-art-circle circle-one" />
                <div className="hero-art-circle circle-two" />
                <div className="hero-art-circle circle-three" />

                <span className="hero-event-badge">
                  FEATURED
                </span>

                <span className="hero-event-category">
                  {featuredEvents[0]?.category ||
                    "EVENT"}
                </span>

                <div className="hero-event-art-text">
                  <span>
                    EVENTSPHERE
                  </span>

                  <strong>
                    EXPERIENCE
                  </strong>
                </div>

              </div>

              <div className="hero-event-content">

                <div className="hero-event-date">
                  {featuredEvents[0]?.date ||
                    "UPCOMING EVENT"}
                </div>

                <h2>
                  {featuredEvents[0]?.name ||
                    "Your next experience starts here."}
                </h2>

                <p>
                  {featuredEvents[0]?.description ||
                    "Explore exciting events and discover something worth attending."}
                </p>

                <div className="hero-event-details">

                  <span>
                    📍{" "}
                    {featuredEvents[0]?.venue ||
                      "Multiple venues"}
                  </span>

                  <span>
                    👥{" "}
                    {featuredEvents[0]?.capacity ||
                      "Open"}{" "}
                    seats
                  </span>

                </div>

                {featuredEvents[0] && (
                  <button
                    onClick={() =>
                      navigate(
                        `/events/${featuredEvents[0].id}`
                      )
                    }
                  >
                    View Featured Event →
                  </button>
                )}

              </div>

            </div>

            <div className="hero-floating-card hero-floating-bottom">

              <span className="floating-check">
                ✓
              </span>

              <div>
                <strong>
                  Easy Registration
                </strong>

                <small>
                  Register in seconds
                </small>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            DISCOVER
            ===================================================== */}

        <section
          className="public-discovery"
          id="discover"
        >

          <div className="public-section-heading">

            <div>

              <span>
                EXPLORE EXPERIENCES
              </span>

              <h2>
                Find something
                <br />
                worth showing up for.
              </h2>

            </div>

            <button
              onClick={() => navigate("/events")}
            >
              View all events
              <span>→</span>
            </button>

          </div>

          {/* SEARCH */}

          <div className="public-search-wrapper">

            <div className="public-search-box">

              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search events, categories or venues..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  className="search-clear"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}

            </div>

          </div>

          {/* CATEGORY FILTER */}

          <div className="public-category-list">

            {categories.map((category) => (

              <button
                key={category}
                className={
                  selectedCategory === category
                    ? "active-category"
                    : ""
                }
                onClick={() =>
                  setSelectedCategory(category)
                }
              >
                {category}
              </button>

            ))}

          </div>

          {/* EVENT GRID */}

          {loading ? (

            <div className="public-events-message">
              <div className="loading-circle" />
              <p>
                Discovering events...
              </p>
            </div>

          ) : filteredEvents.length === 0 ? (

            <div className="public-events-message">

              <div className="empty-icon">
                ✦
              </div>

              <h3>
                Nothing found
              </h3>

              <p>
                Try another search or explore
                a different category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <div className="public-event-grid">

              {filteredEvents
                .slice(0, 6)
                .map((event, index) => (

                  <article
                    className={`public-event-card event-card-${index + 1}`}
                    key={event.id}
                  >

                    <div className="public-event-image">

                      <div className="event-image-pattern">
                        <span />
                        <span />
                        <span />
                      </div>

                      <div className="event-image-top">

                        <span>
                          {event.category}
                        </span>

                        <small>
                          {event.capacity} seats
                        </small>

                      </div>

                      <div className="event-image-number">
                        0{index + 1}
                      </div>

                    </div>

                    <div className="public-event-body">

                      <div className="public-event-date">
                        📅 {event.date}
                      </div>

                      <h3>
                        {event.name}
                      </h3>

                      <p>
                        {event.description ||
                          "Discover this exciting EventSphere experience."}
                      </p>

                      <div className="public-event-info">

                        <span>
                          📍 {event.venue}
                        </span>

                        <span>
                          🕐 {event.start_time} –{" "}
                          {event.end_time}
                        </span>

                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/events/${event.id}`
                          )
                        }
                      >
                        Explore Event
                        <span>→</span>
                      </button>

                    </div>

                  </article>

                ))}

            </div>

          )}

        </section>

        {/* =====================================================
            EXPERIENCE BANNER
            ===================================================== */}

        <section className="experience-banner">

          <div className="experience-banner-content">

            <span>
              DISCOVER · REGISTER · EXPERIENCE
            </span>

            <h2>
              Events are better
              <br />
              when everything is connected.
            </h2>

            <p>
              From discovering an event to checking in,
              EventSphere keeps the entire experience simple.
            </p>

          </div>

          <div className="experience-banner-visual">

            <div className="experience-orbit orbit-one" />
            <div className="experience-orbit orbit-two" />
            <div className="experience-orbit orbit-three" />

            <div className="experience-center">
              ES
            </div>

          </div>

        </section>

        {/* =====================================================
            HOW IT WORKS
            ===================================================== */}

        <section
          className="public-how-it-works"
          id="how-it-works"
        >

          <div className="public-section-heading centered">

            <div>

              <span>
                HOW EVENTSPHERE WORKS
              </span>

              <h2>
                Simple from start
                <br />
                to finish.
              </h2>

            </div>

          </div>

          <div className="public-steps">

            <div className="public-step">

              <div className="step-top">
                <span>
                  01
                </span>

                <div className="step-icon">
                  ◇
                </div>
              </div>

              <h3>
                Discover
              </h3>

              <p>
                Browse events, explore categories
                and find experiences that interest you.
              </p>

              <div className="step-line" />

            </div>

            <div className="public-step">

              <div className="step-top">
                <span>
                  02
                </span>

                <div className="step-icon">
                  +
                </div>
              </div>

              <h3>
                Register
              </h3>

              <p>
                Choose an event and register in
                just a few simple steps.
              </p>

              <div className="step-line" />

            </div>

            <div className="public-step">

              <div className="step-top">
                <span>
                  03
                </span>

                <div className="step-icon">
                  ✓
                </div>
              </div>

              <h3>
                Experience
              </h3>

              <p>
                Show your QR code at the event and
                enjoy a fast, seamless check-in.
              </p>

              <div className="step-line" />

            </div>

          </div>

        </section>

        {/* =====================================================
            FEATURES
            ===================================================== */}

        <section
          className="public-features"
          id="about"
        >

          <div className="public-section-heading">

            <div>

              <span>
                ONE PLATFORM
              </span>

              <h2>
                Everything events need.
              </h2>

            </div>

            <p>
              EventSphere brings discovery,
              registration and event management
              together in one place.
            </p>

          </div>

          <div className="public-feature-grid">

            <div className="public-feature-card">

              <div className="feature-large-icon">
                ◫
              </div>

              <span>
                01
              </span>

              <h3>
                Event Discovery
              </h3>

              <p>
                Give participants one place to
                discover what's happening.
              </p>

            </div>

            <div className="public-feature-card">

              <div className="feature-large-icon">
                ◇
              </div>

              <span>
                02
              </span>

              <h3>
                Easy Registration
              </h3>

              <p>
                Make registration simple and keep
                participant details organized.
              </p>

            </div>

            <div className="public-feature-card">

              <div className="feature-large-icon">
                ▣
              </div>

              <span>
                03
              </span>

              <h3>
                QR Check-In
              </h3>

              <p>
                Quickly verify registrations and
                keep attendance up to date.
              </p>

            </div>

            <div className="public-feature-card">

              <div className="feature-large-icon">
                ↗
              </div>

              <span>
                04
              </span>

              <h3>
                Event Management
              </h3>

              <p>
                Organizers can create, manage and
                monitor their events.
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            ORGANIZER CTA
            ===================================================== */}

        <section className="public-organizer-cta">

          <div className="organizer-cta-glow" />

          <div className="organizer-cta-content">

            <span>
              FOR EVENT ORGANIZERS
            </span>

            <h2>
              Have an event
              <br />
              worth sharing?
            </h2>

            <p>
              Bring your event to life with EventSphere.
              Create it, manage registrations and make
              attendance effortless.
            </p>

            <button
              onClick={handleHostEvent}
            >
              Start Hosting
              <span>→</span>
            </button>

          </div>

          <div className="organizer-cta-number">
            <span>
              CREATE
            </span>

            <strong>
              01
            </strong>

            <small>
              YOUR NEXT
              <br />
              EXPERIENCE
            </small>
          </div>

        </section>

        {/* =====================================================
            FINAL CTA
            ===================================================== */}

        <section className="public-final-cta">

          <div className="final-cta-orb final-orb-one" />
          <div className="final-cta-orb final-orb-two" />

          <span>
            YOUR NEXT EXPERIENCE IS WAITING
          </span>

          <h2>
            Find something
            <br />
            worth showing up for.
          </h2>

          <p>
            Discover events and make your next
            experience count.
          </p>

          <button
            onClick={() => navigate("/events")}
          >
            Explore All Events
            <span>→</span>
          </button>

        </section>

      </main>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="public-footer">

        <div className="footer-brand">

          <strong>
            EventSphere
          </strong>

          <p>
            Discover. Register. Experience.
          </p>

        </div>

        <div className="footer-column">

          <span>
            EXPLORE
          </span>

          <button
            onClick={() => navigate("/events")}
          >
            Events
          </button>

          <a href="#discover">
            Discover
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

        </div>

        <div className="footer-column">

          <span>
            ACCOUNT
          </span>

          <button
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>

        </div>

        <div className="footer-column">

          <span>
            EVENTSPHERE
          </span>

          <a href="#about">
            About
          </a>

          <button
            onClick={() => navigate("/events")}
          >
            Browse Events
          </button>

        </div>

        <div className="footer-bottom">

          <span>
            © 2026 EventSphere
          </span>

          <span>
            Built for better events.
          </span>

        </div>

      </footer>

    </div>
  );
}

export default Home;