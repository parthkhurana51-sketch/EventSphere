import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../config";

const DEFAULT_MESSAGE =
  "This certificate is presented to {participant_name} for participating in {event_name}.";

const DEFAULT_FORM = {
  organization_name: "",
  logo_url: "",
  certificate_title: "Certificate of Participation",
  certificate_text: DEFAULT_MESSAGE,
  primary_color: "#0756A5",
  signer_name: "",
  signer_title: "",
};

function CertificateCustomization() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [logoFailed, setLogoFailed] = useState(false);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    let active = true;

    async function loadTemplate() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/certificates/template/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "Failed to load certificate settings."
          );
        }

        if (!active) return;

        setForm({
          organization_name: data.organization_name ?? "",
          logo_url: data.logo_url ?? "",
          certificate_title:
            data.certificate_title || DEFAULT_FORM.certificate_title,
          certificate_text: data.certificate_text ?? DEFAULT_MESSAGE,
          primary_color: data.primary_color || DEFAULT_FORM.primary_color,
          signer_name: data.signer_name ?? "",
          signer_title: data.signer_title ?? "",
        });
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load certificate settings.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTemplate();

    return () => {
      active = false;
    };
  }, [id, navigate, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "logo_url") setLogoFailed(false);

    setMessage("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/certificates/template/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to save certificate settings."
        );
      }

      setMessage("Certificate settings saved successfully!");
    } catch (err) {
      setError(err.message || "Unable to save certificate settings.");
    } finally {
      setSaving(false);
    }
  };

  const previewMessage = (form.certificate_text || DEFAULT_MESSAGE)
    .replaceAll("{participant_name}", "Participant Name")
    .replaceAll("{event_name}", "Sample Event")
    .trim();

  if (loading) {
    return (
      <div className="certificate-studio">
        <div className="certificate-studio-loading">
          Loading certificate studio...
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-studio">
      <header className="dashboard-navbar">
        <div
          className="logo"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/organizer-home")}
        >
          EventSphere
        </div>

        <nav className="dashboard-nav-links">
          <button type="button" onClick={() => navigate("/organizer-home")}>
            Home
          </button>
          <button type="button" onClick={() => navigate("/organizer")}>
            My Events
          </button>
          <button
            type="button"
            onClick={() => navigate("/organizer/attendance")}
          >
            Attendance
          </button>
        </nav>
      </header>

      <main className="certificate-studio-content">
        <div className="certificate-studio-header">
          <div>
            <div className="certificate-studio-eyebrow">
              EVENT #{id} / CERTIFICATE DESIGN
            </div>
            <h1>Certificate Studio</h1>
            <p>
              Design a professional certificate for your event. Customize your
              organization&apos;s branding, certificate content, and signatory
              details.
            </p>
          </div>

          <button
            type="button"
            className="certificate-studio-back"
            onClick={() => navigate("/organizer")}
          >
            ← Back to My Events
          </button>
        </div>

        {error && (
          <div className="certificate-error-message" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="certificate-status-message" role="status">
            ✓ {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="certificate-studio-layout">
            <div className="certificate-editor">
              <section className="certificate-editor-section">
                <div className="certificate-section-heading">
                  <div className="certificate-section-number">01</div>
                  <div>
                    <h2>Organization Branding</h2>
                    <p>Your organization&apos;s identity</p>
                  </div>
                </div>

                <div className="certificate-field">
                  <label htmlFor="organization_name">
                    Organization or Company Name
                  </label>
                  <input
                    id="organization_name"
                    name="organization_name"
                    type="text"
                    value={form.organization_name}
                    onChange={handleChange}
                    placeholder="e.g. ABC Technologies"
                    maxLength={255}
                  />
                </div>

                <div className="certificate-field">
                  <label htmlFor="logo_url">Organization Logo URL</label>
                  <input
                    id="logo_url"
                    name="logo_url"
                    type="url"
                    value={form.logo_url}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                  />
                  <small>
                    Enter a publicly accessible image URL. Direct image uploads
                    are not implemented yet.
                  </small>
                </div>
              </section>

              <section className="certificate-editor-section">
                <div className="certificate-section-heading">
                  <div className="certificate-section-number">02</div>
                  <div>
                    <h2>Certificate Content</h2>
                    <p>Customize the title and message</p>
                  </div>
                </div>

                <div className="certificate-field">
                  <label htmlFor="certificate_title">Certificate Title</label>
                  <input
                    id="certificate_title"
                    name="certificate_title"
                    type="text"
                    value={form.certificate_title}
                    onChange={handleChange}
                    maxLength={255}
                    required
                  />
                </div>

                <div className="certificate-field">
                  <label htmlFor="certificate_text">Certificate Message</label>
                  <textarea
                    id="certificate_text"
                    name="certificate_text"
                    value={form.certificate_text}
                    onChange={handleChange}
                    rows={4}
                  />
                  <small>
                    Use {"{participant_name}"} for the participant&apos;s name
                    and {"{event_name}"} for the event name.
                  </small>
                </div>

                <div className="certificate-field">
                  <label htmlFor="primary_color">Primary Color</label>
                  <div className="certificate-color-control">
                    <input
                      id="primary_color"
                      type="color"
                      name="primary_color"
                      value={form.primary_color}
                      onChange={handleChange}
                    />
                    <span>{form.primary_color.toUpperCase()}</span>
                  </div>
                  <small>
                    This color controls the main certificate accents. The
                    design also uses subtle gold details.
                  </small>
                </div>
              </section>

              <section className="certificate-editor-section">
                <div className="certificate-section-heading">
                  <div className="certificate-section-number">03</div>
                  <div>
                    <h2>Authorized Signatory</h2>
                    <p>Person signing the certificate</p>
                  </div>
                </div>

                <div className="certificate-field">
                  <label htmlFor="signer_name">Signer&apos;s Name</label>
                  <input
                    id="signer_name"
                    name="signer_name"
                    type="text"
                    value={form.signer_name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    maxLength={255}
                  />
                </div>

                <div className="certificate-field">
                  <label htmlFor="signer_title">Signer&apos;s Designation</label>
                  <input
                    id="signer_title"
                    name="signer_title"
                    type="text"
                    value={form.signer_title}
                    onChange={handleChange}
                    placeholder="e.g. Program Director"
                    maxLength={255}
                  />
                </div>
              </section>

              <div className="certificate-form-actions">
                <button
                  type="submit"
                  className="certificate-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving Settings..." : "Save Certificate Settings"}
                </button>
              </div>
            </div>

            <aside className="certificate-preview-panel">
              <div className="certificate-preview-heading">
                <div>
                  <h2>Live Preview</h2>
                  <p>Your design updates as you change the settings</p>
                </div>
                <span className="certificate-preview-badge">PREVIEW</span>
              </div>

              <div className="certificate-preview-stage">
                <div
                  className="certificate-preview-paper eventsphere-award"
                  style={{ "--certificate-color": form.primary_color }}
                  aria-label="Certificate preview"
                >
                  <div className="award-wave award-wave-top" />
                  <div className="award-wave award-wave-bottom" />
                  <div className="award-wave award-wave-left" />

                  <div className="award-frame">
                    <div className="award-brand-row">
                      {form.logo_url && !logoFailed ? (
                        <img
                          className="award-logo"
                          src={form.logo_url}
                          alt="Organization logo"
                          onError={() => setLogoFailed(true)}
                        />
                      ) : (
                        <div className="award-brand-symbol" aria-hidden="true">
                          ✦
                        </div>
                      )}

                      <div className="award-brand-copy">
                        <div className="award-organization">
                          {form.organization_name || "YOUR ORGANIZATION"}
                        </div>
                        <div className="award-tagline">
                          PLAN · ORGANIZE · CONNECT
                        </div>
                      </div>

                      <div className="award-side-tagline">
                        EVENTS
                        <br />
                        PEOPLE
                        <br />
                        POSSIBILITIES
                      </div>
                    </div>

                    <div className="award-main">
                      <div className="award-kicker">RECOGNITION &amp; ACHIEVEMENT</div>

                      <h2 className="award-title">
                        {form.certificate_title || "Certificate of Participation"}
                      </h2>

                      <div className="award-divider" />

                      <p className="award-intro">
                        This certificate is proudly presented to
                      </p>

                      <div className="award-recipient">Participant Name</div>

                      <p className="award-description">
                        {previewMessage || "For participating in Sample Event"}
                      </p>

                      <div className="award-event-details">
                        <div className="award-detail">
                          <span className="award-detail-icon">◆</span>
                          <div>
                            <strong>SAMPLE EVENT</strong>
                            <span>Event</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="award-bottom">
                      <div className="award-signature">
                        <div className="award-signature-script">
                          {form.signer_name || "Event Organizer"}
                        </div>
                        <div className="award-signature-rule" />
                        <strong>{form.signer_name || "Authorized Signatory"}</strong>
                        <span>{form.signer_title || "Event Organizer"}</span>
                      </div>

                      <div className="award-medallion" aria-label="Awarded">
                        ✦
                      </div>

                      <div className="award-signature">
                        <div className="award-signature-script">EventSphere</div>
                        <div className="award-signature-rule" />
                        <strong>EVENTSPHERE</strong>
                        <span>Certificate Issuer</span>
                      </div>
                    </div>

                    <div className="award-footer">
                      <div>
                        <span>CERTIFICATE NO.</span>
                        <strong>EVT-{String(id || "0000").padStart(4, "0")}-0001</strong>
                      </div>
                      <div>
                        <span>ISSUE DATE</span>
                        <strong>{new Date().toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).toUpperCase()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="certificate-preview-note">
                This is a sample preview. The actual certificate number, event
                information, participant name, and issue date are supplied when
                a certificate is issued. The PDF generator must use the same
                design separately.
              </p>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CertificateCustomization;
