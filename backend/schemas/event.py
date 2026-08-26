from pydantic import BaseModel
from datetime import date, time


class EventCreate(BaseModel):
    name: str
    description: str | None = None
    category: str

    date: date
    start_time: time
    end_time: time

    venue: str
    capacity: int
    registration_deadline: date

    image_url: str | None = None