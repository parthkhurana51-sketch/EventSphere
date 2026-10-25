
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle


CERTIFICATE_FOLDER = Path("generated_certificates")
CERTIFICATE_FOLDER.mkdir(parents=True, exist_ok=True)

# EventSphere's premium certificate palette
NAVY = colors.HexColor("#142642")
BLUE = colors.HexColor("#2457A7")
GOLD = colors.HexColor("#C49A45")
IVORY = colors.HexColor("#FFFEFA")
MUTED = colors.HexColor("#64748B")
DARK = colors.HexColor("#172033")
PALE_BLUE = colors.HexColor("#EAF0F8")
PALE_GOLD = colors.HexColor("#F5EBD5")


def _centered_text(pdf, text, y, font, size, color, page_width):
    """Draw horizontally centered text."""
    text = str(text or "")
    pdf.setFont(font, size)
    pdf.setFillColor(color)

    width = stringWidth(text, font, size)

    pdf.drawString(
        (page_width - width) / 2,
        y,
        text
    )


def _fit_centered_text(
    pdf,
    text,
    y,
    font,
    max_size,
    min_size,
    max_width,
    color,
):
    """Center text and reduce its font size when necessary."""
    text = str(text or "")
    size = max_size

    while size > min_size and stringWidth(text, font, size) > max_width:
        size -= 1

    pdf.setFont(font, size)
    pdf.setFillColor(color)

    width = stringWidth(text, font, size)

    pdf.drawString(
        (landscape(A4)[0] - width) / 2,
        y,
        text
    )


def _draw_corner_ornament(pdf, x, y, horizontal_direction, vertical_direction):
    """Draw a restrained geometric gold corner ornament."""
    pdf.saveState()
    pdf.setStrokeColor(GOLD)
    pdf.setLineWidth(1.4)

    horizontal_end = x + horizontal_direction * 18 * mm
    vertical_end = y + vertical_direction * 18 * mm

    pdf.line(x, y, horizontal_end, y)
    pdf.line(x, y, x, vertical_end)

    pdf.setFillColor(GOLD)
    pdf.circle(x, y, 1.5 * mm, fill=1, stroke=0)

    pdf.restoreState()


def _draw_paragraph(pdf, text, x, top_y, width, max_height, style):
    """Draw wrapped text and return the remaining vertical position."""
    paragraph = Paragraph(text, style)

    _, height = paragraph.wrap(width, max_height)

    paragraph.drawOn(
        pdf,
        x,
        top_y - height
    )

    return top_y - height


