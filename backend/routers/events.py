from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.event import Event
from schemas.event import EventCreate
from routers.auth import get_current_user


router = APIRouter(
    prefix="/api/events",
    tags=["Events"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_event(
    event: EventCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "organizer":
        raise HTTPException(
            status_code=403,
            detail="Only organizers can create events"
        )

    new_event = Event(
        name=event.name,
        description=event.description,
        category=event.category,
        date=event.date,
        start_time=event.start_time,
        end_time=event.end_time,
        venue=event.venue,
        capacity=event.capacity,
        registration_deadline=event.registration_deadline,
        image_url=event.image_url,
        organizer_id=current_user["user_id"]
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return {
        "message": "Event created successfully",
        "event_id": new_event.id
    }
@router.get("/{event_id}")
def get_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(
        Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return event

@router.put("/{event_id}")
def update_event(
    event_id: int,
    event_data: EventCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "organizer":
        raise HTTPException(
            status_code=403,
            detail="Only organizers can edit events"
        )

    event = db.query(Event).filter(
        Event.id == event_id
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

    event.name = event_data.name
    event.description = event_data.description
    event.category = event_data.category
    event.date = event_data.date
    event.start_time = event_data.start_time
    event.end_time = event_data.end_time
    event.venue = event_data.venue
    event.capacity = event_data.capacity
    event.registration_deadline = (
        event_data.registration_deadline
    )
    event.image_url = event_data.image_url

    db.commit()
    db.refresh(event)

    return {
        "message": "Event updated successfully",
        "event_id": event.id
    }

@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "organizer":
        raise HTTPException(
            status_code=403,
            detail="Only organizers can delete events"
        )

    event = db.query(Event).filter(
        Event.id == event_id
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

    db.delete(event)
    db.commit()

    return {
        "message": "Event deleted successfully",
        "event_id": event_id
    }

@router.get("/")
def get_events(
    db: Session = Depends(get_db)
):
    events = db.query(Event).all()

    return events