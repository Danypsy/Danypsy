"""Tests unitaires pour les agents."""

import sys
import os
import unittest

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.agents import FinancingAgent, FormationAgent, OrientationAgent, DossierAgent
from src.models import UserProfile, Formation, FinancingScheme, EmploymentStatus, FormationType, DeliveryMode, FinancingType
from src.knowledge import FinancingKnowledgeBase, FormationKnowledgeBase


class TestFinancingAgent(unittest.TestCase):
    """Tests pour l'agent de financement."""

    def setUp(self):
        """Initialisation avant chaque test."""
        self.agent = FinancingAgent()
        self.kb = FinancingKnowledgeBase()
        self.agent.financing_schemes = self.kb.get_all_schemes()

        self.user_profile = UserProfile(
            name="Test User",
            employment_status=EmploymentStatus.UNEMPLOYED,
            pole_emploi_registered=True,
            cpf_balance=2000.0
        )

        self.formation = Formation(
            title="Test Formation",
            provider="Test Provider",
            description="Test",
            formation_type=FormationType.CERTIFYING,
            delivery_mode=DeliveryMode.REMOTE,
            duration_hours=400,
            duration_description="4 mois",
            price=3000.0,
            cpf_eligible=True,
            pole_emploi_eligible=True
        )

    def test_find_eligible_schemes(self):
        """Test de recherche des dispositifs éligibles."""
        eligible = self.agent.find_eligible_schemes(self.user_profile, self.formation)
        self.assertGreater(len(eligible), 0)
        self.assertTrue(any(s.financing_type == FinancingType.CPF for s in eligible))

    def test_create_financing_plan(self):
        """Test de création d'un plan de financement."""
        eligible = self.agent.find_eligible_schemes(self.user_profile, self.formation)
        plan = self.agent.create_optimal_financing_plan(
            self.user_profile, self.formation, eligible
        )

        self.assertEqual(plan["total_cost"], 3000.0)
        self.assertGreaterEqual(plan["total_financed"], 0)
        self.assertGreaterEqual(len(plan["financing_sources"]), 1)

    def test_agent_capabilities(self):
        """Test des capacités de l'agent."""
        capabilities = self.agent.get_capabilities()
        self.assertGreater(len(capabilities), 0)
        self.assertIsInstance(capabilities, list)


class TestFormationAgent(unittest.TestCase):
    """Tests pour l'agent de formation."""

    def setUp(self):
        """Initialisation avant chaque test."""
        self.agent = FormationAgent()
        self.kb = FormationKnowledgeBase()
        self.agent.formations_catalog = self.kb.get_all_formations()

        self.user_profile = UserProfile(
            name="Test User",
            employment_status=EmploymentStatus.UNEMPLOYED,
            skills=["programmation", "gestion de projet"],
            target_job="Développeur Web"
        )

    def test_find_matching_formations(self):
        """Test de recherche de formations."""
        formations = self.agent.find_matching_formations(self.user_profile)
        self.assertGreater(len(formations), 0)

    def test_calculate_match_score(self):
        """Test de calcul du score de correspondance."""
        formation = self.kb.formations[0]
        score = self.agent._calculate_match_score(self.user_profile, formation)
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 1.0)

    def test_create_learning_path(self):
        """Test de création d'un parcours d'apprentissage."""
        formations = self.agent.find_matching_formations(self.user_profile)
        path = self.agent.create_learning_path(self.user_profile, formations)

        self.assertIn("recommended_path", path)
        self.assertIsInstance(path["recommended_path"], list)


class TestOrientationAgent(unittest.TestCase):
    """Tests pour l'agent d'orientation."""

    def setUp(self):
        """Initialisation avant chaque test."""
        self.agent = OrientationAgent()

        self.user_profile = UserProfile(
            name="Test User",
            employment_status=EmploymentStatus.UNEMPLOYED,
            skills=["communication", "gestion", "organisation"],
            work_experience_years=5
        )

    def test_suggest_career_paths(self):
        """Test de suggestions de carrière."""
        suggestions = self.agent.suggest_career_paths(self.user_profile)
        self.assertGreater(len(suggestions), 0)

        for suggestion in suggestions:
            self.assertIn("job_title", suggestion)
            self.assertIn("match_score", suggestion)

    def test_identify_transferable_skills(self):
        """Test d'identification des compétences transférables."""
        transferable = self.agent.identify_transferable_skills(self.user_profile)

        self.assertIn("soft_skills", transferable)
        self.assertIn("hard_skills", transferable)
        self.assertIn("applicable_sectors", transferable)

    def test_create_career_development_plan(self):
        """Test de création d'un plan de développement."""
        plan = self.agent.create_career_development_plan(self.user_profile)

        self.assertIn("short_term", plan)
        self.assertIn("medium_term", plan)
        self.assertIn("long_term", plan)


class TestDossierAgent(unittest.TestCase):
    """Tests pour l'agent de dossier."""

    def setUp(self):
        """Initialisation avant chaque test."""
        self.agent = DossierAgent()
        self.kb = FinancingKnowledgeBase()

    def test_create_dossier(self):
        """Test de création d'un dossier."""
        schemes = self.kb.get_all_schemes()[:2]

        dossier = self.agent.create_dossier(
            user_profile_id="test_user",
            formation_id="test_formation",
            financing_schemes=schemes,
            formation_cost=3000.0
        )

        self.assertEqual(dossier.total_cost, 3000.0)
        self.assertGreater(len(dossier.documents), 0)

    def test_check_completeness(self):
        """Test de vérification de complétude."""
        schemes = self.kb.get_all_schemes()[:1]

        dossier = self.agent.create_dossier(
            user_profile_id="test_user",
            formation_id="test_formation",
            financing_schemes=schemes,
            formation_cost=3000.0
        )

        completeness = self.agent.check_completeness(dossier)

        self.assertIn("total_documents", completeness)
        self.assertIn("completion_rate", completeness)
        self.assertIn("is_ready_to_submit", completeness)

    def test_generate_alerts(self):
        """Test de génération d'alertes."""
        schemes = self.kb.get_all_schemes()[:1]

        dossier = self.agent.create_dossier(
            user_profile_id="test_user",
            formation_id="test_formation",
            financing_schemes=schemes,
            formation_cost=3000.0
        )

        alerts = self.agent.generate_alerts(dossier)
        self.assertIsInstance(alerts, list)


class TestKnowledgeBases(unittest.TestCase):
    """Tests pour les bases de connaissances."""

    def test_financing_knowledge_base(self):
        """Test de la base de connaissances financement."""
        kb = FinancingKnowledgeBase()
        schemes = kb.get_all_schemes()

        self.assertGreater(len(schemes), 0)

        # Vérifier que tous les types principaux sont présents
        types = [s.financing_type for s in schemes]
        self.assertIn(FinancingType.CPF, types)
        self.assertIn(FinancingType.POLE_EMPLOI_AIF, types)

    def test_formation_knowledge_base(self):
        """Test de la base de connaissances formations."""
        kb = FormationKnowledgeBase()
        formations = kb.get_all_formations()

        self.assertGreater(len(formations), 0)

        # Test de recherche
        results = kb.search_by_keyword("développeur")
        self.assertGreater(len(results), 0)

        # Test de filtrage
        cpf_formations = kb.filter_by_criteria(cpf_eligible=True)
        self.assertGreater(len(cpf_formations), 0)


if __name__ == "__main__":
    unittest.main()
