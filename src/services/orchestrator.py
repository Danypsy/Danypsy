"""Orchestrateur principal du système agentique."""

from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from ..agents import (
    BaseAgent,
    FinancingAgent,
    FormationAgent,
    OrientationAgent,
    DossierAgent
)
from ..models import UserProfile, Formation, Dossier
from ..knowledge import FinancingKnowledgeBase, FormationKnowledgeBase


class ConversationContext:
    """Contexte de conversation pour un utilisateur."""

    def __init__(self, user_id: str):
        self.user_id = user_id
        self.user_profile: Optional[UserProfile] = None
        self.selected_formation: Optional[Formation] = None
        self.current_dossier: Optional[Dossier] = None
        self.conversation_history: List[Dict[str, str]] = []
        self.current_step: str = "initial"  # initial, profile, orientation, formation, financing, dossier
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def add_message(self, role: str, content: str):
        """Ajoute un message à l'historique."""
        self.conversation_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convertit le contexte en dictionnaire."""
        return {
            "user_id": self.user_id,
            "user_profile": self.user_profile.dict() if self.user_profile else None,
            "selected_formation": self.selected_formation.dict() if self.selected_formation else None,
            "current_dossier": self.current_dossier.dict() if self.current_dossier else None,
            "current_step": self.current_step,
            "conversation_history": self.conversation_history
        }


class ChatbotOrchestrator:
    """
    Orchestrateur principal du chatbot agentique.

    Coordonne les différents agents spécialisés et gère le flux de conversation.
    """

    def __init__(self):
        # Initialiser les agents
        self.financing_agent = FinancingAgent()
        self.formation_agent = FormationAgent()
        self.orientation_agent = OrientationAgent()
        self.dossier_agent = DossierAgent()

        # Charger les bases de connaissances
        self.financing_kb = FinancingKnowledgeBase()
        self.formation_kb = FormationKnowledgeBase()

        # Injecter les connaissances dans les agents
        self.financing_agent.financing_schemes = self.financing_kb.get_all_schemes()
        self.formation_agent.formations_catalog = self.formation_kb.get_all_formations()

        # Contextes de conversation par utilisateur
        self.contexts: Dict[str, ConversationContext] = {}

        # Agent actuellement actif pour un utilisateur
        self.active_agents: Dict[str, BaseAgent] = {}

    def get_or_create_context(self, user_id: str) -> ConversationContext:
        """Récupère ou crée un contexte de conversation."""
        if user_id not in self.contexts:
            self.contexts[user_id] = ConversationContext(user_id)
        return self.contexts[user_id]

    def process_message(self, user_id: str, message: str) -> Dict[str, Any]:
        """
        Traite un message utilisateur.

        Args:
            user_id: Identifiant de l'utilisateur
            message: Message de l'utilisateur

        Returns:
            Réponse du chatbot avec les informations contextuelles
        """
        context = self.get_or_create_context(user_id)
        context.add_message("user", message)

        # Analyser l'intention du message
        intent = self._detect_intent(message, context)

        # Router vers le bon agent
        response = self._route_to_agent(intent, message, context)

        context.add_message("assistant", response["message"])

        return response

    def _detect_intent(self, message: str, context: ConversationContext) -> str:
        """
        Détecte l'intention de l'utilisateur.

        Args:
            message: Message utilisateur
            context: Contexte de conversation

        Returns:
            Type d'intention détecté
        """
        message_lower = message.lower()

        # Intentions de profil
        if any(word in message_lower for word in ["profil", "situation", "statut", "je suis"]):
            return "profile"

        # Intentions d'orientation
        if any(word in message_lower for word in [
            "orientation", "métier", "carrière", "reconversion",
            "que faire", "quel métier", "débouchés"
        ]):
            return "orientation"

        # Intentions de formation
        if any(word in message_lower for word in [
            "formation", "apprendre", "cours", "certif", "diplôme"
        ]):
            return "formation"

        # Intentions de financement
        if any(word in message_lower for word in [
            "financement", "cpf", "pôle emploi", "payer",
            "coût", "prix", "aide", "budget"
        ]):
            return "financing"

        # Intentions de dossier
        if any(word in message_lower for word in [
            "dossier", "document", "inscription", "candidature", "démarche"
        ]):
            return "dossier"

        # Par défaut, selon l'étape actuelle
        if context.current_step == "initial":
            return "greeting"
        elif not context.user_profile:
            return "profile"
        else:
            return "general"

    def _route_to_agent(
        self,
        intent: str,
        message: str,
        context: ConversationContext
    ) -> Dict[str, Any]:
        """
        Route la demande vers l'agent approprié.

        Args:
            intent: Intention détectée
            message: Message utilisateur
            context: Contexte de conversation

        Returns:
            Réponse structurée
        """
        if intent == "greeting":
            return self._handle_greeting(context)

        elif intent == "profile":
            return self._handle_profile(message, context)

        elif intent == "orientation":
            return self._handle_orientation(message, context)

        elif intent == "formation":
            return self._handle_formation(message, context)

        elif intent == "financing":
            return self._handle_financing(message, context)

        elif intent == "dossier":
            return self._handle_dossier(message, context)

        else:
            return self._handle_general(message, context)

    def _handle_greeting(self, context: ConversationContext) -> Dict[str, Any]:
        """Gère l'accueil initial."""
        context.current_step = "profile"

        return {
            "message": (
                "Bonjour ! Je suis votre assistant personnel en insertion professionnelle. "
                "Je suis là pour vous aider à :\n\n"
                "✓ Définir votre projet professionnel\n"
                "✓ Trouver la formation adaptée\n"
                "✓ Identifier les financements possibles\n"
                "✓ Monter votre dossier de financement\n\n"
                "Pour commencer, parlez-moi de votre situation actuelle : "
                "êtes-vous demandeur d'emploi, salarié, ou dans une autre situation ?"
            ),
            "intent": "greeting",
            "suggestions": [
                "Je suis demandeur d'emploi",
                "Je suis salarié en reconversion",
                "Je suis en recherche d'orientation"
            ]
        }

    def _handle_profile(self, message: str, context: ConversationContext) -> Dict[str, Any]:
        """Gère la construction du profil utilisateur."""
        # Dans une vraie implémentation, on utiliserait du NLP pour extraire les infos
        # Ici, version simplifiée

        if not context.user_profile:
            # Créer un profil de base
            context.user_profile = UserProfile(
                name=context.user_id,
                employment_status="demandeur_emploi"  # Par défaut
            )

        return {
            "message": (
                "Merci ! Pour mieux vous accompagner, j'aimerais en savoir plus :\n\n"
                "• Quel est votre métier actuel ou votre dernière expérience professionnelle ?\n"
                "• Combien d'années d'expérience avez-vous ?\n"
                "• Quelles sont vos compétences principales ?\n"
                "• Quel métier vous intéresse ?\n\n"
                "N'hésitez pas à partager ces informations pour que je puisse vous proposer "
                "les formations et financements les plus adaptés."
            ),
            "intent": "profile",
            "profile_data": context.user_profile.dict(),
            "suggestions": [
                "Je voudrais me reconvertir dans le digital",
                "Je cherche à me former en data",
                "Je veux devenir développeur web"
            ]
        }

    def _handle_orientation(self, message: str, context: ConversationContext) -> Dict[str, Any]:
        """Gère les demandes d'orientation."""
        if not context.user_profile:
            return {
                "message": "Pour vous conseiller, j'ai besoin d'en savoir plus sur votre profil. Pouvez-vous me parler de votre situation ?",
                "intent": "orientation",
                "requires": "profile"
            }

        # Analyser avec l'agent d'orientation
        analysis = self.orientation_agent.analyze({
            "user_profile": context.user_profile
        })

        suggestions = analysis.get("career_suggestions", [])[:3]

        message_text = "Voici les pistes de carrière qui correspondent à votre profil :\n\n"

        for i, suggestion in enumerate(suggestions, 1):
            message_text += f"{i}. **{suggestion['job_title']}** ({suggestion['sector']})\n"
            message_text += f"   Score de correspondance: {suggestion['match_score']:.0%}\n"
            if suggestion.get('average_salary'):
                message_text += f"   Salaire moyen: {suggestion['average_salary']}€/an\n"
            message_text += "\n"

        message_text += "\nSouhaitez-vous explorer une de ces pistes en particulier ?"

        context.current_step = "orientation"

        return {
            "message": message_text,
            "intent": "orientation",
            "data": analysis,
            "suggestions": [s['job_title'] for s in suggestions]
        }

    def _handle_formation(self, message: str, context: ConversationContext) -> Dict[str, Any]:
        """Gère les demandes sur les formations."""
        if not context.user_profile:
            return {
                "message": "Pour vous proposer les formations adaptées, j'ai besoin de connaître votre profil. Parlez-moi de votre situation.",
                "intent": "formation",
                "requires": "profile"
            }

        # Rechercher des formations
        formations = self.formation_agent.find_matching_formations(context.user_profile, max_results=5)

        if not formations:
            message_text = "Je n'ai pas trouvé de formations correspondant exactement à vos critères. Pouvez-vous préciser votre recherche ?"
        else:
            message_text = f"J'ai trouvé {len(formations)} formations adaptées à votre profil :\n\n"

            for i, formation in enumerate(formations, 1):
                message_text += f"{i}. **{formation.title}**\n"
                message_text += f"   Organisme: {formation.provider}\n"
                message_text += f"   Durée: {formation.duration_description}\n"
                message_text += f"   Prix: {formation.price}€\n"
                message_text += f"   CPF: {'✓' if formation.cpf_eligible else '✗'}\n"
                message_text += f"   Mode: {formation.delivery_mode.value}\n\n"

            message_text += "Quelle formation vous intéresse ? Je peux vous donner plus de détails et vous aider à monter le financement."

        context.current_step = "formation"

        return {
            "message": message_text,
            "intent": "formation",
            "formations": [f.dict() for f in formations],
            "suggestions": [f.title for f in formations[:3]]
        }

    def _handle_financing(self, message: str, context: ConversationContext) -> Dict[str, Any]:
        """Gère les demandes sur le financement."""
        if not context.user_profile:
            return {
                "message": "Pour identifier les financements possibles, j'ai besoin de connaître votre situation. Êtes-vous demandeur d'emploi, salarié ?",
                "intent": "financing",
                "requires": "profile"
            }

        if not context.selected_formation:
            return {
                "message": "Pour calculer le financement, avez-vous déjà choisi une formation ? Je peux vous aider à en trouver une.",
                "intent": "financing",
                "requires": "formation"
            }

        # Analyser les options de financement
        analysis = self.financing_agent.analyze({
            "user_profile": context.user_profile,
            "formation": context.selected_formation
        })

        plan = analysis.get("financing_plan", {})
        eligible_schemes = analysis.get("eligible_schemes", [])

        message_text = f"**Plan de financement pour {context.selected_formation.title}**\n\n"
        message_text += f"Coût total: {plan.get('total_cost', 0):.2f}€\n"
        message_text += f"Financement possible: {plan.get('total_financed', 0):.2f}€ ({plan.get('coverage_rate', 0):.1f}%)\n"
        message_text += f"Reste à charge: {plan.get('personal_contribution', 0):.2f}€\n\n"

        if plan.get('financing_sources'):
            message_text += "**Sources de financement identifiées:**\n\n"
            for source in plan['financing_sources']:
                message_text += f"• {source['scheme']}: {source['amount']:.2f}€\n"

        message_text += "\n**Dispositifs éligibles:**\n\n"
        for scheme in eligible_schemes[:3]:
            message_text += f"• **{scheme['name']}**\n"
            message_text += f"  {scheme['description'][:150]}...\n\n"

        message_text += "\nVoulez-vous que je vous aide à monter le dossier de financement ?"

        context.current_step = "financing"

        return {
            "message": message_text,
            "intent": "financing",
            "data": analysis,
            "suggestions": [
                "Oui, aidez-moi à monter le dossier",
                "Donnez-moi plus de détails sur le CPF",
                "Comment fonctionne l'AIF de Pôle Emploi ?"
            ]
        }

    def _handle_dossier(self, message: str, context: ConversationContext) -> Dict[str, Any]:
        """Gère le montage de dossier."""
        if not context.user_profile or not context.selected_formation:
            return {
                "message": "Pour monter un dossier, j'ai besoin de connaître votre profil et la formation choisie.",
                "intent": "dossier",
                "requires": "profile_and_formation"
            }

        if not context.current_dossier:
            # Créer un nouveau dossier
            eligible_schemes = self.financing_agent.find_eligible_schemes(
                context.user_profile,
                context.selected_formation
            )

            context.current_dossier = self.dossier_agent.create_dossier(
                user_profile_id=context.user_id,
                formation_id=context.selected_formation.id,
                financing_schemes=eligible_schemes,
                formation_cost=context.selected_formation.price
            )

        # Analyser le dossier
        analysis = self.dossier_agent.analyze({
            "dossier": context.current_dossier
        })

        completeness = analysis.get("completeness", {})
        timeline = analysis.get("timeline", {})
        alerts = analysis.get("alerts", [])

        message_text = f"**Votre dossier de financement**\n\n"
        message_text += f"Progression: {completeness.get('completion_rate', 0):.1f}%\n"
        message_text += f"Documents: {completeness.get('completed_documents', 0)}/{completeness.get('total_documents', 0)}\n\n"

        if completeness.get('missing_required'):
            message_text += "**Documents manquants:**\n"
            for doc in completeness['missing_required'][:5]:
                message_text += f"• {doc['name']}\n"
            message_text += "\n"

        if alerts:
            message_text += "**Alertes:**\n"
            for alert in alerts[:3]:
                emoji = "🔴" if alert['type'] == 'urgent' else "⚠️" if alert['type'] == 'warning' else "ℹ️"
                message_text += f"{emoji} {alert['title']}: {alert['message']}\n"
            message_text += "\n"

        message_text += "Je peux vous guider pour chaque document. Lequel souhaitez-vous préparer en premier ?"

        context.current_step = "dossier"

        return {
            "message": message_text,
            "intent": "dossier",
            "data": analysis,
            "suggestions": [
                "Comment obtenir une attestation Pôle Emploi ?",
                "Quels justificatifs de domicile sont acceptés ?",
                "Aidez-moi à rédiger ma lettre de motivation"
            ]
        }

    def _handle_general(self, message: str, context: ConversationContext) -> Dict[str, Any]:
        """Gère les questions générales."""
        return {
            "message": (
                "Je suis là pour vous aider avec votre projet professionnel. "
                "Je peux vous accompagner sur :\n\n"
                "• L'orientation professionnelle\n"
                "• La recherche de formations\n"
                "• Le financement de votre formation\n"
                "• Le montage de votre dossier\n\n"
                "Sur quel sujet souhaitez-vous mon aide ?"
            ),
            "intent": "general",
            "suggestions": [
                "Trouver une formation",
                "Calculer mon financement",
                "M'orienter professionnellement"
            ]
        }

    def get_user_summary(self, user_id: str) -> Dict[str, Any]:
        """Retourne un résumé de la situation de l'utilisateur."""
        context = self.get_or_create_context(user_id)

        return {
            "user_id": user_id,
            "current_step": context.current_step,
            "has_profile": context.user_profile is not None,
            "has_formation": context.selected_formation is not None,
            "has_dossier": context.current_dossier is not None,
            "conversation_length": len(context.conversation_history),
            "context": context.to_dict()
        }

    def reset_context(self, user_id: str):
        """Réinitialise le contexte d'un utilisateur."""
        if user_id in self.contexts:
            del self.contexts[user_id]
