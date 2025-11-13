"""Agent spécialisé dans la recherche et l'analyse de formations."""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent, AgentMessage
from ..models import UserProfile, Formation


class FormationAgent(BaseAgent):
    """
    Agent expert en formations professionnelles.

    Compétences:
    - Recherche de formations adaptées
    - Analyse d'adéquation formation/projet professionnel
    - Recommandation de parcours de formation
    - Évaluation des débouchés
    """

    def __init__(self):
        super().__init__(
            name="FormationAgent",
            description="Expert en formations professionnelles et parcours de développement des compétences"
        )
        self.formations_catalog: List[Formation] = []

    def process_message(self, message: AgentMessage) -> AgentMessage:
        """Traite les demandes liées aux formations."""
        if message.message_type == "search_formations":
            return self._search_formations(message)
        elif message.message_type == "analyze_match":
            return self._analyze_match(message)
        elif message.message_type == "recommend_path":
            return self._recommend_path(message)
        else:
            return self.send_message(
                message.sender,
                "Type de message non reconnu",
                "error"
            )

    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyse le profil pour recommander des formations.

        Args:
            data: Doit contenir 'user_profile'

        Returns:
            Analyse avec formations recommandées
        """
        user_profile = data.get('user_profile')

        if not user_profile:
            return {"error": "Profil utilisateur requis"}

        matching_formations = self.find_matching_formations(user_profile)
        learning_path = self.create_learning_path(user_profile, matching_formations)

        return {
            "matching_formations": [f.dict() for f in matching_formations],
            "learning_path": learning_path,
            "skill_gaps": self._identify_skill_gaps(user_profile),
            "recommendations": self._generate_formation_recommendations(
                user_profile, matching_formations
            )
        }

    def find_matching_formations(
        self,
        user_profile: UserProfile,
        max_results: int = 10
    ) -> List[Formation]:
        """
        Trouve les formations les plus adaptées au profil.

        Args:
            user_profile: Profil de l'utilisateur
            max_results: Nombre maximum de résultats

        Returns:
            Liste des formations correspondantes
        """
        matching = []

        for formation in self.formations_catalog:
            score = self._calculate_match_score(user_profile, formation)
            if score > 0.3:  # Seuil de pertinence
                matching.append((formation, score))

        # Trier par score décroissant
        matching.sort(key=lambda x: x[1], reverse=True)

        return [f[0] for f in matching[:max_results]]

    def _calculate_match_score(
        self,
        user_profile: UserProfile,
        formation: Formation
    ) -> float:
        """
        Calcule un score de correspondance entre profil et formation.

        Args:
            user_profile: Profil utilisateur
            formation: Formation à évaluer

        Returns:
            Score entre 0 et 1
        """
        score = 0.0
        weights = {
            'target_job': 0.3,
            'skills': 0.25,
            'prerequisites': 0.2,
            'delivery_mode': 0.15,
            'price': 0.1
        }

        # Correspondance avec le métier visé
        if user_profile.target_job:
            target_lower = user_profile.target_job.lower()
            if any(target_lower in job.lower() for job in formation.job_opportunities):
                score += weights['target_job']
            elif target_lower in formation.title.lower():
                score += weights['target_job'] * 0.7

        # Correspondance des compétences
        user_skills_lower = [s.lower() for s in user_profile.skills]
        formation_skills_lower = [s.lower() for s in formation.skills_acquired]

        if formation_skills_lower:
            skills_overlap = len(
                set(user_skills_lower) & set(formation_skills_lower)
            )
            skills_ratio = skills_overlap / len(formation_skills_lower)
            score += weights['skills'] * skills_ratio

        # Vérification des prérequis
        if formation.prerequisites:
            prereq_met = sum(
                1 for prereq in formation.prerequisites
                if any(prereq.lower() in skill.lower() for skill in user_profile.skills)
            )
            prereq_ratio = prereq_met / len(formation.prerequisites)
            score += weights['prerequisites'] * prereq_ratio
        else:
            score += weights['prerequisites']  # Pas de prérequis = bonus

        # Préférence de modalité
        if user_profile.geographic_mobility is False:
            if formation.delivery_mode.value in ["distanciel", "hybride"]:
                score += weights['delivery_mode']
        else:
            score += weights['delivery_mode'] * 0.5

        # Adéquation prix/budget
        if user_profile.cpf_balance:
            if formation.price <= user_profile.cpf_balance:
                score += weights['price']
            elif formation.price <= user_profile.cpf_balance * 1.5:
                score += weights['price'] * 0.5

        return min(score, 1.0)

    def create_learning_path(
        self,
        user_profile: UserProfile,
        formations: List[Formation]
    ) -> Dict[str, Any]:
        """
        Crée un parcours d'apprentissage progressif.

        Args:
            user_profile: Profil utilisateur
            formations: Formations disponibles

        Returns:
            Parcours d'apprentissage structuré
        """
        # Identifier les compétences manquantes
        skill_gaps = self._identify_skill_gaps(user_profile)

        # Organiser les formations par niveau
        foundational = []
        intermediate = []
        advanced = []

        for formation in formations:
            if not formation.prerequisites or len(formation.prerequisites) == 0:
                foundational.append(formation)
            elif len(formation.prerequisites) <= 2:
                intermediate.append(formation)
            else:
                advanced.append(formation)

        return {
            "skill_gaps": skill_gaps,
            "recommended_path": [
                {
                    "level": "Fondamental",
                    "formations": [f.dict() for f in foundational[:3]],
                    "description": "Formations de base pour acquérir les compétences essentielles"
                },
                {
                    "level": "Intermédiaire",
                    "formations": [f.dict() for f in intermediate[:3]],
                    "description": "Formations pour approfondir et se spécialiser"
                },
                {
                    "level": "Avancé",
                    "formations": [f.dict() for f in advanced[:2]],
                    "description": "Formations expertes et certifications professionnelles"
                }
            ],
            "estimated_duration": self._estimate_total_duration(
                foundational[:3] + intermediate[:3] + advanced[:2]
            ),
            "estimated_cost": self._estimate_total_cost(
                foundational[:3] + intermediate[:3] + advanced[:2]
            )
        }

    def _identify_skill_gaps(self, user_profile: UserProfile) -> List[str]:
        """Identifie les compétences manquantes par rapport au métier visé."""
        # Dans une vraie implémentation, cela serait basé sur une base de données
        # de compétences par métier
        skill_gaps = []

        if user_profile.target_job:
            # Exemple simplifié
            common_skills = ["communication", "travail en équipe", "organisation"]
            for skill in common_skills:
                if not any(skill in s.lower() for s in user_profile.skills):
                    skill_gaps.append(skill)

        return skill_gaps

    def _estimate_total_duration(self, formations: List[Formation]) -> str:
        """Estime la durée totale d'un parcours."""
        total_hours = sum(f.duration_hours for f in formations)
        months = total_hours // 140  # Environ 35h/semaine sur 4 semaines
        return f"{months} mois (environ {total_hours} heures)"

    def _estimate_total_cost(self, formations: List[Formation]) -> float:
        """Estime le coût total d'un parcours."""
        return sum(f.price for f in formations)

    def _search_formations(self, message: AgentMessage) -> AgentMessage:
        """Recherche des formations selon des critères."""
        criteria = message.data.get('criteria', {})
        user_profile = message.data.get('user_profile')

        if user_profile:
            results = self.find_matching_formations(user_profile)
        else:
            # Recherche basique par mots-clés
            keyword = criteria.get('keyword', '')
            results = [
                f for f in self.formations_catalog
                if keyword.lower() in f.title.lower()
            ]

        return self.send_message(
            message.sender,
            f"Trouvé {len(results)} formations correspondantes",
            "response",
            {"formations": [f.dict() for f in results]}
        )

    def _analyze_match(self, message: AgentMessage) -> AgentMessage:
        """Analyse l'adéquation profil/formation."""
        user_profile = message.data.get('user_profile')
        formation = message.data.get('formation')

        if not user_profile or not formation:
            return self.send_message(
                message.sender,
                "Profil et formation requis",
                "error"
            )

        score = self._calculate_match_score(user_profile, formation)

        return self.send_message(
            message.sender,
            f"Score de correspondance: {score:.2%}",
            "response",
            {"match_score": score, "analysis": self._detailed_match_analysis(user_profile, formation)}
        )

    def _recommend_path(self, message: AgentMessage) -> AgentMessage:
        """Recommande un parcours de formation."""
        user_profile = message.data.get('user_profile')

        matching_formations = self.find_matching_formations(user_profile)
        path = self.create_learning_path(user_profile, matching_formations)

        return self.send_message(
            message.sender,
            "Parcours de formation créé",
            "response",
            {"learning_path": path}
        )

    def _detailed_match_analysis(
        self,
        user_profile: UserProfile,
        formation: Formation
    ) -> Dict[str, Any]:
        """Fournit une analyse détaillée de correspondance."""
        return {
            "strengths": [
                "Vos compétences actuelles correspondent aux prérequis",
                "La formation débouche sur votre métier visé"
            ],
            "gaps": [
                "Certaines compétences techniques devront être acquises",
                "Durée de la formation à prendre en compte"
            ],
            "recommendations": [
                "Cette formation est bien adaptée à votre projet",
                "Envisagez de commencer dans les 3 prochains mois"
            ]
        }

    def _generate_formation_recommendations(
        self,
        user_profile: UserProfile,
        formations: List[Formation]
    ) -> List[str]:
        """Génère des recommandations sur les formations."""
        recommendations = []

        if not formations:
            recommendations.append(
                "Aucune formation ne correspond parfaitement. "
                "Élargissez vos critères de recherche."
            )
            return recommendations

        # Recommandations selon le profil
        if user_profile.geographic_mobility is False:
            remote_count = sum(
                1 for f in formations
                if f.delivery_mode.value in ["distanciel", "hybride"]
            )
            if remote_count > 0:
                recommendations.append(
                    f"{remote_count} formations disponibles en distanciel, "
                    "idéal pour votre contrainte géographique."
                )

        # Recommandations CPF
        cpf_eligible_count = sum(1 for f in formations if f.cpf_eligible)
        if cpf_eligible_count > 0 and user_profile.cpf_balance:
            recommendations.append(
                f"{cpf_eligible_count} formations éligibles au CPF. "
                f"Votre solde actuel: {user_profile.cpf_balance}€"
            )

        return recommendations

    def get_capabilities(self) -> List[str]:
        """Retourne les capacités de l'agent."""
        return [
            "Rechercher des formations adaptées au profil",
            "Calculer la correspondance profil/formation",
            "Créer des parcours d'apprentissage progressifs",
            "Identifier les compétences manquantes",
            "Recommander des formations selon le projet professionnel",
            "Analyser les débouchés professionnels"
        ]