def generate_certificate_pdf(
    certificate_id: str,
    participant_name: str,
    event_name: str,
    event_date,
    venue: str,
    issued_at,
    organization_name: str = "",
    certificate_title: str = "Certificate of Participation",
    certificate_text: str = (
        "This certificate is presented to {participant_name} "
        "for participating in {event_name}."
    ),
    primary_color: str = "#2457A7",
    signer_name: str = "",
    signer_title: str = "",
    logo_url: str = "",
):
    """
    Generate a premium landscape certificate PDF.

    The original six arguments remain supported. Additional design
    settings are optional and can be supplied by the certificate router.
    """

    filename = f"{certificate_id}.pdf"
    file_path = CERTIFICATE_FOLDER / filename

    page_width, page_height = landscape(A4)

    # Validate the organizer's selected color.
    try:
        accent = colors.HexColor(primary_color or "#2457A7")
    except (ValueError, TypeError):
        accent = BLUE

    # Prevent unexpected long strings from affecting the page layout.
    participant_name = str(participant_name or "Participant")
    event_name = str(event_name or "Event")
    venue = str(venue or "Not specified")
    organization_name = str(organization_name or "EVENTSPHERE")
    certificate_title = str(
        certificate_title or "Certificate of Participation"
    )
    certificate_text = str(certificate_text or "")

    # Personalize the saved certificate message.
    message = (
        certificate_text
        .replace("{participant_name}", participant_name)
        .replace("{event_name}", event_name)
    )

    event_date_text = str(event_date or "Not specified")
    issued_date_text = issued_at.strftime("%d %B %Y")

    pdf = canvas.Canvas(
        str(file_path),
        pagesize=(page_width, page_height),
    )

    pdf.setTitle(f"{certificate_title} - {participant_name}")
    pdf.setAuthor(organization_name)
    pdf.setSubject(f"Certificate {certificate_id}")

    # =====================================================
    # 1. IVORY BACKGROUND
    # =====================================================

    pdf.setFillColor(IVORY)
    pdf.rect(
        0, 0,
        page_width, page_height,
        fill=1,
        stroke=0,
    )

    # =====================================================
    # 2. PREMIUM LAYERED FRAME
    # =====================================================

    margin = 10 * mm

    pdf.setStrokeColor(NAVY)
    pdf.setLineWidth(3)
    pdf.rect(
        margin,
        margin,
        page_width - 2 * margin,
        page_height - 2 * margin,
        fill=0,
        stroke=1,
    )

    inner_margin = margin + 3 * mm

    pdf.setStrokeColor(GOLD)
    pdf.setLineWidth(0.9)
    pdf.rect(
        inner_margin,
        inner_margin,
        page_width - 2 * inner_margin,
        page_height - 2 * inner_margin,
        fill=0,
        stroke=1,
    )

    # Geometric corner details.
    corner_offset = margin + 7 * mm

    _draw_corner_ornament(
        pdf, corner_offset, corner_offset, 1, 1
    )
    _draw_corner_ornament(
        pdf, page_width - corner_offset, corner_offset, -1, 1
    )
    _draw_corner_ornament(
        pdf, corner_offset, page_height - corner_offset, 1, -1
    )
    _draw_corner_ornament(
        pdf,
        page_width - corner_offset,
        page_height - corner_offset,
        -1,
        -1,
    )

    # A restrained top accent line.
    pdf.setFillColor(accent)
    pdf.rect(
        page_width / 2 - 24 * mm,
        page_height - 19 * mm,
        48 * mm,
        1.2 * mm,
        fill=1,
        stroke=0,
    )

    # =====================================================
    # 3. ORGANIZATION BRANDING
    # =====================================================

    brand = organization_name.upper()

    brand_size = 13
    brand_width_limit = page_width - 100 * mm

    while (
        brand_size > 8
        and stringWidth(brand, "Helvetica-Bold", brand_size)
        > brand_width_limit
    ):
        brand_size -= 1

    _centered_text(
        pdf,
        brand,
        page_height - 31 * mm,
        "Helvetica-Bold",
        brand_size,
        NAVY,
        page_width,
    )

    # The logo URL is accepted by this function for future storage
    # integration. It is deliberately not downloaded from an arbitrary
    # URL here, to avoid unsafe server-side requests.

    # =====================================================
    # 4. CERTIFICATE HEADING
    # =====================================================

    _centered_text(
        pdf,
        "CERTIFICATE",
        page_height - 49 * mm,
        "Helvetica-Bold",
        29,
        NAVY,
        page_width,
    )

    _centered_text(
        pdf,
        certificate_title.upper(),
        page_height - 59 * mm,
        "Helvetica-Bold",
        12,
        accent,
        page_width,
    )

    # Small gold separator.
    separator_y = page_height - 65 * mm

    pdf.setStrokeColor(GOLD)
    pdf.setLineWidth(1.2)
    pdf.line(
        page_width / 2 - 15 * mm,
        separator_y,
        page_width / 2 + 15 * mm,
        separator_y,
    )

    # =====================================================
    # 5. RECIPIENT
    # =====================================================

    _centered_text(
        pdf,
        "THIS CERTIFICATE IS PROUDLY PRESENTED TO",
        page_height - 76 * mm,
        "Helvetica",
        9,
        MUTED,
        page_width,
    )

    _fit_centered_text(
        pdf,
        participant_name,
        page_height - 91 * mm,
        "Helvetica-Bold",
        29,
        16,
        page_width - 70 * mm,
        NAVY,
    )

    # Underline beneath the recipient name.
    pdf.setStrokeColor(GOLD)
    pdf.setLineWidth(0.8)
    pdf.line(
        page_width / 2 - 30 * mm,
        page_height - 94 * mm,
        page_width / 2 + 30 * mm,
        page_height - 94 * mm,
    )

    # =====================================================
    # 6. PERSONALIZED MESSAGE
    # =====================================================

    message_style = ParagraphStyle(
        "CertificateMessage",
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=MUTED,
        alignment=1,
    )

    safe_message = escape(message).replace("\n", "<br/>")

    _draw_paragraph(
        pdf,
        safe_message,
        45 * mm,
        page_height - 100 * mm,
        page_width - 90 * mm,
        25 * mm,
        message_style,
    )

    # =====================================================
    # 7. EVENT INFORMATION
    # =====================================================

    _fit_centered_text(
        pdf,
        event_name,
        page_height - 119 * mm,
        "Helvetica-Bold",
        17,
        11,
        page_width - 80 * mm,
        accent,
    )

    event_information = (
        f"EVENT DATE: {event_date_text}     |     VENUE: {venue}"
    )

    _fit_centered_text(
        pdf,
        event_information,
        page_height - 129 * mm,
        "Helvetica",
        9,
        7,
        page_width - 55 * mm,
        MUTED,
    )

    # =====================================================
    # 8. FOOTER INFORMATION PANEL
    # =====================================================

    footer_y = 20 * mm
    footer_height = 20 * mm
    footer_x = 25 * mm
    footer_width = page_width - 50 * mm

    pdf.setFillColor(PALE_BLUE)
    pdf.roundRect(
        footer_x,
        footer_y,
        footer_width,
        footer_height,
        2 * mm,
        fill=1,
        stroke=0,
    )

    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica-Bold", 7)

    pdf.drawString(
        footer_x + 6 * mm,
        footer_y + 13 * mm,
        "CERTIFICATE NUMBER",
    )

    pdf.setFont("Helvetica", 9)
    pdf.drawString(
        footer_x + 6 * mm,
        footer_y + 6 * mm,
        certificate_id,
    )

    # Issue date in the center.
    center_x = page_width / 2

    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica-Bold", 7)

    pdf.drawCentredString(
        center_x,
        footer_y + 13 * mm,
        "DATE OF ISSUE",
    )

    pdf.setFont("Helvetica", 9)
    pdf.drawCentredString(
        center_x,
        footer_y + 6 * mm,
        issued_date_text,
    )

    # Signatory details on the right.
    right_edge = footer_x + footer_width - 6 * mm

    signer_display = signer_name or "Event Organizer"
    signer_designation = signer_title or "Authorized Signatory"

    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica-Bold", 8)

    pdf.drawRightString(
        right_edge,
        footer_y + 12 * mm,
        signer_display[:70],
    )

    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 7)

    pdf.drawRightString(
        right_edge,
        footer_y + 5 * mm,
        signer_designation[:90],
    )

    # A small gold divider above the footer panel.
    pdf.setStrokeColor(GOLD)
    pdf.setLineWidth(1)
    pdf.line(
        footer_x,
        footer_y + footer_height + 2 * mm,
        footer_x + footer_width,
        footer_y + footer_height + 2 * mm,
    )

    # =====================================================
    # 9. SAVE PDF
    # =====================================================

    pdf.save()

    return str(file_path)
