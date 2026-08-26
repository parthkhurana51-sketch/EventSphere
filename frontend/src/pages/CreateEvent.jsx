import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function CreateEvent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Workshop",
    date: "",
    start_time: "",
    end_time: "",
    venue: "",
    capacity: "",
    registration_deadline: "",
    image_url: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "${API_BASE_URL}/api/events/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            capacity: Number(form.capacity),
            image_url: form.image_url || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create event"
        );
      }

      navigate("/organizer");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page">

      <div className="create-event-container">

        <div className="create-event-header">
          <button
            className="back-button"
            onClick={() => navigate("/organizer")}
          >
            ← Back
          </button>

          <p>EVENT MANAGEMENT</p>

          <h1>Create a New Event</h1>

          <span>
            Fill in the details below to publish your event.
          </span>
        </div>

        <form
          className="event-form"
          onSubmit={handleSubmit}
        >

          <div className="form-section">

            <h2>Basic Information</h2>

            <div className="form-group">
              <label>Event Name</label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Python & Data Science Workshop"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your event..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Category</label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Workshop</option>
                <option>Conference</option>
                <option>Seminar</option>
                <option>Competition</option>
                <option>Cultural</option>
                <option>Sports</option>
                <option>Other</option>
              </select>
            </div>

          </div>

          <div className="form-section">

            <h2>Date & Venue</h2>

            <div className="form-row">

              <div className="form-group">
                <label>Event Date</label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Registration Deadline</label>

                <input
                  type="date"
                  name="registration_deadline"
                  value={form.registration_deadline}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-row">

              <div className="form-group">
                <label>Start Time</label>

                <input
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Time</label>

                <input
                  type="time"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-group">
              <label>Venue</label>

              <input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="e.g. Seminar Hall"
                required
              />
            </div>

          </div>

          <div className="form-section">

            <h2>Registration</h2>

            <div className="form-group">
              <label>Maximum Capacity</label>

              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                min="1"
                placeholder="150"
                required
              />
            </div>

            <div className="form-group">
              <label>Event Image URL <span>(Optional)</span></label>

              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/organizer")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading
                ? "Creating Event..."
                : "Create Event"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateEvent;
