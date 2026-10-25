
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func

from database import Base


class CertificateTemplate(Base):
    __tablename__ = "certificate_templates"

    id = Column(Integer, primary_key=True, index=True)

    event_id = Column(
        Integer,
        ForeignKey("events.id"),
        unique=True,
        nullable=False,
        index=True
    )

    organization_name = Column(String(255), nullable=True)
    logo_url = Column(String(1000), nullable=True)

    certificate_title = Column(
        String(255),
        nullable=False,
        default="Certificate of Participation"
    )

    certificate_text = Column(
        Text,
        nullable=True,
        default="This certificate is presented to {participant_name} for participating in {event_name}."
    )

    primary_color = Column(
        String(20),
        nullable=False,
        default="#1D4ED8"
    )

    signer_name = Column(String(255), nullable=True)
    signer_title = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
