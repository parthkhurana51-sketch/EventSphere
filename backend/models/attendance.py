from sqlalchemy import Column, Integer, DateTime, ForeignKey
from database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    registration_id = Column(
        Integer,
        ForeignKey("registrations.id"),
        nullable=False,
        unique=True
    )

    check_in_time = Column(
        DateTime,
        nullable=False
    )