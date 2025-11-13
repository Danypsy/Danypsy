# 🎓 Chatbot Agentique d'Insertion Professionnelle

Un assistant intelligent spécialisé dans l'accompagnement à l'insertion professionnelle et le montage de financement de formations professionnelles en France.

## 🎯 Fonctionnalités

Ce chatbot agentique vous accompagne sur :

- **🧭 Orientation professionnelle** : Analyse de profil, identification des compétences transférables, suggestions de carrières
- **📚 Recherche de formations** : Recommandations personnalisées, analyse d'adéquation, parcours d'apprentissage
- **💰 Financement** : Identification des dispositifs éligibles (CPF, AIF, OPCO, etc.), calcul des plans de financement, optimisation des combinaisons
- **📋 Montage de dossiers** : Génération de checklists, suivi documentaire, alertes et rappels, calendrier de soumission

## 🏗️ Architecture

Le système est basé sur une **architecture agentique** où plusieurs agents spécialisés collaborent :

### Agents Spécialisés

1. **FinancingAgent** : Expert en dispositifs de financement
2. **FormationAgent** : Expert en formations professionnelles
3. **OrientationAgent** : Expert en orientation professionnelle
4. **DossierAgent** : Expert en montage de dossiers

### Orchestrateur

Le **ChatbotOrchestrator** coordonne les agents et gère le flux de conversation.

## 📦 Installation

```bash
pip install -r requirements.txt
python main.py
```

L'interface Gradio sera accessible sur `http://localhost:7860`

## 🧪 Tests

```bash
python tests/test_agents.py
```

## 📖 Documentation

Voir les exemples dans `examples/demo_usage.py`

## 👨‍💻 Auteur

**Danypsy** - Spécialiste en IA et Machine Learning
