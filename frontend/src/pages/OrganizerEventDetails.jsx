import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackToTop from "../components/BackToTop";

function OrganizerEventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [issuingCertificate, setIssuingCertificate] =
    useState(null);

  const token = localStorage.getItem("access_token");
  const userName = localStorage.getItem("user_name");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const eventResponse = await fetch(
          `http://127.0.0.1:8000/api/events/${id}`
        );

        const eventData = await eventResponse.json();

        if (!eventResponse.ok) {
          throw new Error(
            eventData.detail || "Failed to load event"
          );
        }

        setEvent(eventData);

        const registrationResponse = await fetch(
          `http://127.0.0.1:8000/api/registrations/event/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const registrationData =
          await registrationResponse.json();

        if (!registrationResponse.ok) {
          throw new Error(
            registrationData.detail ||
              "Failed to load registrations"
          );
        }

        setRegistrations(registrationData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, token]);

  const checkedIn = registrations.filter(
    (registration) =>
      registration.status === "checked_in"
  ).length;

  const certificatesIssued = registrations.filter(
    (registration) =>
      registration.certificate_issued
  ).length;

  const attendancePercentage =
    registrations.length > 0
      ? Math.round(
          (checkedIn / registrations.length) * 100
        )
      : 0;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/events/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete event"
        );
      }

      navigate("/organizer");

    } catch (err) {
      setError(err.message);
    }
  };

  const handleIssueCertificate = async (
    registrationId
  ) => {
    const confirmed = window.confirm(
      "Issue a certificate to this participant?"
    );

    if (!confirmed) {
      return;
    }

    setIssuingCertificate(registrationId);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/certificates/issue/${registrationId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to issue certificate"
        );
      }

      // Update only this participant
      setRegistrations((currentRegistrations) =>
        currentRegistrations.map((registration) =>
          registration.registration_id ===
          registrationId
            ? {
                ...registration,
                certificate_issued: true,
                certificate_id:
                  data.certificate_id,
                certificate_url:
                  data.certificate_url,
                certificate_issued_at:
                  data.issued_at,
              }
            : registration
        )
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIssuingCertificate(null);
    }
  };

  const handleViewCertificate = (
    certificateUrl
  ) => {
    if (!certificateUrl) {
      return;
    }

    window.open(
      `http://127.0.0.1:8000${certificateUrl}`,
      "_blank"
    );
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

  if (loading) {
    return (
      <div className="dashboard-message">
        Loading event...
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-content">
          <div className="auth-error">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =================================================
          NAVBAR
          ================================================= */}

      <header className="dashboard-navbar">

        <div
          className="logo"
          onClick={() =>
            navigate("/organizer-home")
          }
        >
          EventSphere
        </div>

        <nav className="dashboard-nav-links">

          <button
            onClick={() =>
              navigate("/organizer-home")
            }
          >
            Home
          </button>

          <button
            onClick={() =>
              navigate("/events")
            }
          >
            Events
          </button>

          <button
            onClick={() =>
              navigate("/organizer")
            }
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

        <div className="dashboard-user">

          <span>
            Hi, {userName}
          </span>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
          ================================================= */}

      <main className="dashboard-content">

        <button
          className="back-button"
          onClick={() =>
            navigate("/organizer")
          }
        >
          ← Back to My Events
        </button>


        {/* =================================================
            EVENT HEADER
            ================================================= */}

        <section className="dashboard-welcome">

          <div>

            <p className="dashboard-label">
              EVENT MANAGEMENT
            </p>

            <h1>
              {event.name}
            </h1>

            <p>
              Manage registrations, attendance
              and certificates for this event.
            </p>

          </div>

          <div className="organizer-actions">

            <button
              className="attendance-button"
              onClick={() =>
                navigate(
                  "/organizer/attendance"
                )
              }
            >
              ✓ Attendance
            </button>

            <button
              className="create-event-button"
              onClick={() =>
                navigate(
                  `/organizer/events/${id}/edit`
                )
              }
            >
              ✏ Edit Event
            </button>

            <button
              className="delete-event-button"
              onClick={handleDelete}
            >
              🗑 Delete Event
            </button>

          </div>

        </section>


        {/* =================================================
            ERROR
            ================================================= */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        {/* =================================================
            STATISTICS
            ================================================= */}

        <section className="dashboard-stats">

          <div className="stat-card">

            <span>
              Registrations
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
              {checkedIn}
            </strong>

          </div>


          <div className="stat-card">

            <span>
              Attendance
            </span>

            <strong>
              {attendancePercentage}%
            </strong>

          </div>


          <div className="stat-card">

            <span>
              Certificates
            </span>

            <strong>
              {certificatesIssued}
            </strong>

          </div>

        </section>


        {/* =================================================
            EVENT INFORMATION
            ================================================= */}

        <section className="dashboard-section">

          <div className="section-title">

            <p>
              EVENT INFORMATION
            </p>

            <h2>
              Event Details
            </h2>

          </div>


          <div className="registration-card">

            <div className="registration-info">

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

              <p>
                👥 Capacity:{" "}
                {event.capacity}
              </p>

              <p>
                🏷️ Category:{" "}
                {event.category}
              </p>

              <p>
                📜 Registration Deadline:{" "}
                {event.registration_deadline}
              </p>

            </div>


            {event.description && (
              <p className="event-description">
                {event.description}
              </p>
            )}

          </div>

        </section>


        {/* =================================================
            PARTICIPANTS
            ================================================= */}

        <section className="dashboard-section">

          <div className="section-title">

            <p>
              PARTICIPANTS
            </p>

            <h2>
              Registered Participants
            </h2>

          </div>


          {registrations.length === 0 ? (

            <div className="dashboard-message">

              <h3>
                No participants yet
              </h3>

              <p>
                Participants will appear here
                after registering for this event.
              </p>

            </div>

          ) : (

            <div className="registration-grid">

              {registrations.map(
                (registration) => (

                  <div
                    className="registration-card"
                    key={
                      registration.registration_id
                    }
                  >

                    {/* TOP */}

                    <div className="registration-top">

                      <span className="registration-id-label">
                            ES-REG-{String(
                                registration.registration_id
                            ).padStart(4, "0")}
                        </span>

                      <span
                        className={
                          registration.status ===
                          "checked_in"
                            ? "checked-status"
                            : "registered-status"
                        }
                      >
                        {
                          registration.status ===
                          "checked_in"
                            ? "Checked In"
                            : "Registered"
                        }
                      </span>

                    </div>


                    {/* NAME */}

                    <h3>
                      {registration.user_name}
                    </h3>


                    {/* INFORMATION */}

                    <div className="registration-info">

                        <p>
                            📧 {registration.user_email}
                        </p>

                        <p>
                            📅 Registered{" "}
                            {new Date(
                                registration.registration_date
                            ).toLocaleDateString()}
                        </p>

                    </div>


                    {/* CERTIFICATE */}

                    <div className="certificate-organizer-section">

                      {registration.certificate_issued ? (

                        <>

                          <div className="certificate-issued">

                            <span>
                              🏆 Certificate Issued
                            </span>

                            <strong>
                              {
                                registration.certificate_id
                              }
                            </strong>

                          </div>


                          <button
                            className="certificate-view-button"
                            onClick={() =>
                              handleViewCertificate(
                                registration.certificate_url
                              )
                            }
                          >
                            View Certificate
                          </button>

                        </>

                      ) : registration.status ===
                        "checked_in" ? (

                        <button
                          className="certificate-issue-button"
                          onClick={() =>
                            handleIssueCertificate(
                              registration.registration_id
                            )
                          }
                          disabled={
                            issuingCertificate ===
                            registration.registration_id
                          }
                        >
                          {issuingCertificate ===
                          registration.registration_id
                            ? "Issuing Certificate..."
                            : "🏆 Issue Certificate"}
                        </button>

                      ) : (

                        <div className="certificate-not-eligible">

                          <span>
                            Certificate unavailable
                          </span>

                          <small>
                            Participant must check in
                            first.
                          </small>

                        </div>

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>
     <BackToTop />
    </div>
  );
}

export default OrganizerEventDetails;