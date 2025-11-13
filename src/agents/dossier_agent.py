"""Agent spécialisé dans le montage de dossiers de financement."""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from .base_agent import BaseAgent, AgentMessage
from ..models import Dossier, Document, DocumentStatus, DossierStatus, FinancingScheme


class DossierAgent(BaseAgent):
    """
    Agent expert en montage de dossiers de financement.

    Compétences:
    - Création et suivi de dossiers
    - Gestion documentaire
    - Vérification de complétude
    - Génération d'alertes et rappels
    - Optimisation du calendrier de soumission
    """

    def __init__(self):
        super().__init__(
            name="DossierAgent",
            description="Expert en montage et suivi de dossiers de financement"
        )
        self.active_dossiers: Dict[str, Dossier] = {}

    def process_message(self, message: AgentMessage) -> AgentMessage:
        """Traite les demandes liées aux dossiers."""
        if message.message_type == "create_dossier":
            return self._create_dossier(message)
        elif message.message_type == "update_dossier":
            return self._update_dossier(message)
        elif message.message_type == "check_completeness":
            return self._check_completeness(message)
        elif message.message_type == "generate_checklist":
            return self._generate_checklist(message)
        else:
            return self.send_message(
                message.sender,
                "Type de message non reconnu",
                "error"
            )

    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyse un dossier de financement.

        Args:
            data: Doit contenir 'dossier' ou les éléments pour créer un dossier

        Returns:
            Analyse complète du dossier
        """
        dossier = data.get('dossier')

        if not dossier:
            # Créer un nouveau dossier
            dossier = self.create_dossier(
                user_profile_id=data.get('user_profile_id'),
                formation_id=data.get('formation_id'),
                financing_schemes=data.get('financing_schemes', []),
                formation_cost=data.get('formation_cost', 0)
            )

        completeness = self.check_completeness(dossier)
        timeline = self.create_submission_timeline(dossier)
        alerts = self.generate_alerts(dossier)

        return {
            "dossier": dossier.dict(),
            "completeness": completeness,
            "timeline": timeline,
            "alerts": alerts,
            "recommendations": self._generate_dossier_recommendations(dossier)
        }

    def create_dossier(
        self,
        user_profile_id: str,
        formation_id: str,
        financing_schemes: List[FinancingScheme],
        formation_cost: float,
        training_start_date: Optional[datetime] = None
    ) -> Dossier:
        """
        Crée un nouveau dossier de financement.

        Args:
            user_profile_id: ID du profil utilisateur
            formation_id: ID de la formation
            financing_schemes: Liste des dispositifs de financement
            formation_cost: Coût de la formation
            training_start_date: Date de début de la formation

        Returns:
            Dossier créé
        """
        # Générer la liste des documents requis
        documents = self._generate_required_documents(financing_schemes)

        # Calculer la deadline de soumission
        submission_deadline = None
        if training_start_date:
            # Prendre la deadline la plus contraignante
            min_deadline_days = min(
                (s.deadline_before_training for s in financing_schemes
                 if s.deadline_before_training),
                default=30
            )
            submission_deadline = training_start_date - timedelta(days=min_deadline_days)

        dossier = Dossier(
            user_profile_id=user_profile_id,
            formation_id=formation_id,
            financing_applications=[s.id for s in financing_schemes if s.id],
            total_cost=formation_cost,
            documents=documents,
            training_start_date=training_start_date,
            submission_deadline=submission_deadline
        )

        # Calculer le taux de complétion
        dossier.completion_percentage = dossier.calculate_completion()

        self.active_dossiers[dossier.id or f"dossier_{len(self.active_dossiers)}"] = dossier

        return dossier

    def _generate_required_documents(
        self,
        financing_schemes: List[FinancingScheme]
    ) -> List[Document]:
        """Génère la liste des documents requis selon les dispositifs."""
        documents_dict = {}

        # Documents communs
        common_docs = [
            ("Pièce d'identité", "Carte d'identité ou passeport en cours de validité", True),
            ("Justificatif de domicile", "Moins de 3 mois", True),
            ("CV actualisé", "CV détaillé avec expériences et compétences", True),
            ("Lettre de motivation", "Explication du projet professionnel", True)
        ]

        for name, desc, required in common_docs:
            documents_dict[name] = Document(
                name=name,
                description=desc,
                required=required
            )

        # Documents spécifiques par dispositif
        for scheme in financing_schemes:
            for doc_name in scheme.required_documents:
                if doc_name not in documents_dict:
                    documents_dict[doc_name] = Document(
                        name=doc_name,
                        description=f"Requis pour {scheme.name}",
                        required=True
                    )

        return list(documents_dict.values())

    def check_completeness(self, dossier: Dossier) -> Dict[str, Any]:
        """
        Vérifie la complétude d'un dossier.

        Args:
            dossier: Dossier à vérifier

        Returns:
            Rapport de complétude
        """
        total_docs = len(dossier.documents)
        required_docs = len([d for d in dossier.documents if d.required])

        completed_docs = len([
            d for d in dossier.documents
            if d.status in [DocumentStatus.READY, DocumentStatus.SUBMITTED, DocumentStatus.VALIDATED]
        ])

        missing_required = dossier.get_missing_documents()

        is_ready = len(missing_required) == 0

        return {
            "total_documents": total_docs,
            "required_documents": required_docs,
            "completed_documents": completed_docs,
            "completion_rate": (completed_docs / total_docs * 100) if total_docs > 0 else 0,
            "missing_required": [d.dict() for d in missing_required],
            "is_ready_to_submit": is_ready,
            "status": DossierStatus.READY_TO_SUBMIT if is_ready else DossierStatus.IN_PROGRESS
        }

    def create_submission_timeline(self, dossier: Dossier) -> Dict[str, Any]:
        """
        Crée un calendrier de soumission du dossier.

        Args:
            dossier: Dossier à planifier

        Returns:
            Timeline avec étapes et dates
        """
        timeline = []
        current_date = datetime.now()

        # Étape 1: Rassemblement des documents
        doc_collection_duration = 14  # 2 semaines
        doc_deadline = current_date + timedelta(days=doc_collection_duration)

        timeline.append({
            "step": "Rassemblement des documents",
            "deadline": doc_deadline.isoformat(),
            "duration_days": doc_collection_duration,
            "status": "in_progress",
            "tasks": [d.name for d in dossier.get_missing_documents()]
        })

        # Étape 2: Vérification et validation
        verification_duration = 3  # 3 jours
        verification_deadline = doc_deadline + timedelta(days=verification_duration)

        timeline.append({
            "step": "Vérification et validation",
            "deadline": verification_deadline.isoformat(),
            "duration_days": verification_duration,
            "status": "pending",
            "tasks": ["Relire tous les documents", "Vérifier la cohérence", "Faire valider par un tiers"]
        })

        # Étape 3: Soumission
        submission_duration = 2  # 2 jours
        submission_deadline = verification_deadline + timedelta(days=submission_duration)

        timeline.append({
            "step": "Soumission des dossiers",
            "deadline": submission_deadline.isoformat(),
            "duration_days": submission_duration,
            "status": "pending",
            "tasks": ["Soumettre via les plateformes", "Obtenir les accusés de réception"]
        })

        # Vérifier si on respecte la deadline finale
        if dossier.submission_deadline:
            days_remaining = (dossier.submission_deadline - current_date).days
            total_required_days = doc_collection_duration + verification_duration + submission_duration

            timeline_status = "on_track" if days_remaining >= total_required_days else "at_risk"
        else:
            timeline_status = "no_deadline"

        return {
            "timeline": timeline,
            "total_duration_days": doc_collection_duration + verification_duration + submission_duration,
            "status": timeline_status,
            "final_submission_date": submission_deadline.isoformat() if not dossier.submission_deadline else dossier.submission_deadline.isoformat()
        }

    def generate_alerts(self, dossier: Dossier) -> List[Dict[str, Any]]:
        """
        Génère des alertes pour le suivi du dossier.

        Args:
            dossier: Dossier à surveiller

        Returns:
            Liste d'alertes
        """
        alerts = []
        current_date = datetime.now()

        # Alerte deadline proche
        if dossier.submission_deadline:
            days_until_deadline = (dossier.submission_deadline - current_date).days

            if days_until_deadline < 7:
                alerts.append({
                    "type": "urgent",
                    "title": "Deadline imminente",
                    "message": f"Soumission requise dans {days_until_deadline} jours",
                    "action_required": "Accélérer la collecte des documents manquants"
                })
            elif days_until_deadline < 14:
                alerts.append({
                    "type": "warning",
                    "title": "Deadline approche",
                    "message": f"Soumission dans {days_until_deadline} jours",
                    "action_required": "Vérifier l'avancement"
                })

        # Alerte documents manquants
        missing_docs = dossier.get_missing_documents()
        if missing_docs:
            alerts.append({
                "type": "info",
                "title": "Documents manquants",
                "message": f"{len(missing_docs)} document(s) requis manquant(s)",
                "action_required": "Compléter le dossier",
                "details": [d.name for d in missing_docs]
            })

        # Alerte financement incomplet
        financing_gap = dossier.calculate_financing_gap()
        if financing_gap > 0:
            alerts.append({
                "type": "warning",
                "title": "Financement incomplet",
                "message": f"Reste à financer: {financing_gap:.2f}€",
                "action_required": "Explorer des financements complémentaires"
            })

        # Alerte aucune activité récente
        days_since_update = (current_date - dossier.updated_at).days
        if days_since_update > 7:
            alerts.append({
                "type": "info",
                "title": "Dossier inactif",
                "message": f"Aucune mise à jour depuis {days_since_update} jours",
                "action_required": "Reprendre le travail sur le dossier"
            })

        return alerts

    def update_document_status(
        self,
        dossier: Dossier,
        document_name: str,
        new_status: DocumentStatus,
        file_path: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Dossier:
        """
        Met à jour le statut d'un document.

        Args:
            dossier: Dossier concerné
            document_name: Nom du document
            new_status: Nouveau statut
            file_path: Chemin du fichier (optionnel)
            notes: Notes additionnelles

        Returns:
            Dossier mis à jour
        """
        for doc in dossier.documents:
            if doc.name == document_name:
                doc.status = new_status
                if file_path:
                    doc.file_path = file_path
                if notes:
                    doc.notes = notes
                break

        # Mettre à jour le taux de complétion
        dossier.completion_percentage = dossier.calculate_completion()
        dossier.updated_at = datetime.now()

        # Mettre à jour le statut global si tous les docs sont prêts
        if dossier.completion_percentage == 100:
            dossier.status = DossierStatus.READY_TO_SUBMIT

        return dossier

    def _create_dossier(self, message: AgentMessage) -> AgentMessage:
        """Crée un nouveau dossier."""
        dossier = self.create_dossier(
            user_profile_id=message.data.get('user_profile_id'),
            formation_id=message.data.get('formation_id'),
            financing_schemes=message.data.get('financing_schemes', []),
            formation_cost=message.data.get('formation_cost', 0),
            training_start_date=message.data.get('training_start_date')
        )

        return self.send_message(
            message.sender,
            "Dossier créé avec succès",
            "response",
            {"dossier": dossier.dict()}
        )

    def _update_dossier(self, message: AgentMessage) -> AgentMessage:
        """Met à jour un dossier."""
        dossier_id = message.data.get('dossier_id')
        document_name = message.data.get('document_name')
        new_status = message.data.get('new_status')

        if dossier_id not in self.active_dossiers:
            return self.send_message(
                message.sender,
                "Dossier non trouvé",
                "error"
            )

        dossier = self.active_dossiers[dossier_id]
        updated_dossier = self.update_document_status(
            dossier, document_name, new_status
        )

        return self.send_message(
            message.sender,
            "Dossier mis à jour",
            "response",
            {"dossier": updated_dossier.dict()}
        )

    def _check_completeness(self, message: AgentMessage) -> AgentMessage:
        """Vérifie la complétude d'un dossier."""
        dossier = message.data.get('dossier')

        completeness = self.check_completeness(dossier)

        return self.send_message(
            message.sender,
            f"Dossier complété à {completeness['completion_rate']:.1f}%",
            "response",
            completeness
        )

    def _generate_checklist(self, message: AgentMessage) -> AgentMessage:
        """Génère une checklist pour le dossier."""
        dossier = message.data.get('dossier')

        checklist = {
            "documents": [
                {
                    "name": doc.name,
                    "status": doc.status,
                    "required": doc.required,
                    "completed": doc.status in [DocumentStatus.READY, DocumentStatus.SUBMITTED, DocumentStatus.VALIDATED]
                }
                for doc in dossier.documents
            ],
            "next_actions": self._get_next_actions(dossier)
        }

        return self.send_message(
            message.sender,
            "Checklist générée",
            "response",
            checklist
        )

    def _get_next_actions(self, dossier: Dossier) -> List[str]:
        """Détermine les prochaines actions à effectuer."""
        actions = []

        missing = dossier.get_missing_documents()
        if missing:
            actions.append(f"Rassembler {len(missing)} document(s) manquant(s)")

        in_progress = [d for d in dossier.documents if d.status == DocumentStatus.IN_PROGRESS]
        if in_progress:
            actions.append(f"Finaliser {len(in_progress)} document(s) en cours")

        if not missing and not in_progress:
            actions.append("Vérifier l'ensemble du dossier avant soumission")

        if dossier.completion_percentage == 100:
            actions.append("Soumettre le dossier")

        return actions

    def _generate_dossier_recommendations(self, dossier: Dossier) -> List[str]:
        """Génère des recommandations pour le dossier."""
        recommendations = []

        # Recommandations selon la complétude
        if dossier.completion_percentage < 50:
            recommendations.append(
                "Commencez par les documents les plus simples à obtenir (pièce d'identité, justificatifs)"
            )

        # Recommandations timing
        if dossier.submission_deadline:
            days_remaining = (dossier.submission_deadline - datetime.now()).days
            if days_remaining < 14:
                recommendations.append(
                    "Deadline proche ! Priorisez les documents obligatoires"
                )

        # Recommandations organisation
        recommendations.append(
            "Numérisez tous vos documents au format PDF pour faciliter les dépôts en ligne"
        )

        recommendations.append(
            "Conservez une copie de tous les documents soumis et des accusés de réception"
        )

        return recommendations

    def get_capabilities(self) -> List[str]:
        """Retourne les capacités de l'agent."""
        return [
            "Créer et structurer des dossiers de financement",
            "Générer la liste des documents requis",
            "Suivre l'avancement des dossiers",
            "Vérifier la complétude documentaire",
            "Créer des timelines de soumission",
            "Générer des alertes et rappels",
            "Optimiser le calendrier de montage"
        ]
