"""
Exemple d'utilisation du chatbot d'insertion professionnelle.

Ce script démontre comment utiliser le système agentique pour :
1. Créer un profil utilisateur
2. Obtenir des recommandations d'orientation
3. Rechercher des formations
4. Calculer les financements
5. Créer un dossier de financement
"""

import sys
import os

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.services import ChatbotOrchestrator
from src.models import UserProfile, EmploymentStatus


def demo_complete_workflow():
    """Démonstration du workflow complet."""

    print("=" * 80)
    print("DÉMONSTRATION DU CHATBOT D'INSERTION PROFESSIONNELLE")
    print("=" * 80)
    print()

    # Initialiser l'orchestrateur
    print("📋 Initialisation du système...")
    orchestrator = ChatbotOrchestrator()
    print("✓ Système initialisé\n")

    # Créer un profil utilisateur exemple
    print("👤 Création du profil utilisateur...")
    user_id = "marie_dupont"
    context = orchestrator.get_or_create_context(user_id)

    context.user_profile = UserProfile(
        name="Marie Dupont",
        age=32,
        employment_status=EmploymentStatus.UNEMPLOYED,
        work_experience_years=8,
        skills=[
            "gestion de projet",
            "communication",
            "organisation",
            "bureautique",
            "travail en équipe"
        ],
        pole_emploi_registered=True,
        cpf_balance=2500.0,
        target_job="Chef de projet digital",
        target_sector="Digital/Tech",
        desired_formations=["Formation Product Owner", "Certification Scrum Master"]
    )
    print(f"✓ Profil créé pour {context.user_profile.name}\n")

    # Étape 1: Orientation professionnelle
    print("=" * 80)
    print("ÉTAPE 1: ORIENTATION PROFESSIONNELLE")
    print("=" * 80)
    print()

    response = orchestrator.process_message(
        user_id,
        "Quels métiers correspondent à mon profil ?"
    )
    print("🎯 Recommandations d'orientation:")
    print(response["message"])
    print()

    # Étape 2: Recherche de formations
    print("=" * 80)
    print("ÉTAPE 2: RECHERCHE DE FORMATIONS")
    print("=" * 80)
    print()

    response = orchestrator.process_message(
        user_id,
        "Quelles formations me recommandes-tu pour devenir Product Owner ?"
    )
    print("📚 Formations recommandées:")
    print(response["message"])
    print()

    # Sélectionner une formation
    if response.get("formations"):
        context.selected_formation = orchestrator.formation_kb.formations[0]
        print(f"✓ Formation sélectionnée: {context.selected_formation.title}\n")

    # Étape 3: Calcul du financement
    print("=" * 80)
    print("ÉTAPE 3: ANALYSE DU FINANCEMENT")
    print("=" * 80)
    print()

    response = orchestrator.process_message(
        user_id,
        "Comment puis-je financer cette formation ?"
    )
    print("💰 Plan de financement:")
    print(response["message"])
    print()

    # Étape 4: Création du dossier
    print("=" * 80)
    print("ÉTAPE 4: MONTAGE DU DOSSIER")
    print("=" * 80)
    print()

    response = orchestrator.process_message(
        user_id,
        "Aide-moi à monter le dossier de financement"
    )
    print("📋 Dossier de financement:")
    print(response["message"])
    print()

    # Résumé final
    print("=" * 80)
    print("RÉSUMÉ FINAL")
    print("=" * 80)
    print()

    summary = orchestrator.get_user_summary(user_id)
    print(f"👤 Utilisateur: {user_id}")
    print(f"📊 Étape actuelle: {summary['current_step']}")
    print(f"✓ Profil: {'Oui' if summary['has_profile'] else 'Non'}")
    print(f"✓ Formation: {'Oui' if summary['has_formation'] else 'Non'}")
    print(f"✓ Dossier: {'Oui' if summary['has_dossier'] else 'Non'}")
    print(f"💬 Messages échangés: {summary['conversation_length']}")
    print()

    print("=" * 80)
    print("DÉMONSTRATION TERMINÉE")
    print("=" * 80)


def demo_agent_interactions():
    """Démonstration des interactions entre agents."""

    print("\n" + "=" * 80)
    print("DÉMONSTRATION DES AGENTS SPÉCIALISÉS")
    print("=" * 80)
    print()

    orchestrator = ChatbotOrchestrator()

    # Test de l'agent de financement
    print("💰 Agent de financement:")
    print(f"   Capacités: {len(orchestrator.financing_agent.get_capabilities())} fonctions")
    for cap in orchestrator.financing_agent.get_capabilities():
        print(f"   - {cap}")
    print()

    # Test de l'agent de formation
    print("📚 Agent de formation:")
    print(f"   Capacités: {len(orchestrator.formation_agent.get_capabilities())} fonctions")
    for cap in orchestrator.formation_agent.get_capabilities():
        print(f"   - {cap}")
    print()

    # Test de l'agent d'orientation
    print("🎯 Agent d'orientation:")
    print(f"   Capacités: {len(orchestrator.orientation_agent.get_capabilities())} fonctions")
    for cap in orchestrator.orientation_agent.get_capabilities():
        print(f"   - {cap}")
    print()

    # Test de l'agent de dossier
    print("📋 Agent de dossier:")
    print(f"   Capacités: {len(orchestrator.dossier_agent.get_capabilities())} fonctions")
    for cap in orchestrator.dossier_agent.get_capabilities():
        print(f"   - {cap}")
    print()


def demo_knowledge_bases():
    """Démonstration des bases de connaissances."""

    print("\n" + "=" * 80)
    print("BASES DE CONNAISSANCES")
    print("=" * 80)
    print()

    orchestrator = ChatbotOrchestrator()

    # Base de connaissances financement
    print("💰 Dispositifs de financement disponibles:")
    for scheme in orchestrator.financing_kb.get_all_schemes():
        print(f"\n   📌 {scheme.name}")
        print(f"      Type: {scheme.financing_type}")
        print(f"      Éligibilité: {len(scheme.eligibility_criteria)} critères")
        print(f"      Documents requis: {len(scheme.required_documents)}")

    print("\n" + "-" * 80)

    # Base de connaissances formations
    print("\n📚 Formations en catalogue:")
    for formation in orchestrator.formation_kb.get_all_formations():
        print(f"\n   📖 {formation.title}")
        print(f"      Organisme: {formation.provider}")
        print(f"      Durée: {formation.duration_description}")
        print(f"      Prix: {formation.price}€")
        print(f"      CPF: {'✓' if formation.cpf_eligible else '✗'}")


if __name__ == "__main__":
    # Exécuter toutes les démos
    demo_complete_workflow()
    demo_agent_interactions()
    demo_knowledge_bases()
