from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timezone

from database import SessionLocal
from models.registration import Registration
from models.event import Event
from schemas.registration import RegistrationCreate
from routers.auth import get_current_user
from services.qr_service import generate_qr_code
from models.user import User
from models.attendance import Attendance
from models.certificate import Certificate


router = APIRouter(
    prefix="/api/registrations",
    tags=["Registrations"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/")
def register_for_event(
    registration: RegistrationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(
        Event.id == registration.event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    existing_registration = db.query(Registration).filter(
        Registration.user_id == current_user["user_id"],
        Registration.event_id == registration.event_id
    ).first()

    if existing_registration:
        raise HTTPException(
            status_code=400,
            detail="Already registered for this event"
        )

    registration_count = db.query(Registration).filter(
        Registration.event_id == registration.event_id
    ).count()

    if registration_count >= event.capacity:
        raise HTTPException(
            status_code=400,
            detail="Event is full"
        )

    qr_token = str(uuid.uuid4())

    qr_code_path = generate_qr_code(qr_token)

    new_registration = Registration(
        user_id=current_user["user_id"],
        event_id=registration.event_id,
        registration_date=datetime.now(timezone.utc),
        qr_token=qr_token,
        status="registered"
        )

    db.add(new_registration)
    db.commit()
    db.refresh(new_registration)

    return {
    "message": "Successfully registered for event",
    "registration_id": new_registration.id,
    "qr_token": new_registration.qr_token,
    "qr_code_url": f"/generated_qr/{new_registration.qr_token}.png"
}
@router.get("/my")
def get_my_registrations(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    registrations = (
        db.query(Registration, Event)
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

    for registration, event in registrations:
        result.append({
            "registration_id": registration.id,
            "event_id": event.id,
            "event_name": event.name,
            "description": event.description,
            "category": event.category,
            "date": event.date,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "venue": event.venue,
            "registration_date": registration.registration_date,
            "status": registration.status,
            "qr_token": registration.qr_token,
            "qr_code_url": f"/generated_qr/{registration.qr_token}.png",
        })

    return result

@router.get("/event/{event_id}")
def get_event_registrations(
    event_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
 ):
    # Only organizers can view event registrations
    if current_user["role"] != "organizer":
        raise HTTPException(
            status_code=403,
            detail="Only organizers can view event registrations"
        )

    # Find event
    event = db.query(Event).filter(
        Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    # Make sure organizer owns this event
    if event.organizer_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not own this event"
        )

    # Get ALL registrations for this event
    registrations = (
        db.query(Registration, User)
        .join(
            User,
            Registration.user_id == User.id
        )
        .filter(
            Registration.event_id == event_id
        )
        .all()
    )

    result = []

    for registration, user in registrations:

        certificate = db.query(Certificate).filter(
            Certificate.registration_id == registration.id
        ).first()

        result.append({
            "registration_id": registration.id,
            "user_id": user.id,
            "user_name": user.name,
            "user_email": user.email,
            "event_id": registration.event_id,
            "registration_date": registration.registration_date,
            "status": registration.status,

            "certificate_issued": (
                certificate is not None
            ),

            "certificate_id": (
                certificate.certificate_id
                if certificate
                else None
            ),

            "certificate_url": (
                certificate.certificate_url
                if certificate
                else None
            ),

            "certificate_issued_at": (
                certificate.issued_at
                if certificate
                else None
            )
        })

    return result
@router.post("/check-in")
def check_in_participant(
    qr_token: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "organizer":
        raise HTTPException(
            status_code=403,
            detail="Only organizers can check in participants"
        )

    registration = db.query(Registration).filter(
        Registration.qr_token == qr_token
    ).first()

    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Invalid QR code"
        )

    if registration.status == "checked_in":
        raise HTTPException(
            status_code=400,
            detail="Participant is already checked in"
        )

    registration.status = "checked_in"

    attendance = Attendance(
            registration_id=registration.id,
            check_in_time=datetime.now(timezone.utc)
        )

    db.add(attendance)

    db.commit()
    db.refresh(registration)

    return {
        "message": "Participant checked in successfully",
        "registration_id": registration.id,
        "event_id": registration.event_id,
        "status": registration.status
    }

@router.get("/organizer/stats")
def get_organizer_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "organizer":
        raise HTTPException(
            status_code=403,
            detail="Only organizers can view attendance statistics"
        )

    organizer_events = db.query(Event).filter(
        Event.organizer_id == current_user["user_id"]
    ).all()

    event_ids = [
        event.id for event in organizer_events
    ]

    if not event_ids:
        return {
            "total_events": 0,
            "total_registrations": 0,
            "checked_in": 0,
            "attendance_percentage": 0
        }

    registrations = (
    db.query(Registration)
    .join(
        User,
        Registration.user_id == User.id
    )
    .filter(
        Registration.event_id.in_(event_ids)
    )
    .all()
 )

    total_registrations = len(registrations)

    checked_in = sum(
        1
        for registration in registrations
        if registration.status == "checked_in"
    )

    attendance_percentage = (
        round(
            (checked_in / total_registrations) * 100
        )
        if total_registrations > 0
        else 0
    )

    return {
        "total_events": len(organizer_events),
        "total_registrations": total_registrations,
        "checked_in": checked_in,
        "attendance_percentage": attendance_percentage
    }