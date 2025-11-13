"""Modèles de financement de formations."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class FinancingType(str, Enum):
    """Types de dispositifs de financement."""
    CPF = "cpf"  # Compte Personnel de Formation
    POLE_EMPLOI_AIF = "aif"  # Aide Individuelle à la Formation
    POLE_EMPLOI_AFPR = "afpr"  # Action de Formation Préalable au Recrutement
    POLE_EMPLOI_POEI = "poei"  # Préparation Opérationnelle à l'Emploi Individuelle
    OPCO = "opco"  # Opérateur de Compétences
    REGION = "region"  # Conseil Régional
    AGEFIPH = "agefiph"  # Association de Gestion du Fonds pour l'Insertion des Personnes Handicapées
    TRANSITION_PRO = "transition_pro"  # Projet de Transition Professionnelle
    PDC = "pdc"  # Plan de Développement des Compétences (employeur)
    PERSONAL = "personnel"  # Financement personnel


class ApplicationStatus(str, Enum):
    """Statut d'une demande de financement."""
    DRAFT = "brouillon"
    PENDING = "en_cours"
    SUBMITTED = "depose"
    UNDER_REVIEW = "en_examen"
    APPROVED = "approuve"
    REJECTED = "refuse"
    INCOMPLETE = "incomplet"


class FinancingScheme(BaseModel):
    """Dispositif de financement de formation."""

    id: Optional[str] = None
    name: str
    financing_type: FinancingType
    description: str

    # Éligibilité
    eligibility_criteria: List[str] = Field(default_factory=list)
    excluded_profiles: List[str] = Field(default_factory=list)

    # Montants
    max_amount: Optional[float] = None
    coverage_percentage: Optional[float] = None  # Pourcentage de prise en charge

    # Conditions
    required_documents: List[str] = Field(default_factory=list)
    processing_time_days: Optional[int] = None
    deadline_before_training: Optional[int] = None  # Nombre de jours avant le début

    # Procédure
    application_process: List[str] = Field(default_factory=list)
    contact_info: Optional[str] = None
    website: Optional[str] = None

    # Combinaison
    can_combine_with: List[FinancingType] = Field(default_factory=list)

    # Spécificités
    requirements: Dict[str, str] = Field(default_factory=dict)
    additional_benefits: List[str] = Field(default_factory=list)

    class Config:
        use_enum_values = True


class FinancingApplication(BaseModel):
    """Demande de financement."""

    id: Optional[str] = None
    user_profile_id: str
    formation_id: str
    financing_scheme_id: str

    # Montants
    formation_cost: float
    requested_amount: float
    approved_amount: Optional[float] = None
    personal_contribution: Optional[float] = None

    # Statut
    status: ApplicationStatus = ApplicationStatus.DRAFT
    submission_date: Optional[datetime] = None
    decision_date: Optional[datetime] = None

    # Documents
    submitted_documents: List[str] = Field(default_factory=list)
    missing_documents: List[str] = Field(default_factory=list)

    # Suivi
    notes: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        use_enum_values = True
