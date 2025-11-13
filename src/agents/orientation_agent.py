"""Agent spécialisé dans l'orientation professionnelle."""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent, AgentMessage
from ..models import UserProfile


class OrientationAgent(BaseAgent):
    """
    Agent expert en orientation et conseil professionnel.

    Compétences:
    - Analyse du projet professionnel
    - Identification des secteurs porteurs
    - Conseil en reconversion
    - Évaluation des compétences transférables
    """

    def __init__(self):
        super().__init__(
            name="OrientationAgent",
            description="Expert en orientation et conseil professionnel"
        )
        # Base de connaissances sur les métiers et secteurs
        self.job_market_data: Dict[str, Any] = {}
        self.skills_taxonomy: Dict[str, List[str]] = {}

    def process_message(self, message: AgentMessage) -> AgentMessage:
        """Traite les demandes d'orientation."""
        if message.message_type == "analyze_profile":
            return self._analyze_profile(message)
        elif message.message_type == "suggest_careers":
            return self._suggest_careers(message)
        elif message.message_type == "assess_transferable_skills":
            return self._assess_transferable_skills(message)
        else:
            return self.send_message(
                message.sender,
                "Type de message non reconnu",
                "error"
            )

    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyse le profil pour conseils en orientation.

        Args:
            data: Doit contenir 'user_profile'

        Returns:
            Analyse d'orientation complète
        """
        user_profile = data.get('user_profile')

        if not user_profile:
            return {"error": "Profil utilisateur requis"}

        career_suggestions = self.suggest_career_paths(user_profile)
        transferable_skills = self.identify_transferable_skills(user_profile)
        development_plan = self.create_career_development_plan(user_profile)

        return {
            "career_suggestions": career_suggestions,
            "transferable_skills": transferable_skills,
            "development_plan": development_plan,
            "market_insights": self._get_market_insights(user_profile),
            "recommendations": self._generate_orientation_recommendations(user_profile)
        }

    def suggest_career_paths(self, user_profile: UserProfile) -> List[Dict[str, Any]]:
        """
        Suggère des pistes de carrière adaptées.

        Args:
            user_profile: Profil utilisateur

        Returns:
            Liste de suggestions de carrière
        """
        suggestions = []

        # Analyser les compétences actuelles
        user_skills_lower = [s.lower() for s in user_profile.skills]

        # Métiers correspondants (base de données simplifiée)
        career_database = self._get_career_database()

        for career in career_database:
            match_score = self._calculate_career_match(user_profile, career)

            if match_score > 0.4:
                suggestions.append({
                    "job_title": career["title"],
                    "sector": career["sector"],
                    "match_score": match_score,
                    "required_skills": career["required_skills"],
                    "skills_gap": self._calculate_skills_gap(
                        user_profile.skills,
                        career["required_skills"]
                    ),
                    "average_salary": career.get("average_salary"),
                    "job_outlook": career.get("job_outlook", "stable"),
                    "training_required": career.get("training_required", [])
                })

        # Trier par score de correspondance
        suggestions.sort(key=lambda x: x["match_score"], reverse=True)

        return suggestions[:10]

    def identify_transferable_skills(self, user_profile: UserProfile) -> Dict[str, Any]:
        """
        Identifie les compétences transférables vers d'autres métiers.

        Args:
            user_profile: Profil utilisateur

        Returns:
            Analyse des compétences transférables
        """
        transferable = {
            "soft_skills": [],
            "hard_skills": [],
            "applicable_sectors": []
        }

        # Identifier les soft skills
        soft_skills_keywords = [
            "communication", "leadership", "organisation", "gestion",
            "travail en équipe", "adaptation", "résolution de problèmes",
            "créativité", "autonomie", "rigueur"
        ]

        for skill in user_profile.skills:
            skill_lower = skill.lower()
            if any(keyword in skill_lower for keyword in soft_skills_keywords):
                transferable["soft_skills"].append(skill)
            else:
                transferable["hard_skills"].append(skill)

        # Identifier les secteurs applicables
        transferable["applicable_sectors"] = self._find_applicable_sectors(
            user_profile.skills
        )

        # Score de transférabilité
        transferable["transferability_score"] = self._calculate_transferability_score(
            user_profile
        )

        return transferable

    def create_career_development_plan(
        self,
        user_profile: UserProfile
    ) -> Dict[str, Any]:
        """
        Crée un plan de développement de carrière.

        Args:
            user_profile: Profil utilisateur

        Returns:
            Plan de développement structuré
        """
        plan = {
            "short_term": [],  # 0-6 mois
            "medium_term": [],  # 6-18 mois
            "long_term": []  # 18+ mois
        }

        # Objectifs court terme
        if not user_profile.certifications:
            plan["short_term"].append({
                "action": "Obtenir une première certification professionnelle",
                "priority": "high",
                "estimated_duration": "3-6 mois"
            })

        if user_profile.employment_status.value == "demandeur_emploi":
            plan["short_term"].append({
                "action": "Suivre une formation courte pour mise à niveau des compétences",
                "priority": "high",
                "estimated_duration": "1-3 mois"
            })

        # Objectifs moyen terme
        if user_profile.target_job:
            plan["medium_term"].append({
                "action": f"Formation qualifiante vers {user_profile.target_job}",
                "priority": "high",
                "estimated_duration": "6-12 mois"
            })

        plan["medium_term"].append({
            "action": "Développer un réseau professionnel dans le secteur visé",
            "priority": "medium",
            "estimated_duration": "6-18 mois"
        })

        # Objectifs long terme
        plan["long_term"].append({
            "action": "Obtenir une position stable dans le métier visé",
            "priority": "high",
            "estimated_duration": "18-24 mois"
        })

        if user_profile.work_experience_years >= 5:
            plan["long_term"].append({
                "action": "Envisager une évolution vers un poste à responsabilités",
                "priority": "medium",
                "estimated_duration": "24+ mois"
            })

        return plan

    def _calculate_career_match(
        self,
        user_profile: UserProfile,
        career: Dict[str, Any]
    ) -> float:
        """Calcule le score de correspondance avec une carrière."""
        score = 0.0

        # Correspondance des compétences
        user_skills = set(s.lower() for s in user_profile.skills)
        required_skills = set(s.lower() for s in career["required_skills"])

        if required_skills:
            skills_match = len(user_skills & required_skills) / len(required_skills)
            score += skills_match * 0.6

        # Expérience
        if user_profile.work_experience_years >= career.get("min_experience", 0):
            score += 0.2

        # Secteur d'intérêt
        if user_profile.target_sector and user_profile.target_sector.lower() == career["sector"].lower():
            score += 0.2

        return min(score, 1.0)

    def _calculate_skills_gap(
        self,
        current_skills: List[str],
        required_skills: List[str]
    ) -> List[str]:
        """Calcule les compétences manquantes."""
        current_lower = set(s.lower() for s in current_skills)
        required_lower = set(s.lower() for s in required_skills)

        gap = required_lower - current_lower
        return list(gap)

    def _get_career_database(self) -> List[Dict[str, Any]]:
        """Retourne une base de données simplifiée de carrières."""
        return [
            {
                "title": "Chef de projet digital",
                "sector": "Digital/Tech",
                "required_skills": ["gestion de projet", "communication", "agilité", "product management"],
                "min_experience": 3,
                "average_salary": 45000,
                "job_outlook": "excellent",
                "training_required": ["Certification Scrum", "Formation Product Owner"]
            },
            {
                "title": "Développeur Web",
                "sector": "Informatique",
                "required_skills": ["programmation", "javascript", "html", "css", "react"],
                "min_experience": 0,
                "average_salary": 38000,
                "job_outlook": "excellent",
                "training_required": ["Formation développement web", "Certification développeur"]
            },
            {
                "title": "Data Analyst",
                "sector": "Data/Analytics",
                "required_skills": ["analyse de données", "excel", "sql", "python", "visualisation"],
                "min_experience": 1,
                "average_salary": 42000,
                "job_outlook": "excellent",
                "training_required": ["Formation data analyst", "Certification data"]
            },
            {
                "title": "Chargé de communication digitale",
                "sector": "Communication",
                "required_skills": ["communication", "marketing digital", "réseaux sociaux", "content marketing"],
                "min_experience": 2,
                "average_salary": 35000,
                "job_outlook": "bon",
                "training_required": ["Formation marketing digital", "Certification CM"]
            },
            {
                "title": "Consultant RH",
                "sector": "Ressources Humaines",
                "required_skills": ["ressources humaines", "recrutement", "gestion", "communication"],
                "min_experience": 3,
                "average_salary": 40000,
                "job_outlook": "stable",
                "training_required": ["Formation RH", "Certification professionnelle RH"]
            }
        ]

    def _find_applicable_sectors(self, skills: List[str]) -> List[str]:
        """Trouve les secteurs applicables selon les compétences."""
        sectors = set()

        skills_lower = [s.lower() for s in skills]

        # Mapping compétences -> secteurs
        sector_mapping = {
            "Digital/Tech": ["programmation", "web", "digital", "informatique", "tech"],
            "Communication": ["communication", "marketing", "réseaux sociaux", "content"],
            "Gestion/Administration": ["gestion", "administration", "organisation", "bureautique"],
            "Commerce": ["vente", "commerce", "relation client", "négociation"],
            "Ressources Humaines": ["rh", "recrutement", "formation", "ressources humaines"]
        }

        for sector, keywords in sector_mapping.items():
            if any(keyword in skill for skill in skills_lower for keyword in keywords):
                sectors.add(sector)

        return list(sectors)

    def _calculate_transferability_score(self, user_profile: UserProfile) -> float:
        """Calcule un score de transférabilité des compétences."""
        score = 0.0

        # Plus de compétences = meilleure transférabilité
        if len(user_profile.skills) >= 10:
            score += 0.4
        elif len(user_profile.skills) >= 5:
            score += 0.2

        # Expérience diversifiée
        if user_profile.work_experience_years >= 5:
            score += 0.3

        # Certifications
        if user_profile.certifications:
            score += 0.3

        return min(score, 1.0)

    def _get_market_insights(self, user_profile: UserProfile) -> Dict[str, Any]:
        """Fournit des insights sur le marché de l'emploi."""
        return {
            "trending_sectors": [
                "Digital et Tech",
                "Santé et Services à la personne",
                "Transition écologique",
                "E-commerce et Logistique"
            ],
            "in_demand_skills": [
                "Compétences numériques",
                "Gestion de projet agile",
                "Analyse de données",
                "Communication digitale"
            ],
            "employment_outlook": {
                "current_sector": "stable" if user_profile.current_job else "N/A",
                "target_sector": "favorable" if user_profile.target_sector else "N/A"
            }
        }

    def _analyze_profile(self, message: AgentMessage) -> AgentMessage:
        """Analyse complète du profil."""
        user_profile = message.data.get('user_profile')

        if not user_profile:
            return self.send_message(
                message.sender,
                "Profil utilisateur requis",
                "error"
            )

        analysis = self.analyze({"user_profile": user_profile})

        return self.send_message(
            message.sender,
            "Analyse d'orientation complétée",
            "response",
            analysis
        )

    def _suggest_careers(self, message: AgentMessage) -> AgentMessage:
        """Suggère des pistes de carrière."""
        user_profile = message.data.get('user_profile')

        suggestions = self.suggest_career_paths(user_profile)

        return self.send_message(
            message.sender,
            f"Trouvé {len(suggestions)} pistes de carrière",
            "response",
            {"career_suggestions": suggestions}
        )

    def _assess_transferable_skills(self, message: AgentMessage) -> AgentMessage:
        """Évalue les compétences transférables."""
        user_profile = message.data.get('user_profile')

        transferable = self.identify_transferable_skills(user_profile)

        return self.send_message(
            message.sender,
            "Analyse des compétences transférables complétée",
            "response",
            transferable
        )

    def _generate_orientation_recommendations(
        self,
        user_profile: UserProfile
    ) -> List[str]:
        """Génère des recommandations d'orientation."""
        recommendations = []

        # Recommandations selon le statut
        if user_profile.employment_status.value == "demandeur_emploi":
            recommendations.append(
                "Profitez de votre période de recherche pour vous former aux compétences les plus demandées"
            )

        # Recommandations sur le projet
        if not user_profile.target_job:
            recommendations.append(
                "Définissez un objectif professionnel clair pour orienter votre parcours de formation"
            )

        # Recommandations sur les compétences
        if len(user_profile.skills) < 5:
            recommendations.append(
                "Identifiez et listez toutes vos compétences, même celles qui vous semblent basiques"
            )

        # Recommandations sectorielles
        if not user_profile.target_sector:
            recommendations.append(
                "Explorez différents secteurs d'activité pour identifier ceux qui vous attirent"
            )

        return recommendations

    def get_capabilities(self) -> List[str]:
        """Retourne les capacités de l'agent."""
        return [
            "Analyser le projet professionnel",
            "Suggérer des pistes de carrière adaptées",
            "Identifier les compétences transférables",
            "Créer un plan de développement de carrière",
            "Fournir des insights sur le marché de l'emploi",
            "Calculer les écarts de compétences"
        ]
