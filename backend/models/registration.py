from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base


class Registration(Base):
    __tablename__ = "registrations"

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

    registration_date = Column(
        DateTime,
        nullable=False
    )

    qr_token = Column(
        String(255),
        unique=True,
        nullable=False
    )

    status = Column(
        String(30),
        nullable=False,
        default="registered"
    )