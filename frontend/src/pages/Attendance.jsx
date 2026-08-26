import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function Attendance() {
  const navigate = useNavigate();

  const [qrToken, setQrToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const userName = localStorage.getItem("user_name");

  const handleCheckIn = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!qrToken.trim()) {
      setError("Please enter a QR token.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/registrations/check-in?qr_token=${encodeURIComponent(
          qrToken.trim()
        )}`,
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
          data.detail || "Check-in failed"
        );
      }

      setMessage(
        `Participant checked in successfully! Registration #${data.registration_id}`
      );

      setQrToken("");

    } catch (err) {
      setError(err.message);

    } finally {
      setLoading(false);
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

  return (
    <div className="attendance-page">

      {/* NAVBAR */}

      <header className="attendance-navbar">

        <div
          className="attendance-logo"
          onClick={() =>
            navigate("/organizer-home")
          }
        >
          EventSphere
        </div>

        <nav className="attendance-nav">

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

          <button className="attendance-nav-active">
            Attendance
          </button>

        </nav>

        <div className="attendance-account">

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

      {/* CONTENT */}

      <main className="attendance-content">

        <section className="attendance-intro">

          <span>
            EVENT ATTENDANCE
          </span>

          <h1>
            Check in your
            <br />
            participants.
          </h1>

          <p>
            Verify registrations quickly and keep
            your event attendance up to date.
          </p>

        </section>

        {/* CHECK-IN CARD */}

        <section className="attendance-workspace">

          <div className="attendance-card">

            {/* QR AREA */}

            <div className="attendance-scanner">

              <div className="scanner-frame">

                <div className="scanner-corner top-left"></div>
                <div className="scanner-corner top-right"></div>
                <div className="scanner-corner bottom-left"></div>
                <div className="scanner-corner bottom-right"></div>

                <div className="scanner-qr">
                  QR
                </div>

              </div>

              <span className="scanner-label">
                QR CHECK-IN
              </span>

              <p>
                Camera scanning will be added later.
              </p>

            </div>

            {/* DIVIDER */}

            <div className="attendance-or">

              <span>
                OR
              </span>

            </div>

            {/* MANUAL CHECK-IN */}

            <form
              className="attendance-form"
              onSubmit={handleCheckIn}
            >

              <div className="attendance-form-heading">

                <span>
                  MANUAL CHECK-IN
                </span>

                <h2>
                  Enter participant token
                </h2>

                <p>
                  Use the QR token displayed in the
                  participant's registration.
                </p>

              </div>

              <div className="attendance-input-wrapper">

                <label htmlFor="qr-token">
                  QR TOKEN
                </label>

                <input
                  id="qr-token"
                  type="text"
                  value={qrToken}
                  onChange={(e) =>
                    setQrToken(e.target.value)
                  }
                  placeholder="Paste participant QR token"
                  autoComplete="off"
                />

              </div>

              {error && (
                <div className="attendance-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="attendance-success">
                  <span>✓</span>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="attendance-check-button"
                disabled={loading}
              >
                {loading
                  ? "Checking In..."
                  : "Check In Participant →"}
              </button>

            </form>

          </div>

        </section>

        {/* INFO */}

        <section className="attendance-info-grid">

          <div className="attendance-info-card">

            <span>
              01
            </span>

            <div>

              <h3>
                Get the token
              </h3>

              <p>
                Ask the participant to show the
                QR token from their registration.
              </p>

            </div>

          </div>

          <div className="attendance-info-card">

            <span>
              02
            </span>

            <div>

              <h3>
                Enter the token
              </h3>

              <p>
                Paste the token into the check-in
                field above.
              </p>

            </div>

          </div>

          <div className="attendance-info-card">

            <span>
              03
            </span>

            <div>

              <h3>
                Confirm attendance
              </h3>

              <p>
                A successful check-in updates the
                participant's registration.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Attendance;