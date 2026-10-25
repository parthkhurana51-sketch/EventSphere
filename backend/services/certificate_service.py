
from datetime import date, datetime
from html import escape
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

CERTIFICATE_FOLDER = Path("generated_certificates")
CERTIFICATE_FOLDER.mkdir(parents=True, exist_ok=True)

CSS = r"""\n@import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600&display=swap");\n@import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600&display=swap");
@page{size:A4 landscape;margin:0}
*{box-sizing:border-box}
html,body{margin:0;padding:0;width:297mm;height:210mm}
body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.certificate-preview-paper.eventsphere-award{container-type:inline-size;position:relative;display:block;isolation:isolate;width:297mm;height:210mm;overflow:hidden;background:#fffdf8;color:#15385f;font-family:Arial,Helvetica,sans-serif;--certificate-color:#0756a5}
.eventsphere-award>.award-wave{position:absolute;z-index:-1;pointer-events:none}
.eventsphere-award .award-wave-top{top:0;left:0;width:100%;height:24%;background:linear-gradient(120deg,#092c55,#0756a5 62%,#b7e4f8);clip-path:polygon(0 0,78% 0,54% 48%,34% 70%,0 100%)}
.eventsphere-award .award-wave-bottom{right:0;bottom:0;width:100%;height:15%;background:linear-gradient(100deg,#092c55,#0756a5,#092c55);clip-path:polygon(0 24%,30% 52%,55% 20%,80% 48%,100% 16%,100% 100%,0 100%)}
.eventsphere-award .award-wave-left{top:32%;left:0;width:35%;height:25%;opacity:.18;background:repeating-linear-gradient(170deg,transparent 0 5px,#5aa6d9 5px 6px);clip-path:polygon(0 20%,100% 0,65% 55%,0 100%)}
.eventsphere-award .award-frame{position:absolute;inset:3.5%;display:flex;flex-direction:column;align-items:stretch;min-width:0;min-height:0;overflow:hidden;border:1px solid #c7a35b;padding:2.2% 3.2% 1.6%;background:rgba(255,255,255,.9)}
.eventsphere-award .award-frame:before{content:"";position:absolute;inset:5px;border:1px solid rgba(199,163,91,.7);pointer-events:none}
.eventsphere-award .award-brand-row{position:relative;z-index:1;display:flex;flex:0 0 16%;align-items:center;justify-content:center;gap:10px;width:100%;min-height:0;padding:0 2%;text-align:left}
.eventsphere-award .award-logo{display:block;flex:0 0 auto;max-width:11%;max-height:75%;object-fit:contain}
.eventsphere-award .award-brand-symbol{display:flex;flex:0 0 auto;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid #c7a35b;border-radius:50%;color:#c7a35b;font-size:3.4cqw}
.eventsphere-award .award-brand-copy{min-width:0;text-align:left}
.eventsphere-award .award-organization{color:var(--certificate-color,#0756a5);font-size:2.5cqw;font-weight:800;letter-spacing:.07em;overflow-wrap:anywhere}
.eventsphere-award .award-tagline{margin-top:3px;color:#64748b;font:1.2cqw Arial,sans-serif;letter-spacing:.1em}
.eventsphere-award .award-side-tagline{margin-left:auto;color:#64748b;font:1.35cqw/1.7 Arial,sans-serif;letter-spacing:.13em;text-align:right}
.eventsphere-award .award-main{position:relative;z-index:1;display:flex;flex:1 1 auto;flex-direction:column;align-items:center;justify-content:center;min-width:0;min-height:0;width:100%;padding:0 2% 1%;text-align:center}
.eventsphere-award .award-kicker{margin:0 0 1%;color:#9b7b3d;font:800 1.35cqw Arial,sans-serif;letter-spacing:.2em}
.eventsphere-award .award-title{max-width:100%;margin:0;color:var(--certificate-color,#0756a5);font:600 5.8cqw/1.1 Georgia,"Times New Roman",serif;overflow-wrap:anywhere}
.eventsphere-award .award-divider{width:22%;height:1px;flex:0 0 1px;margin:2% 0;background:#c7a35b}
.eventsphere-award .award-intro{margin:0;color:#52627a;font:1.5cqw Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase}
.eventsphere-award .award-recipient{max-width:95%;margin:1% 0 0;padding:0 2% .6%;border-bottom:1px solid #c7a35b;color:#0c2553;font-family:"Dancing Script","Brush Script MT","Segoe Script",cursive;font-size:6.1cqw;font-weight:400;line-height:1.12;overflow-wrap:anywhere}
.eventsphere-award .award-description{max-width:82%;margin:1.5% 0 0;color:#334155;font:1.7cqw/1.4 Arial,sans-serif;overflow-wrap:anywhere}
.eventsphere-award .award-event-details{display:flex;flex:0 0 auto;align-items:center;justify-content:center;gap:12px;width:90%;margin-top:1.5%;padding:0;border:0;color:var(--certificate-color,#0756a5);font-family:Arial,sans-serif;text-align:center}
.eventsphere-award .award-detail{display:flex;align-items:center;justify-content:center;gap:4px;min-width:0}
.eventsphere-award .award-detail-icon{color:#c7a35b;font-size:2cqw}
.eventsphere-award .award-detail strong{display:block;color:#24466c;font-size:1.35cqw;line-height:1.3;overflow-wrap:anywhere}
.eventsphere-award .award-detail span:last-child{color:#64748b;font-size:1.2cqw;line-height:1.3;overflow-wrap:anywhere}
.eventsphere-award .award-bottom{position:relative;z-index:1;display:flex;flex:0 0 21%;align-items:flex-end;justify-content:space-between;gap:4%;width:88%;min-width:0;min-height:0;margin:0 auto;padding:1% 0 2%}
.eventsphere-award .award-signature{display:flex;flex:1 1 0;flex-direction:column;align-items:center;justify-content:flex-end;min-width:0;text-align:center}
.eventsphere-award .award-signature-script{min-height:15px;max-width:100%;color:var(--certificate-color,#0756a5);font-family:"Dancing Script","Brush Script MT","Segoe Script",cursive;font-size:2.4cqw;line-height:1.1;overflow-wrap:anywhere}
.eventsphere-award .award-signature-rule{width:90%;height:1px;margin:3px 0;background:#aab4c2}
.eventsphere-award .award-signature strong{max-width:100%;color:#24364d;font:700 1.5cqw/1.3 Arial,sans-serif;overflow-wrap:anywhere}
.eventsphere-award .award-signature span{max-width:100%;margin-top:2px;color:#64748b;font:1.35cqw/1.25 Arial,sans-serif;overflow-wrap:anywhere}
.eventsphere-award .award-medallion{position:relative;z-index:2;display:flex;flex:0 0 auto;align-items:center;justify-content:center;align-self:center;width:7.6cqw;height:7.6cqw;border:2px solid #c7a35b;border-radius:50%;outline:1px solid #c7a35b;outline-offset:2px;background:#fffaf0;color:#9b7b3d;font-size:1.8cqw}
.eventsphere-award .award-footer{position:relative;z-index:1;display:flex;flex:0 0 12%;align-items:center;justify-content:space-between;gap:12px;width:calc(100% + 6.4%);min-width:0;min-height:0;margin:0 -3.2% -1.6%;padding:1.2% 4%;background:linear-gradient(100deg,#092c55,#0756a5);color:white;font-family:Arial,sans-serif}
.eventsphere-award .award-footer>div{display:flex;flex-direction:column;gap:3px;min-width:0}
.eventsphere-award .award-footer>div:last-child{text-align:right}
.eventsphere-award .award-footer span{color:#dbeafe;font-size:1.2cqw;font-weight:700;letter-spacing:.08em}
.eventsphere-award .award-footer strong{color:white;font-size:1.5cqw;line-height:1.2;overflow-wrap:anywhere}
"""

