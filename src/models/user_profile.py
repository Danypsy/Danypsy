"""Modèle de profil utilisateur."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class EmploymentStatus(str, Enum):
    """Statut d'emploi."""
    UNEMPLOYED = "demandeur_emploi"
    EMPLOYED = "salarie"
    SELF_EMPLOYED = "independant"
    STUDENT = "etudiant"
    INACTIVE = "inactif"


class UserProfile(BaseModel):
    """Profil d'un utilisateur du service d'insertion professionnelle."""

    id: Optional[str] = None
    name: str
    age: Optional[int] = None
    employment_status: EmploymentStatus

    # Informations professionnelles
    current_job: Optional[str] = None
    work_experience_years: Optional[int] = 0
    skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)

    # Informations administratives
    pole_emploi_registered: bool = False
    pole_emploi_id: Optional[str] = None
    cpf_balance: Optional[float] = None  # Compte Personnel de Formation en euros
    has_handicap_status: bool = False

    # Projet professionnel
    target_job: Optional[str] = None
    target_sector: Optional[str] = None
    desired_formations: List[str] = Field(default_factory=list)
    geographic_mobility: bool = False

    # Situation financière
    monthly_income: Optional[float] = None
    financial_constraints: Optional[str] = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        use_enum_values = True
        json_schema_extra = {
            "example": {
                "name": "Marie Dupont",
                "age": 32,
                "employment_status": "demandeur_emploi",
                "work_experience_years": 8,
                "skills": ["gestion de projet", "communication", "bureautique"],
                "pole_emploi_registered": True,
                "cpf_balance": 2500.0,
                "target_job": "Chef de projet digital",
                "desired_formations": ["Formation Product Owner", "Certification Scrum Master"]
            }
        }
