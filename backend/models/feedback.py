from sqlalchemy import Column, Integer, Text, ForeignKey
from database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)

    registration_id = Column(
        Integer,
        ForeignKey("registrations.id"),
        nullable=False,
        unique=True
    )

    rating = Column(
        Integer,
        nullable=False
    )

    comment = Column(
        Text,
        nullable=True
    )