def _text(value, fallback=""):
    if value is None:
        return fallback
    if isinstance(value, (datetime, date)):
        return value.strftime("%d %b %Y")
    return str(value).strip() or fallback

def _e(value):
    return escape(str(value or ""), quote=True)

def _logo_url(value):
    try:
        parsed = urlparse(str(value or "").strip())
        return str(value).strip() if parsed.scheme in ("http", "https") and parsed.netloc else ""
    except Exception:
        return ""

def _build_html(certificate_id, participant_name, event_name, event_date, venue, issued_at,
                organization_name, certificate_title, certificate_text, primary_color,
                signer_name, signer_title, logo_url):
    participant_name = _text(participant_name, "Participant")
    event_name = _text(event_name, "Event")
    event_date = _text(event_date, "Not specified")
    venue = _text(venue, "Not specified")
    issued_at = _text(issued_at, "Not specified").upper()
    organization_name = _text(organization_name, "YOUR ORGANIZATION")
    certificate_title = _text(certificate_title, "Certificate of Participation")
    signer_name = _text(signer_name, "Event Organizer")
    signer_title = _text(signer_title, "Event Organizer")
    message = _text(certificate_text, "This certificate is presented to {participant_name} for participating in {event_name}.")
    message = message.replace("{participant_name}", participant_name).replace("{event_name}", event_name)
    logo = _logo_url(logo_url)
    mark = f'<img class="award-logo" src="{_e(logo)}" alt="Organization logo">' if logo else '<div class="award-brand-symbol">✦</div>'
    color = _e(primary_color or "#0756A5")
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="certificate-preview-paper eventsphere-award" style="--certificate-color:{color}">
<div class="award-wave award-wave-top"></div><div class="award-wave award-wave-bottom"></div><div class="award-wave award-wave-left"></div>
<div class="award-frame">
<div class="award-brand-row">{mark}<div class="award-brand-copy"><div class="award-organization">{_e(organization_name)}</div><div class="award-tagline">PLAN · ORGANIZE · CONNECT</div></div><div class="award-side-tagline">EVENTS<br>PEOPLE<br>POSSIBILITIES</div></div>
<div class="award-main"><div class="award-kicker">RECOGNITION &amp; ACHIEVEMENT</div><h2 class="award-title">{_e(certificate_title)}</h2><div class="award-divider"></div>
<p class="award-intro">This certificate is proudly presented to</p><div class="award-recipient">{_e(participant_name)}</div><p class="award-description">{_e(message)}</p>
<div class="award-event-details"><div class="award-detail"><span class="award-detail-icon">◆</span><div><strong>{_e(event_name.upper())}</strong><span>Event</span></div></div></div>
<div style="margin-top:5px;color:#64748b;font:1.2cqw Arial,sans-serif;text-align:center;max-width:90%;overflow-wrap:anywhere">EVENT DATE: {_e(event_date)} &nbsp; | &nbsp; VENUE: {_e(venue)}</div></div>
<div class="award-bottom"><div class="award-signature"><div class="award-signature-script">{_e(signer_name)}</div><div class="award-signature-rule"></div><strong>{_e(signer_name)}</strong><span>{_e(signer_title)}</span></div>
<div class="award-medallion">✦</div><div class="award-signature"><div class="award-signature-script">EventSphere</div><div class="award-signature-rule"></div><strong>EVENTSPHERE</strong><span>Certificate Issuer</span></div></div>
<div class="award-footer"><div><span>CERTIFICATE NO.</span><strong>{_e(certificate_id)}</strong></div><div><span>ISSUE DATE</span><strong>{_e(issued_at)}</strong></div></div>
</div></div></body></html>"""

def generate_certificate_pdf(certificate_id: str, participant_name: str, event_name: str,
    event_date, venue: str, issued_at, organization_name: str = "",
    certificate_title: str = "Certificate of Participation",
    certificate_text: str = "This certificate is presented to {participant_name} for participating in {event_name}.",
    primary_color: str = "#0756A5", signer_name: str = "", signer_title: str = "", logo_url: str = ""):
    """Render PDF using Chromium so the PDF follows the frontend preview CSS layout."""
    output_path = CERTIFICATE_FOLDER / f"{certificate_id}.pdf"
    html = _build_html(certificate_id, participant_name, event_name, event_date, venue, issued_at,
        organization_name, certificate_title, certificate_text, primary_color, signer_name, signer_title, logo_url)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        try:
            page = browser.new_page(viewport={"width": 1200, "height": 849}, device_scale_factor=1)
            page.set_content(html, wait_until="networkidle", timeout=20000)
            page.evaluate("document.fonts.ready")
            page.pdf(path=str(output_path), format="A4", landscape=True, print_background=True,
                prefer_css_page_size=True, margin={"top":"0","right":"0","bottom":"0","left":"0"}, scale=1)
        finally:
            browser.close()
    return str(output_path)
