from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid
from services.certificate_service import generate_certificate_pdf
from models.certificate_template import CertificateTemplate
from schemas.certificate_template import CertificateTemplateUpdate
from database import SessionLocal
from routers.auth import get_current_user

from models.certificate import Certificate
from models.registration import Registration
from models.event import Event
from models.user import User


router = APIRouter(
    prefix="/api/certificates",
    tags=["Certificates"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# ISSUE CERTIFICATE
# =========================================================

@router.post("/issue/{registration_id}")
def issue_certificate(
    registration_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user["role"] != "organizer":
        raise HTTPException(
            status_code=403,
            detail="Only organizers can issue certificates"
        )

    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Registration not found"
        )

    event = db.query(Event).filter(
        Event.id == registration.event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if event.organizer_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not own this event"
        )

    if registration.status != "checked_in":
        raise HTTPException(
            status_code=400,
            detail=(
                "Participant must be checked in "
                "before a certificate can be issued"
            )
        )

    existing_certificate = db.query(Certificate).filter(
        Certificate.registration_id == registration_id
    ).first()

    if existing_certificate:
        raise HTTPException(
            status_code=400,
            detail="Certificate has already been issued"
        )

    participant = db.query(User).filter(
        User.id == registration.user_id
    ).first()

    if not participant:
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    # Generate unique certificate ID
    certificate_id = (
        f"ES-{datetime.now().year}-"
        f"{uuid.uuid4().hex[:8].upper()}"
    )

    issued_at = datetime.now(timezone.utc)

    # Generate PDF
    generate_certificate_pdf(
        certificate_id=certificate_id,
        participant_name=participant.name,
        event_name=event.name,
        event_date=event.date,
        venue=event.venue,
        issued_at=issued_at
    )

    certificate_url = (
        f"/generated_certificates/{certificate_id}.pdf"
    )

    certificate = Certificate(
        registration_id=registration_id,
        certificate_id=certificate_id,
        certificate_url=certificate_url,
        issued_at=issued_at
    )

    db.add(certificate)
    db.commit()
    db.refresh(certificate)

    return {
        "message": "Certificate issued successfully",
        "certificate_id": certificate.certificate_id,
        "registration_id": certificate.registration_id,
        "issued_at": certificate.issued_at,
        "certificate_url": certificate.certificate_url
    }


# =========================================================
# CERTIFICATE TEMPLATE SETTINGS
# =========================================================

@router.get("/template/{event_id}")
def get_certificate_template(
    event_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "organizer":
        raise HTTPException(
            status_code=403,
            detail="Only organizers can manage certificate templates"
        )

    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if event.organizer_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not own this event"
        )

    template = db.query(CertificateTemplate).filter(
        CertificateTemplate.event_id == event_id
    ).first()

    if not template:
        return {
            "event_id": event_id,
            "organization_name": None,
            "logo_url": None,
            "certificate_title": "Certificate of Participation",
            "certificate_text": (
                "This certificate is presented to "
                "{participant_name} for participating in {event_name}."
            ),
            "primary_color": "#1D4ED8",
            "signer_name": None,
            "signer_title": None,
            "saved": False
        }

    return {
        "event_id": template.event_id,
        "organization_name": template.organization_name,
        "logo_url": template.logo_url,
        "certificate_title": template.certificate_title,
        "certificate_text": template.certificate_text,
        "primary_color": template.primary_color,
        "signer_name": template.signer_name,
        "signer_title": template.signer_title,
        "saved": True
    }


@router.put("/template/{event_id}")
def save_certificate_template(
    event_id: int,
    payload: CertificateTemplateUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "organizer":
        raise HTTPException(
            status_code=403,
            detail="Only organizers can manage certificate templates"
        )

    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if event.organizer_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not own this event"
        )

    updates = payload.dict(exclude_unset=True)

    if "certificate_title" in updates:
        if not updates["certificate_title"] or not updates["certificate_title"].strip():
            raise HTTPException(
                status_code=422,
                detail="Certificate title cannot be empty"
            )

    if "primary_color" in updates:
        import re

        if not re.fullmatch(r"#[0-9a-fA-F]{6}", updates["primary_color"] or ""):
            raise HTTPException(
                status_code=422,
                detail="Primary color must be a hexadecimal color such as #1D4ED8"
            )

    template = db.query(CertificateTemplate).filter(
        CertificateTemplate.event_id == event_id
    ).first()

    if template:
        for field, value in updates.items():
            setattr(template, field, value)
    else:
        template = CertificateTemplate(
            event_id=event_id,
            **updates
        )
        db.add(template)

    try:
        db.commit()
        db.refresh(template)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not save certificate template"
        )

    return {
        "message": "Certificate template saved successfully",
        "event_id": template.event_id,
        "organization_name": template.organization_name,
        "logo_url": template.logo_url,
        "certificate_title": template.certificate_title,
        "certificate_text": template.certificate_text,
        "primary_color": template.primary_color,
        "signer_name": template.signer_name,
        "signer_title": template.signer_title,
        "saved": True
    }

# =========================================================
# PARTICIPANT CERTIFICATES
# =========================================================

@router.get("/my")
def get_my_certificates(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    certificates = (
        db.query(
            Certificate,
            Registration,
            Event
        )
        .join(
            Registration,
            Certificate.registration_id == Registration.id
        )
        .join(
            Event,
            Registration.event_id == Event.id
        )
        .filter(
            Registration.user_id == current_user["user_id"]
        )
        .all()
    )

    result = []

    for certificate, registration, event in certificates:

        result.append({
            "certificate_id": certificate.certificate_id,
            "registration_id": registration.id,
            "event_id": event.id,
            "event_name": event.name,
            "event_date": event.date,
            "venue": event.venue,
            "issued_at": certificate.issued_at,
            "certificate_url": certificate.certificate_url
        })

    return result


# =========================================================
# GET CERTIFICATE
# =========================================================

@router.get("/{certificate_id}")
def get_certificate(
    certificate_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    certificate = db.query(Certificate).filter(
        Certificate.certificate_id == certificate_id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )

    registration = db.query(Registration).filter(
        Registration.id == certificate.registration_id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Registration not found"
        )

    event = db.query(Event).filter(
        Event.id == registration.event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    # Participant can view their own certificate
    if current_user["role"] == "participant":

        if registration.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="You do not have access to this certificate"
            )

    # Organizer can view certificates for their own event
    elif current_user["role"] == "organizer":

        if event.organizer_id != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="You do not own this event"
            )

    else:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    participant = db.query(User).filter(
        User.id == registration.user_id
    ).first()

    return {
        "certificate_id": certificate.certificate_id,
        "participant_name": participant.name if participant else "Participant",
        "participant_email": participant.email if participant else None,
        "event_id": event.id,
        "event_name": event.name,
        "event_date": event.date,
        "venue": event.venue,
        "issued_at": certificate.issued_at,
        "certificate_url": certificate.certificate_url
    }