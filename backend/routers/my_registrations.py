from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models.registration import Registration
from models.event import Event
from models.attendance import Attendance
from routers.auth import get_current_user


router = APIRouter(
    prefix="/api/my",
    tags=["My Dashboard"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/registrations")
def get_my_registrations(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    registrations = db.query(Registration).filter(
        Registration.user_id == current_user["user_id"]
    ).all()

    result = []

    for registration in registrations:

        event = db.query(Event).filter(
            Event.id == registration.event_id
        ).first()

        attendance = db.query(Attendance).filter(
            Attendance.registration_id == registration.id
        ).first()

        result.append({
            "registration_id": registration.id,
            "event_id": event.id,
            "event_name": event.name,
            "category": event.category,
            "date": event.date,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "venue": event.venue,
            "status": registration.status,
            "checked_in": attendance is not None,
            "check_in_time": (
                attendance.check_in_time
                if attendance
                else None
            ),
            "qr_token": registration.qr_token
        })

    return result