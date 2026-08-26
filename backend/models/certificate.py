from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)

    registration_id = Column(
        Integer,
        ForeignKey("registrations.id"),
        nullable=False,
        unique=True
    )

    certificate_id = Column(
        String(100),
        unique=True,
        nullable=False
    )

    certificate_url = Column(
        String(500),
        nullable=True
    )

    issued_at = Column(
        DateTime,
        nullable=False
    )