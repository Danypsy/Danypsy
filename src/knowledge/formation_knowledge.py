"""Base de connaissances sur les formations professionnelles."""

from typing import List
from ..models import Formation, FormationType, DeliveryMode
from datetime import datetime, timedelta


class FormationKnowledgeBase:
    """Base de connaissances des formations professionnelles."""

    def __init__(self):
        self.formations = self._load_sample_formations()

    def _load_sample_formations(self) -> List[Formation]:
        """Charge des formations d'exemple."""
        return [
            Formation(
                id="form_001",
                title="Formation Product Owner - Chef de projet digital",
                provider="OpenClassrooms",
                description="Apprenez à piloter le développement d'un produit digital de bout en bout",
                formation_type=FormationType.CERTIFYING,
                delivery_mode=DeliveryMode.REMOTE,
                duration_hours=450,
                duration_description="6 mois à temps partiel",
                objectives=[
                    "Définir une vision produit",
                    "Rédiger et prioriser un backlog",
                    "Animer des rituels agiles",
                    "Mesurer la performance d'un produit"
                ],
                prerequisites=["Expérience en gestion de projet recommandée"],
                skills_acquired=[
                    "Product Management",
                    "Méthodologie Agile",
                    "Scrum",
                    "Analyse de données",
                    "UX/UI"
                ],
                certification_name="Chef de projet digital",
                rncp_code="RNCP35635",
                price=4500.0,
                price_per_hour=10.0,
                cpf_eligible=True,
                pole_emploi_eligible=True,
                opco_eligible=True,
                region_eligible=False,
                job_opportunities=[
                    "Product Owner",
                    "Chef de projet digital",
                    "Product Manager"
                ],
                employment_rate=85.0,
                website="https://openclassrooms.com"
            ),
            Formation(
                id="form_002",
                title="Développeur Web Full-Stack",
                provider="Le Wagon",
                description="Formation intensive pour devenir développeur web full-stack",
                formation_type=FormationType.CERTIFYING,
                delivery_mode=DeliveryMode.HYBRID,
                duration_hours=360,
                duration_description="9 semaines intensives",
                objectives=[
                    "Maîtriser HTML, CSS, JavaScript",
                    "Développer avec React et Node.js",
                    "Créer des applications web complètes",
                    "Travailler en équipe avec Git"
                ],
                prerequisites=["Aucun prérequis technique"],
                skills_acquired=[
                    "HTML/CSS",
                    "JavaScript",
                    "React",
                    "Node.js",
                    "PostgreSQL",
                    "Git"
                ],
                certification_name="Développeur Web et Web Mobile",
                rncp_code="RNCP31114",
                locations=["Paris", "Lyon", "Bordeaux", "Lille"],
                price=6500.0,
                price_per_hour=18.0,
                cpf_eligible=True,
                pole_emploi_eligible=True,
                opco_eligible=True,
                region_eligible=True,
                job_opportunities=[
                    "Développeur Full-Stack",
                    "Développeur Front-End",
                    "Développeur Back-End"
                ],
                employment_rate=90.0,
                website="https://www.lewagon.com"
            ),
            Formation(
                id="form_003",
                title="Data Analyst",
                provider="DataScientest",
                description="Devenez Data Analyst et maîtrisez l'analyse de données",
                formation_type=FormationType.CERTIFYING,
                delivery_mode=DeliveryMode.REMOTE,
                duration_hours=400,
                duration_description="5 mois à temps partiel",
                objectives=[
                    "Collecter et nettoyer des données",
                    "Analyser des données avec Python",
                    "Créer des visualisations percutantes",
                    "Communiquer des insights métier"
                ],
                prerequisites=["Niveau bac, culture scientifique"],
                skills_acquired=[
                    "Python",
                    "SQL",
                    "Pandas",
                    "Matplotlib",
                    "Power BI",
                    "Statistiques"
                ],
                certification_name="Data Analyst",
                rncp_code="RNCP36129",
                price=3900.0,
                price_per_hour=9.75,
                cpf_eligible=True,
                pole_emploi_eligible=True,
                opco_eligible=True,
                region_eligible=False,
                job_opportunities=[
                    "Data Analyst",
                    "Business Analyst",
                    "Analyste décisionnel"
                ],
                employment_rate=88.0,
                website="https://datascientest.com"
            ),
            Formation(
                id="form_004",
                title="Community Manager et Social Media",
                provider="IFOCOP",
                description="Formation complète au métier de Community Manager",
                formation_type=FormationType.QUALIFYING,
                delivery_mode=DeliveryMode.IN_PERSON,
                duration_hours=560,
                duration_description="4 mois + 2 mois de stage",
                objectives=[
                    "Élaborer une stratégie social media",
                    "Créer du contenu engageant",
                    "Animer une communauté",
                    "Mesurer les performances"
                ],
                prerequisites=["Bon niveau de français"],
                skills_acquired=[
                    "Stratégie digitale",
                    "Content marketing",
                    "Réseaux sociaux",
                    "Création de contenu",
                    "Analytics"
                ],
                certification_name="Community Manager",
                locations=["Paris", "Lyon"],
                price=5200.0,
                price_per_hour=9.28,
                cpf_eligible=True,
                pole_emploi_eligible=True,
                opco_eligible=True,
                region_eligible=True,
                job_opportunities=[
                    "Community Manager",
                    "Social Media Manager",
                    "Chargé de communication digitale"
                ],
                employment_rate=82.0,
                website="https://www.ifocop.fr"
            ),
            Formation(
                id="form_005",
                title="Certification Scrum Master (PSM I)",
                provider="Scrum.org via Udemy",
                description="Préparation à la certification Professional Scrum Master",
                formation_type=FormationType.SHORT_TRAINING,
                delivery_mode=DeliveryMode.REMOTE,
                duration_hours=40,
                duration_description="1 mois à votre rythme",
                objectives=[
                    "Comprendre le framework Scrum",
                    "Maîtriser le rôle de Scrum Master",
                    "Préparer la certification PSM I"
                ],
                prerequisites=["Connaissance de base en gestion de projet"],
                skills_acquired=[
                    "Scrum",
                    "Agilité",
                    "Animation d'équipe",
                    "Facilitation"
                ],
                certification_name="Professional Scrum Master I",
                price=450.0,
                price_per_hour=11.25,
                cpf_eligible=False,
                pole_emploi_eligible=False,
                opco_eligible=True,
                region_eligible=False,
                job_opportunities=[
                    "Scrum Master",
                    "Coach Agile",
                    "Chef de projet Agile"
                ],
                website="https://www.udemy.com"
            ),
            Formation(
                id="form_006",
                title="Consultant en Ressources Humaines",
                provider="CNAM",
                description="Licence professionnelle métiers de la GRH",
                formation_type=FormationType.PROFESSIONAL_LICENSE,
                delivery_mode=DeliveryMode.HYBRID,
                duration_hours=600,
                duration_description="1 an (alternance possible)",
                objectives=[
                    "Maîtriser les techniques de recrutement",
                    "Gérer l'administration du personnel",
                    "Piloter la formation et la GPEC",
                    "Accompagner les transformations RH"
                ],
                prerequisites=["Bac+2 ou équivalent"],
                skills_acquired=[
                    "Recrutement",
                    "Gestion administrative",
                    "Droit du travail",
                    "Formation professionnelle",
                    "GPEC"
                ],
                certification_name="Licence Pro Métiers de la GRH",
                rncp_code="RNCP29964",
                locations=["Paris", "Lyon", "Toulouse"],
                price=3500.0,
                price_per_hour=5.83,
                cpf_eligible=True,
                pole_emploi_eligible=True,
                opco_eligible=True,
                region_eligible=True,
                job_opportunities=[
                    "Consultant RH",
                    "Chargé de recrutement",
                    "Responsable formation"
                ],
                employment_rate=85.0,
                website="https://www.cnam.fr"
            ),
            Formation(
                id="form_007",
                title="UX/UI Designer",
                provider="Ironhack",
                description="Formation intensive en design d'expérience utilisateur",
                formation_type=FormationType.CERTIFYING,
                delivery_mode=DeliveryMode.HYBRID,
                duration_hours=360,
                duration_description="9 semaines intensives",
                objectives=[
                    "Mener une recherche utilisateur",
                    "Concevoir des wireframes et prototypes",
                    "Designer des interfaces ergonomiques",
                    "Tester et itérer"
                ],
                prerequisites=["Sensibilité au design"],
                skills_acquired=[
                    "UX Research",
                    "UI Design",
                    "Figma",
                    "Prototypage",
                    "Design Thinking"
                ],
                certification_name="UX/UI Designer",
                locations=["Paris"],
                price=6900.0,
                price_per_hour=19.16,
                cpf_eligible=True,
                pole_emploi_eligible=True,
                opco_eligible=False,
                region_eligible=False,
                job_opportunities=[
                    "UX Designer",
                    "UI Designer",
                    "Product Designer"
                ],
                employment_rate=87.0,
                website="https://www.ironhack.com"
            ),
            Formation(
                id="form_008",
                title="Marketing Digital et E-commerce",
                provider="ESECAD",
                description="Formation à distance aux métiers du marketing digital",
                formation_type=FormationType.QUALIFYING,
                delivery_mode=DeliveryMode.REMOTE,
                duration_hours=500,
                duration_description="12 mois à votre rythme",
                objectives=[
                    "Élaborer une stratégie digitale",
                    "Maîtriser le SEO et SEA",
                    "Gérer des campagnes publicitaires",
                    "Optimiser un site e-commerce"
                ],
                prerequisites=["Niveau bac"],
                skills_acquired=[
                    "Marketing digital",
                    "SEO/SEA",
                    "Google Ads",
                    "E-commerce",
                    "Analytics"
                ],
                price=3200.0,
                price_per_hour=6.4,
                cpf_eligible=True,
                pole_emploi_eligible=True,
                opco_eligible=True,
                region_eligible=False,
                job_opportunities=[
                    "Chargé de marketing digital",
                    "Traffic Manager",
                    "Responsable e-commerce"
                ],
                employment_rate=80.0,
                website="https://www.esecad.com"
            )
        ]

    def get_all_formations(self) -> List[Formation]:
        """Retourne toutes les formations."""
        return self.formations

    def search_by_keyword(self, keyword: str) -> List[Formation]:
        """Recherche par mot-clé."""
        keyword_lower = keyword.lower()
        results = []

        for formation in self.formations:
            if (keyword_lower in formation.title.lower() or
                keyword_lower in formation.description.lower() or
                any(keyword_lower in skill.lower() for skill in formation.skills_acquired)):
                results.append(formation)

        return results

    def filter_by_criteria(
        self,
        **criteria
    ) -> List[Formation]:
        """Filtre les formations selon des critères."""
        results = self.formations.copy()

        if 'cpf_eligible' in criteria:
            results = [f for f in results if f.cpf_eligible == criteria['cpf_eligible']]

        if 'delivery_mode' in criteria:
            results = [f for f in results if f.delivery_mode == criteria['delivery_mode']]

        if 'max_price' in criteria:
            results = [f for f in results if f.price <= criteria['max_price']]

        if 'max_duration_hours' in criteria:
            results = [f for f in results if f.duration_hours <= criteria['max_duration_hours']]

        if 'formation_type' in criteria:
            results = [f for f in results if f.formation_type == criteria['formation_type']]

        return results
