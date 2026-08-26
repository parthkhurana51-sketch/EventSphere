from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import SessionLocal
from models.registration import Registration
from models.attendance import Attendance
from schemas.checkin import CheckInRequest
from routers.auth import get_current_user


router = APIRouter(
    prefix="/api/checkin",
    tags=["Check-In"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/")
def check_in_participant(
    checkin: CheckInRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "organizer":
        raise HTTPException(
            status_code=403,
            detail="Only organizers can check in participants"
        )

    registration = db.query(Registration).filter(
        Registration.qr_token == checkin.qr_token
    ).first()

    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Invalid QR code"
        )

    existing_attendance = db.query(Attendance).filter(
        Attendance.registration_id == registration.id
    ).first()

    if existing_attendance:
        raise HTTPException(
            status_code=400,
            detail="Participant already checked in"
        )

    attendance = Attendance(
        registration_id=registration.id,
        check_in_time=datetime.now(timezone.utc)
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return {
        "message": "Participant checked in successfully",
        "registration_id": registration.id,
        "check_in_time": attendance.check_in_time
    }