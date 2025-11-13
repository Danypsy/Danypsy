"""Modèle de formation professionnelle."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class FormationType(str, Enum):
    """Type de formation."""
    CERTIFYING = "certifiante"
    QUALIFYING = "qualifiante"
    SKILLS_DEVELOPMENT = "developpement_competences"
    PROFESSIONAL_LICENSE = "licence_professionnelle"
    DEGREE = "diplome"
    SHORT_TRAINING = "formation_courte"


class DeliveryMode(str, Enum):
    """Mode de délivrance."""
    IN_PERSON = "presentiel"
    REMOTE = "distanciel"
    HYBRID = "hybride"


class Formation(BaseModel):
    """Formation professionnelle."""

    id: Optional[str] = None
    title: str
    provider: str
    description: str

    # Caractéristiques
    formation_type: FormationType
    delivery_mode: DeliveryMode
    duration_hours: int
    duration_description: str  # "3 mois", "6 semaines", etc.

    # Contenu
    objectives: List[str] = Field(default_factory=list)
    program: Optional[str] = None
    prerequisites: List[str] = Field(default_factory=list)
    skills_acquired: List[str] = Field(default_factory=list)

    # Certification
    certification_name: Optional[str] = None
    rncp_code: Optional[str] = None  # Code RNCP (Répertoire National des Certifications Professionnelles)

    # Informations pratiques
    locations: List[str] = Field(default_factory=list)
    start_dates: List[datetime] = Field(default_factory=list)
    schedule: Optional[str] = None

    # Coûts
    price: float
    price_per_hour: Optional[float] = None

    # Financement
    cpf_eligible: bool = False
    pole_emploi_eligible: bool = False
    opco_eligible: bool = False
    region_eligible: bool = False

    # Débouchés
    job_opportunities: List[str] = Field(default_factory=list)
    employment_rate: Optional[float] = None

    # Contact
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None

    class Config:
        use_enum_values = True
        json_schema_extra = {
            "example": {
                "title": "Formation Product Owner",
                "provider": "OpenClassrooms",
                "description": "Devenez Product Owner et pilotez le développement de produits digitaux",
                "formation_type": "certifiante",
                "delivery_mode": "distanciel",
                "duration_hours": 450,
                "duration_description": "6 mois à temps partiel",
                "price": 4500.0,
                "cpf_eligible": True,
                "pole_emploi_eligible": True,
                "rncp_code": "RNCP35635"
            }
        }
