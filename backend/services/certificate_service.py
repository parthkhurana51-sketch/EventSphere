from pathlib import Path
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth


CERTIFICATE_FOLDER = Path("generated_certificates")
CERTIFICATE_FOLDER.mkdir(exist_ok=True)


def generate_certificate_pdf(
    certificate_id: str,
    participant_name: str,
    event_name: str,
    event_date,
    venue: str,
    issued_at
):
    filename = f"{certificate_id}.pdf"
    file_path = CERTIFICATE_FOLDER / filename

    page_width, page_height = landscape(A4)

    pdf = canvas.Canvas(
        str(file_path),
        pagesize=(page_width, page_height)
    )

    # =====================================================
    # BACKGROUND
    # =====================================================

    pdf.setFillColor(colors.HexColor("#f8fafc"))
    pdf.rect(
        0,
        0,
        page_width,
        page_height,
        fill=1,
        stroke=0
    )

    # =====================================================
    # OUTER BORDER
    # =====================================================

    margin = 14 * mm

    pdf.setStrokeColor(colors.HexColor("#1d4ed8"))
    pdf.setLineWidth(3)

    pdf.rect(
        margin,
        margin,
        page_width - 2 * margin,
        page_height - 2 * margin,
        fill=0,
        stroke=1
    )

    # Inner border

    pdf.setStrokeColor(colors.HexColor("#cbd5e1"))
    pdf.setLineWidth(1)

    inner_margin = margin + 7 * mm

    pdf.rect(
        inner_margin,
        inner_margin,
        page_width - 2 * inner_margin,
        page_height - 2 * inner_margin,
        fill=0,
        stroke=1
    )

    # =====================================================
    # EVENTSPHERE
    # =====================================================

    pdf.setFillColor(colors.HexColor("#2563eb"))

    brand = "EVENTSPHERE"

    brand_size = 22

    pdf.setFont(
        "Helvetica-Bold",
        brand_size
    )

    brand_width = stringWidth(
        brand,
        "Helvetica-Bold",
        brand_size
    )

    pdf.drawString(
        (page_width - brand_width) / 2,
        page_height - 40 * mm,
        brand
    )

    # =====================================================
    # CERTIFICATE TITLE
    # =====================================================

    pdf.setFillColor(colors.HexColor("#0f172a"))

    title = "CERTIFICATE OF PARTICIPATION"

    title_size = 28

    pdf.setFont(
        "Helvetica-Bold",
        title_size
    )

    title_width = stringWidth(
        title,
        "Helvetica-Bold",
        title_size
    )

    pdf.drawString(
        (page_width - title_width) / 2,
        page_height - 59 * mm,
        title
    )

    # =====================================================
    # PRESENTED TO
    # =====================================================

    pdf.setFillColor(colors.HexColor("#64748b"))

    pdf.setFont(
        "Helvetica",
        11
    )

    text = "This certificate is proudly presented to"

    text_width = stringWidth(
        text,
        "Helvetica",
        11
    )

    pdf.drawString(
        (page_width - text_width) / 2,
        page_height - 78 * mm,
        text
    )

    # =====================================================
    # PARTICIPANT NAME
    # =====================================================

    pdf.setFillColor(colors.HexColor("#111827"))

    name_size = 30

    pdf.setFont(
        "Helvetica-Bold",
        name_size
    )

    name_width = stringWidth(
        participant_name,
        "Helvetica-Bold",
        name_size
    )

    # Reduce font if very long
    if name_width > page_width - 90 * mm:
        name_size = 23

        pdf.setFont(
            "Helvetica-Bold",
            name_size
        )

        name_width = stringWidth(
            participant_name,
            "Helvetica-Bold",
            name_size
        )

    pdf.drawString(
        (page_width - name_width) / 2,
        page_height - 96 * mm,
        participant_name
    )

    # =====================================================
    # PARTICIPATION DESCRIPTION
    # =====================================================

    pdf.setFillColor(colors.HexColor("#475569"))

    pdf.setFont(
        "Helvetica",
        12
    )

    description = (
        "for successfully participating in"
    )

    description_width = stringWidth(
        description,
        "Helvetica",
        12
    )

    pdf.drawString(
        (page_width - description_width) / 2,
        page_height - 113 * mm,
        description
    )

    # =====================================================
    # EVENT NAME
    # =====================================================

    pdf.setFillColor(colors.HexColor("#2563eb"))

    event_size = 20

    pdf.setFont(
        "Helvetica-Bold",
        event_size
    )

    event_width = stringWidth(
        event_name,
        "Helvetica-Bold",
        event_size
    )

    if event_width > page_width - 100 * mm:
        event_size = 16

        pdf.setFont(
            "Helvetica-Bold",
            event_size
        )

        event_width = stringWidth(
            event_name,
            "Helvetica-Bold",
            event_size
        )

    pdf.drawString(
        (page_width - event_width) / 2,
        page_height - 128 * mm,
        event_name
    )

    # =====================================================
    # EVENT INFORMATION
    # =====================================================

    pdf.setFillColor(colors.HexColor("#64748b"))

    pdf.setFont(
        "Helvetica",
        10
    )

    event_information = (
        f"Event Date: {event_date}    |    Venue: {venue}"
    )

    info_width = stringWidth(
        event_information,
        "Helvetica",
        10
    )

    pdf.drawString(
        (page_width - info_width) / 2,
        page_height - 143 * mm,
        event_information
    )

    # =====================================================
    # FOOTER
    # =====================================================

    issued_date = issued_at.strftime("%d %B %Y")

    pdf.setFillColor(colors.HexColor("#64748b"))

    pdf.setFont(
        "Helvetica",
        9
    )

    left_text = f"Issued: {issued_date}"

    pdf.drawString(
        35 * mm,
        27 * mm,
        left_text
    )

    right_text = f"Certificate ID: {certificate_id}"

    right_width = stringWidth(
        right_text,
        "Helvetica",
        9
    )

    pdf.drawString(
        page_width - 35 * mm - right_width,
        27 * mm,
        right_text
    )

    # =====================================================
    # SIGNATURE LINE
    # =====================================================

    pdf.setStrokeColor(colors.HexColor("#94a3b8"))
    pdf.setLineWidth(1)

    signature_x = page_width / 2 - 35 * mm

    pdf.line(
        signature_x,
        39 * mm,
        signature_x + 70 * mm,
        39 * mm
    )

    pdf.setFillColor(colors.HexColor("#64748b"))

    pdf.setFont(
        "Helvetica",
        8
    )

    signature_text = "EventSphere"

    signature_width = stringWidth(
        signature_text,
        "Helvetica",
        8
    )

    pdf.drawString(
        page_width / 2 - signature_width / 2,
        34 * mm,
        signature_text
    )

    # =====================================================
    # SAVE
    # =====================================================

    pdf.save()

    return str(file_path)