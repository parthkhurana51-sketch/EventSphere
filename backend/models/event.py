from sqlalchemy import Column, Integer, String, Text, Date, Time, ForeignKey
from database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)

    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    venue = Column(String(200), nullable=False)
    capacity = Column(Integer, nullable=False)

    registration_deadline = Column(Date, nullable=False)

    image_url = Column(String(500), nullable=True)

    status = Column(
        String(30),
        nullable=False,
        default="draft"
    )

    organizer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )