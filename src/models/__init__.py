"""Modèles de données pour le chatbot d'insertion professionnelle."""

from .user_profile import UserProfile
from .formation import Formation
from .financing import FinancingScheme, FinancingApplication
from .dossier import Dossier

__all__ = [
    'UserProfile',
    'Formation',
    'FinancingScheme',
    'FinancingApplication',
    'Dossier'
]
