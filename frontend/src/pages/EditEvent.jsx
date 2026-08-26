import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    date: "",
    start_time: "",
    end_time: "",
    venue: "",
    capacity: "",
    registration_deadline: "",
    image_url: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchEvent = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/events/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load event"
          );
        }

        setFormData({
          name: data.name || "",
          description: data.description || "",
          category: data.category || "",
          date: data.date || "",
          start_time: data.start_time || "",
          end_time: data.end_time || "",
          venue: data.venue || "",
          capacity: data.capacity || "",
          registration_deadline:
            data.registration_deadline || "",
          image_url: data.image_url || ""
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/events/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            capacity: Number(formData.capacity)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update event"
        );
      }

      setMessage("Event updated successfully.");

      setTimeout(() => {
        navigate(`/organizer/events/${id}`);
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-message">
        Loading event...
      </div>
    );
  }

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

        <div className="dashboard-user">

          <span>
            Hi, {localStorage.getItem("user_name")}
          </span>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="dashboard-content">

        <button
          className="back-button"
          onClick={() =>
            navigate(`/organizer/events/${id}`)
          }
        >
          ← Back to Event
        </button>

        <section className="dashboard-welcome">

          <div>
            <p className="dashboard-label">
              EVENT MANAGEMENT
            </p>

            <h1>
              Edit Event
            </h1>

            <p>
              Update the details of your event.
            </p>
          </div>

        </section>

        <section className="create-event-card">

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>
                Event Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
              />

            </div>

            <div className="form-group">

              <label>
                Category
              </label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-row">

              <div className="form-group">

                <label>
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Registration Deadline
                </label>

                <input
                  type="date"
                  name="registration_deadline"
                  value={
                    formData.registration_deadline
                  }
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            <div className="form-row">

              <div className="form-group">

                <label>
                  Start Time
                </label>

                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  End Time
                </label>

                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            <div className="form-group">

              <label>
                Venue
              </label>

              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-group">

              <label>
                Capacity
              </label>

              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                required
              />

            </div>

            <div className="form-group">

              <label>
                Image URL
              </label>

              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
              />

            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {message && (
              <div className="auth-success">
                {message}
              </div>
            )}

            <div className="form-actions">

              <button
                type="button"
                className="secondary-btn"
                onClick={() =>
                  navigate(
                    `/organizer/events/${id}`
                  )
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}

export default EditEvent;