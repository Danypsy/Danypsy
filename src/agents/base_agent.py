"""Agent de base pour le système agentique."""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
import json


class AgentMessage:
    """Message échangé entre agents."""

    def __init__(
        self,
        sender: str,
        receiver: str,
        content: str,
        message_type: str = "info",
        data: Optional[Dict[str, Any]] = None
    ):
        self.sender = sender
        self.receiver = receiver
        self.content = content
        self.message_type = message_type
        self.data = data or {}
        self.timestamp = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convertit le message en dictionnaire."""
        return {
            "sender": self.sender,
            "receiver": self.receiver,
            "content": self.content,
            "message_type": self.message_type,
            "data": self.data,
            "timestamp": self.timestamp.isoformat()
        }


class BaseAgent(ABC):
    """Classe de base pour tous les agents spécialisés."""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.message_history: List[AgentMessage] = []
        self.knowledge_base: Dict[str, Any] = {}
        self.active = True

    @abstractmethod
    def process_message(self, message: AgentMessage) -> AgentMessage:
        """
        Traite un message entrant et retourne une réponse.

        Args:
            message: Message à traiter

        Returns:
            AgentMessage: Réponse de l'agent
        """
        pass

    @abstractmethod
    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyse des données spécifiques au domaine de l'agent.

        Args:
            data: Données à analyser

        Returns:
            Dict contenant les résultats de l'analyse
        """
        pass

    def send_message(
        self,
        receiver: str,
        content: str,
        message_type: str = "info",
        data: Optional[Dict[str, Any]] = None
    ) -> AgentMessage:
        """
        Crée et enregistre un message sortant.

        Args:
            receiver: Nom de l'agent destinataire
            content: Contenu du message
            message_type: Type de message
            data: Données additionnelles

        Returns:
            AgentMessage créé
        """
        message = AgentMessage(
            sender=self.name,
            receiver=receiver,
            content=content,
            message_type=message_type,
            data=data
        )
        self.message_history.append(message)
        return message

    def receive_message(self, message: AgentMessage) -> None:
        """
        Reçoit et enregistre un message entrant.

        Args:
            message: Message reçu
        """
        self.message_history.append(message)

    def get_capabilities(self) -> List[str]:
        """
        Retourne la liste des capacités de l'agent.

        Returns:
            Liste des capacités
        """
        return []

    def update_knowledge(self, key: str, value: Any) -> None:
        """
        Met à jour la base de connaissances de l'agent.

        Args:
            key: Clé de la connaissance
            value: Valeur à stocker
        """
        self.knowledge_base[key] = value

    def get_knowledge(self, key: str) -> Optional[Any]:
        """
        Récupère une connaissance de la base.

        Args:
            key: Clé de la connaissance

        Returns:
            Valeur stockée ou None
        """
        return self.knowledge_base.get(key)

    def get_status(self) -> Dict[str, Any]:
        """
        Retourne le statut actuel de l'agent.

        Returns:
            Dict contenant les informations de statut
        """
        return {
            "name": self.name,
            "description": self.description,
            "active": self.active,
            "messages_count": len(self.message_history),
            "knowledge_items": len(self.knowledge_base)
        }

    def __str__(self) -> str:
        return f"Agent({self.name}): {self.description}"
