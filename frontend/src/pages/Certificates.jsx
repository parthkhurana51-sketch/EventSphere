import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function Certificates() {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userName = localStorage.getItem("user_name");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/certificates/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load certificates"
          );
        }

        setCertificates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [navigate, token]);

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    localStorage.clear();
    navigate("/");
  };

  const openCertificate = (certificateUrl) => {
    if (!certificateUrl) return;

    window.open(
      `${API_BASE_URL}${certificateUrl}`,
      "_blank"
    );
  };

  return (
    <div className="certificates-page">

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
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="active-nav-button"
            onClick={() => navigate("/certificates")}
          >
            Certificates
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

      <main className="certificates-container">

        <section className="certificates-hero">

          <div>

            <p className="dashboard-label">
              ACHIEVEMENTS
            </p>

            <h1>
              My Certificates
            </h1>

            <p>
              View and download certificates you've earned
              through EventSphere events.
            </p>

          </div>

          <div className="certificate-count-card">

            <span>
              CERTIFICATES EARNED
            </span>

            <strong>
              {certificates.length}
            </strong>

          </div>

        </section>

        {loading && (
          <div className="dashboard-message">
            Loading your certificates...
          </div>
        )}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          certificates.length === 0 && (

            <div className="certificate-empty">

              <div className="certificate-empty-icon">
                🏆
              </div>

              <h2>
                No certificates yet
              </h2>

              <p>
                Attend an event to become eligible for a
                certificate.
              </p>

              <button
                className="event-register-button"
                onClick={() => navigate("/events")}
              >
                Explore Events
              </button>

            </div>
          )}

        {!loading &&
          !error &&
          certificates.length > 0 && (

            <section className="certificates-grid">

              {certificates.map((certificate) => (

                <article
                  className="certificate-card"
                  key={certificate.certificate_id}
                >

                  <div className="certificate-card-top">

                    <div className="certificate-seal">
                      ✓
                    </div>

                    <span>
                      VERIFIED CERTIFICATE
                    </span>

                  </div>

                  <div className="certificate-card-body">

                    <p className="certificate-label">
                      CERTIFICATE OF PARTICIPATION
                    </p>

                    <h2>
                      {certificate.event_name}
                    </h2>

                    <div className="certificate-details">

                      <div>
                        <span>EVENT DATE</span>
                        <strong>
                          {certificate.event_date}
                        </strong>
                      </div>

                      <div>
                        <span>VENUE</span>
                        <strong>
                          {certificate.venue}
                        </strong>
                      </div>

                      <div>
                        <span>ISSUED</span>
                        <strong>
                          {new Date(
                            certificate.issued_at
                          ).toLocaleDateString()}
                        </strong>
                      </div>

                    </div>

                    <div className="certificate-id">
                      <span>
                        CERTIFICATE ID
                      </span>

                      <strong>
                        {certificate.certificate_id}
                      </strong>
                    </div>

                  </div>

                  <div className="certificate-card-footer">

                    <button
                      className="certificate-view-button"
                      onClick={() =>
                        openCertificate(
                          certificate.certificate_url
                        )
                      }
                    >
                      View Certificate
                    </button>

                    <button
                      className="certificate-download-button"
                      onClick={() =>
                        openCertificate(
                          certificate.certificate_url
                        )
                      }
                    >
                      Download PDF
                    </button>

                  </div>

                </article>

              ))}

            </section>
          )}

      </main>

    </div>
  );
}

export default Certificates;

