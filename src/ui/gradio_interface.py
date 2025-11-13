"""Interface Gradio pour le chatbot d'insertion professionnelle."""

import gradio as gr
from typing import List, Tuple
import json

from ..services import ChatbotOrchestrator


def create_gradio_interface(orchestrator: ChatbotOrchestrator) -> gr.Blocks:
    """
    Crée l'interface Gradio du chatbot.

    Args:
        orchestrator: Orchestrateur du chatbot

    Returns:
        Interface Gradio
    """

    def chat_function(
        message: str,
        history: List[Tuple[str, str]],
        user_id: str
    ) -> Tuple[str, List[Tuple[str, str]]]:
        """
        Fonction de chat principale.

        Args:
            message: Message de l'utilisateur
            history: Historique de conversation
            user_id: ID de l'utilisateur

        Returns:
            Tuple (réponse vide pour clear input, historique mis à jour)
        """
        if not message.strip():
            return "", history

        # Traiter le message
        response = orchestrator.process_message(user_id, message)

        # Ajouter à l'historique
        history.append((message, response["message"]))

        return "", history

    def get_suggestions(user_id: str) -> List[str]:
        """Récupère les suggestions contextuelles."""
        context = orchestrator.get_or_create_context(user_id)

        # Suggestions par défaut selon l'étape
        suggestions_map = {
            "initial": [
                "Je suis demandeur d'emploi",
                "Je suis salarié en reconversion",
                "Je cherche une formation"
            ],
            "profile": [
                "Je voudrais me reconvertir dans le digital",
                "Quelles formations pour moi ?",
                "Comment financer ma formation ?"
            ],
            "orientation": [
                "Quels métiers pour mon profil ?",
                "Quelles sont les compétences recherchées ?",
                "Je veux changer de secteur"
            ],
            "formation": [
                "Formations en développement web",
                "Formations financées par le CPF",
                "Formations à distance"
            ],
            "financing": [
                "Comment utiliser mon CPF ?",
                "Quelles aides de Pôle Emploi ?",
                "Puis-je cumuler plusieurs financements ?"
            ],
            "dossier": [
                "Quels documents me manquent ?",
                "Comment remplir le dossier CPF ?",
                "Aide pour la lettre de motivation"
            ]
        }

        return suggestions_map.get(context.current_step, [
            "Aide-moi à m'orienter",
            "Trouve-moi une formation",
            "Calcule mon financement"
        ])

    def get_user_summary(user_id: str) -> str:
        """Affiche un résumé de la situation de l'utilisateur."""
        summary = orchestrator.get_user_summary(user_id)

        text = "📊 **Votre parcours:**\n\n"

        if summary["has_profile"]:
            text += "✓ Profil complété\n"
        else:
            text += "○ Profil à compléter\n"

        if summary["has_formation"]:
            text += "✓ Formation sélectionnée\n"
        else:
            text += "○ Formation à choisir\n"

        if summary["has_dossier"]:
            text += "✓ Dossier créé\n"
        else:
            text += "○ Dossier à créer\n"

        text += f"\nÉtape actuelle: **{summary['current_step']}**"

        return text

    # Création de l'interface
    with gr.Blocks(
        title="Assistant Insertion Professionnelle",
        theme=gr.themes.Soft()
    ) as interface:

        gr.Markdown("""
        # 🎓 Assistant Insertion Professionnelle

        Votre conseiller personnel pour votre projet de formation et d'insertion professionnelle.
        Je vous aide à :
        - 🎯 Définir votre projet professionnel
        - 📚 Trouver la formation adaptée
        - 💰 Identifier les financements possibles
        - 📋 Monter votre dossier de financement
        """)

        with gr.Row():
            with gr.Column(scale=3):
                chatbot = gr.Chatbot(
                    label="Conversation",
                    height=500,
                    show_label=True,
                    avatar_images=(None, "🤖")
                )

                with gr.Row():
                    msg = gr.Textbox(
                        label="Votre message",
                        placeholder="Posez votre question...",
                        scale=4,
                        show_label=False
                    )
                    submit_btn = gr.Button("Envoyer", variant="primary", scale=1)

                with gr.Row():
                    gr.Markdown("**Suggestions:**")

                suggestions_row = gr.Row()
                with suggestions_row:
                    suggestion_btn_1 = gr.Button("💼 Mon profil", size="sm")
                    suggestion_btn_2 = gr.Button("📚 Formations", size="sm")
                    suggestion_btn_3 = gr.Button("💰 Financements", size="sm")
                    suggestion_btn_4 = gr.Button("📋 Mon dossier", size="sm")

            with gr.Column(scale=1):
                gr.Markdown("### 📊 Votre Progression")

                user_id_input = gr.Textbox(
                    label="Identifiant utilisateur",
                    value="user_demo",
                    interactive=True
                )

                summary_display = gr.Markdown("Chargement...")

                refresh_btn = gr.Button("🔄 Actualiser", size="sm")

                gr.Markdown("---")

                gr.Markdown("""
                ### 💡 Conseils

                - Soyez précis dans vos questions
                - Partagez votre situation actuelle
                - N'hésitez pas à demander des clarifications
                - Prenez le temps de bien décrire votre projet
                """)

                reset_btn = gr.Button("🔄 Nouvelle conversation", variant="secondary")

        # Événements
        def submit_message(message, history, user_id):
            return chat_function(message, history, user_id)

        def use_suggestion(suggestion_text, history, user_id):
            return chat_function(suggestion_text, history, user_id)

        def update_summary(user_id):
            return get_user_summary(user_id)

        def reset_conversation(user_id):
            orchestrator.reset_context(user_id)
            return [], get_user_summary(user_id)

        # Connexion des événements
        submit_btn.click(
            submit_message,
            inputs=[msg, chatbot, user_id_input],
            outputs=[msg, chatbot]
        )

        msg.submit(
            submit_message,
            inputs=[msg, chatbot, user_id_input],
            outputs=[msg, chatbot]
        )

        suggestion_btn_1.click(
            lambda h, u: use_suggestion("Parle-moi de mon profil et de ma situation", h, u),
            inputs=[chatbot, user_id_input],
            outputs=[msg, chatbot]
        )

        suggestion_btn_2.click(
            lambda h, u: use_suggestion("Quelles formations me recommandes-tu ?", h, u),
            inputs=[chatbot, user_id_input],
            outputs=[msg, chatbot]
        )

        suggestion_btn_3.click(
            lambda h, u: use_suggestion("Comment puis-je financer ma formation ?", h, u),
            inputs=[chatbot, user_id_input],
            outputs=[msg, chatbot]
        )

        suggestion_btn_4.click(
            lambda h, u: use_suggestion("Aide-moi à monter mon dossier", h, u),
            inputs=[chatbot, user_id_input],
            outputs=[msg, chatbot]
        )

        refresh_btn.click(
            update_summary,
            inputs=[user_id_input],
            outputs=[summary_display]
        )

        reset_btn.click(
            reset_conversation,
            inputs=[user_id_input],
            outputs=[chatbot, summary_display]
        )

        # Chargement initial du résumé
        interface.load(
            update_summary,
            inputs=[user_id_input],
            outputs=[summary_display]
        )

    return interface
