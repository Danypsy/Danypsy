"""
Point d'entrée principal du chatbot d'insertion professionnelle.

Ce chatbot agentique aide les utilisateurs dans leur parcours d'insertion
professionnelle en les accompagnant sur :
- L'orientation professionnelle
- La recherche de formations
- Le financement des formations
- Le montage de dossiers
"""

import os
import sys
from dotenv import load_dotenv

# Ajouter le répertoire src au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.services import ChatbotOrchestrator
from src.ui import create_gradio_interface


def main():
    """Fonction principale."""
    # Charger les variables d'environnement
    load_dotenv()

    print("🚀 Démarrage du chatbot d'insertion professionnelle...")

    # Initialiser l'orchestrateur
    orchestrator = ChatbotOrchestrator()

    print("✓ Agents spécialisés initialisés")
    print("✓ Base de connaissances chargée")
    print(f"  - {len(orchestrator.financing_kb.schemes)} dispositifs de financement")
    print(f"  - {len(orchestrator.formation_kb.formations)} formations en catalogue")

    # Créer l'interface
    interface = create_gradio_interface(orchestrator)

    print("\n📱 Lancement de l'interface Gradio...")
    print("=" * 60)

    # Lancer l'interface
    interface.launch(
        server_name="0.0.0.0",
        server_port=int(os.getenv("APP_PORT", 7860)),
        share=False,
        show_error=True
    )


if __name__ == "__main__":
    main()
