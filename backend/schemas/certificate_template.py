
from pydantic import BaseModel
from typing import Optional


class CertificateTemplateUpdate(BaseModel):
    organization_name: Optional[str] = None
    logo_url: Optional[str] = None
    certificate_title: Optional[str] = None
    certificate_text: Optional[str] = None
    primary_color: Optional[str] = None
    signer_name: Optional[str] = None
    signer_title: Optional[str] = None
