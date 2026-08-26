from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    event_id = Column(
        Integer,
        ForeignKey("events.id"),
        nullable=False
    )

    role = Column(
        String(100),
        nullable=False
    )

    shift = Column(
        String(100),
        nullable=True
    )

    status = Column(
        String(30),
        nullable=False,
        default="pending"
    )