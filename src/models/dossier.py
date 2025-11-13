"""Modèle de dossier de financement."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class DossierStatus(str, Enum):
    """Statut d'un dossier de financement."""
    INITIATED = "initie"
    IN_PROGRESS = "en_cours"
    READY_TO_SUBMIT = "pret_a_deposer"
    SUBMITTED = "depose"
    VALIDATED = "valide"
    INCOMPLETE = "incomplet"
    REJECTED = "refuse"


class DocumentStatus(str, Enum):
    """Statut d'un document."""
    MISSING = "manquant"
    IN_PROGRESS = "en_cours"
    READY = "pret"
    SUBMITTED = "depose"
    VALIDATED = "valide"


class Document(BaseModel):
    """Document d'un dossier."""

    name: str
    description: str
    status: DocumentStatus = DocumentStatus.MISSING
    file_path: Optional[str] = None
    required: bool = True
    deadline: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        use_enum_values = True


class Dossier(BaseModel):
    """Dossier complet de montage de financement."""

    id: Optional[str] = None
    user_profile_id: str
    formation_id: str

    # Financements combinés
    financing_applications: List[str] = Field(default_factory=list)  # IDs des demandes
    total_cost: float
    total_financing: float = 0.0
    personal_contribution: float = 0.0

    # Statut général
    status: DossierStatus = DossierStatus.INITIATED
    completion_percentage: float = 0.0

    # Documents
    documents: List[Document] = Field(default_factory=list)

    # Timeline
    training_start_date: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Suivi
    timeline: List[Dict[str, str]] = Field(default_factory=list)  # Historique des actions
    alerts: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)

    class Config:
        use_enum_values = True

    def calculate_completion(self) -> float:
        """Calcule le pourcentage de complétion du dossier."""
        if not self.documents:
            return 0.0

        completed = sum(1 for doc in self.documents if doc.status in [DocumentStatus.READY, DocumentStatus.SUBMITTED, DocumentStatus.VALIDATED])
        return (completed / len(self.documents)) * 100

    def get_missing_documents(self) -> List[Document]:
        """Retourne la liste des documents manquants."""
        return [doc for doc in self.documents if doc.status == DocumentStatus.MISSING and doc.required]

    def calculate_financing_gap(self) -> float:
        """Calcule le reste à financer."""
        return max(0, self.total_cost - self.total_financing)
