"""Agent spécialisé dans le financement des formations."""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent, AgentMessage
from ..models import UserProfile, Formation, FinancingScheme, FinancingType


class FinancingAgent(BaseAgent):
    """
    Agent expert en dispositifs de financement de formations professionnelles.

    Compétences:
    - Identification des dispositifs de financement éligibles
    - Calcul des montants de financement
    - Conseil sur les combinaisons de financements
    - Vérification d'éligibilité
    """

    def __init__(self):
        super().__init__(
            name="FinancingAgent",
            description="Expert en financement de formations professionnelles"
        )
        self.financing_schemes: List[FinancingScheme] = []

    def process_message(self, message: AgentMessage) -> AgentMessage:
        """Traite les demandes liées au financement."""
        if message.message_type == "eligibility_check":
            return self._check_eligibility(message)
        elif message.message_type == "calculate_financing":
            return self._calculate_financing(message)
        elif message.message_type == "recommend_schemes":
            return self._recommend_schemes(message)
        else:
            return self.send_message(
                message.sender,
                "Type de message non reconnu",
                "error"
            )

    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyse la situation financière pour une formation.

        Args:
            data: Doit contenir 'user_profile' et 'formation'

        Returns:
            Analyse complète des options de financement
        """
        user_profile = data.get('user_profile')
        formation = data.get('formation')

        if not user_profile or not formation:
            return {"error": "Profil utilisateur et formation requis"}

        eligible_schemes = self.find_eligible_schemes(user_profile, formation)
        financing_plan = self.create_optimal_financing_plan(
            user_profile, formation, eligible_schemes
        )

        return {
            "eligible_schemes": [s.dict() for s in eligible_schemes],
            "financing_plan": financing_plan,
            "recommendations": self._generate_recommendations(
                user_profile, formation, financing_plan
            )
        }

    def find_eligible_schemes(
        self,
        user_profile: UserProfile,
        formation: Formation
    ) -> List[FinancingScheme]:
        """
        Trouve tous les dispositifs de financement éligibles.

        Args:
            user_profile: Profil de l'utilisateur
            formation: Formation visée

        Returns:
            Liste des dispositifs éligibles
        """
        eligible = []

        for scheme in self.financing_schemes:
            if self._is_eligible(user_profile, formation, scheme):
                eligible.append(scheme)

        return eligible

    def _is_eligible(
        self,
        user_profile: UserProfile,
        formation: Formation,
        scheme: FinancingScheme
    ) -> bool:
        """Vérifie l'éligibilité à un dispositif."""

        # CPF - Compte Personnel de Formation
        if scheme.financing_type == FinancingType.CPF:
            return formation.cpf_eligible and user_profile.cpf_balance and user_profile.cpf_balance > 0

        # Pôle Emploi AIF
        elif scheme.financing_type == FinancingType.POLE_EMPLOI_AIF:
            return (
                user_profile.employment_status.value == "demandeur_emploi" and
                user_profile.pole_emploi_registered and
                formation.pole_emploi_eligible
            )

        # AGEFIPH pour personnes handicapées
        elif scheme.financing_type == FinancingType.AGEFIPH:
            return user_profile.has_handicap_status

        # Transition Pro (ex-Fongecif)
        elif scheme.financing_type == FinancingType.TRANSITION_PRO:
            return (
                user_profile.employment_status.value == "salarie" and
                user_profile.work_experience_years >= 2
            )

        # OPCO - pour salariés
        elif scheme.financing_type == FinancingType.OPCO:
            return user_profile.employment_status.value == "salarie" and formation.opco_eligible

        # Conseil Régional
        elif scheme.financing_type == FinancingType.REGION:
            return formation.region_eligible

        return True

    def create_optimal_financing_plan(
        self,
        user_profile: UserProfile,
        formation: Formation,
        eligible_schemes: List[FinancingScheme]
    ) -> Dict[str, Any]:
        """
        Crée un plan de financement optimal combinant plusieurs dispositifs.

        Args:
            user_profile: Profil utilisateur
            formation: Formation visée
            eligible_schemes: Dispositifs éligibles

        Returns:
            Plan de financement détaillé
        """
        total_cost = formation.price
        remaining_cost = total_cost
        financing_sources = []

        # Prioriser l'utilisation du CPF d'abord
        cpf_scheme = next(
            (s for s in eligible_schemes if s.financing_type == FinancingType.CPF),
            None
        )
        if cpf_scheme and user_profile.cpf_balance:
            cpf_amount = min(user_profile.cpf_balance, remaining_cost)
            financing_sources.append({
                "scheme": cpf_scheme.name,
                "type": cpf_scheme.financing_type,
                "amount": cpf_amount,
                "coverage_percentage": (cpf_amount / total_cost) * 100
            })
            remaining_cost -= cpf_amount

        # Ajouter les autres financements
        for scheme in eligible_schemes:
            if scheme.financing_type == FinancingType.CPF:
                continue  # Déjà traité

            if remaining_cost <= 0:
                break

            # Calculer le montant selon le dispositif
            if scheme.max_amount:
                amount = min(scheme.max_amount, remaining_cost)
            elif scheme.coverage_percentage:
                amount = min(
                    (remaining_cost * scheme.coverage_percentage / 100),
                    remaining_cost
                )
            else:
                amount = remaining_cost

            # Vérifier les combinaisons possibles
            can_combine = True
            for source in financing_sources:
                if source["type"] not in scheme.can_combine_with:
                    can_combine = False
                    break

            if can_combine and amount > 0:
                financing_sources.append({
                    "scheme": scheme.name,
                    "type": scheme.financing_type,
                    "amount": amount,
                    "coverage_percentage": (amount / total_cost) * 100
                })
                remaining_cost -= amount

        return {
            "total_cost": total_cost,
            "total_financed": total_cost - remaining_cost,
            "personal_contribution": remaining_cost,
            "financing_sources": financing_sources,
            "coverage_rate": ((total_cost - remaining_cost) / total_cost) * 100
        }

    def _check_eligibility(self, message: AgentMessage) -> AgentMessage:
        """Vérifie l'éligibilité aux dispositifs."""
        user_profile = message.data.get('user_profile')
        formation = message.data.get('formation')

        eligible = self.find_eligible_schemes(user_profile, formation)

        return self.send_message(
            message.sender,
            f"Trouvé {len(eligible)} dispositifs de financement éligibles",
            "response",
            {"eligible_schemes": [s.dict() for s in eligible]}
        )

    def _calculate_financing(self, message: AgentMessage) -> AgentMessage:
        """Calcule un plan de financement."""
        user_profile = message.data.get('user_profile')
        formation = message.data.get('formation')
        eligible_schemes = message.data.get('eligible_schemes', [])

        plan = self.create_optimal_financing_plan(
            user_profile, formation, eligible_schemes
        )

        return self.send_message(
            message.sender,
            "Plan de financement calculé",
            "response",
            {"financing_plan": plan}
        )

    def _recommend_schemes(self, message: AgentMessage) -> AgentMessage:
        """Recommande les meilleurs dispositifs."""
        analysis = self.analyze(message.data)

        return self.send_message(
            message.sender,
            "Recommandations de financement générées",
            "response",
            analysis
        )

    def _generate_recommendations(
        self,
        user_profile: UserProfile,
        formation: Formation,
        financing_plan: Dict[str, Any]
    ) -> List[str]:
        """Génère des recommandations personnalisées."""
        recommendations = []

        # Recommandations sur le CPF
        if user_profile.cpf_balance:
            if user_profile.cpf_balance < formation.price:
                recommendations.append(
                    f"Votre CPF ({user_profile.cpf_balance}€) ne couvre pas la totalité. "
                    "Envisagez de le compléter avec un autre dispositif."
                )
        else:
            recommendations.append(
                "Vérifiez votre solde CPF sur moncompteformation.gouv.fr"
            )

        # Recommandations selon le statut
        if user_profile.employment_status.value == "demandeur_emploi":
            recommendations.append(
                "En tant que demandeur d'emploi, consultez votre conseiller Pôle Emploi "
                "pour l'AIF (Aide Individuelle à la Formation)"
            )

        if user_profile.has_handicap_status:
            recommendations.append(
                "Votre reconnaissance de handicap vous ouvre droit aux aides AGEFIPH"
            )

        # Reste à charge
        if financing_plan["personal_contribution"] > 0:
            recommendations.append(
                f"Reste à charge: {financing_plan['personal_contribution']:.2f}€. "
                "Vérifiez les possibilités d'échelonnement avec l'organisme de formation."
            )
        else:
            recommendations.append(
                "La formation peut être financée à 100% !"
            )

        return recommendations

    def get_capabilities(self) -> List[str]:
        """Retourne les capacités de l'agent."""
        return [
            "Identifier les dispositifs de financement éligibles",
            "Calculer les montants de financement possibles",
            "Optimiser les combinaisons de financements",
            "Vérifier les critères d'éligibilité",
            "Générer des recommandations personnalisées",
            "Estimer le reste à charge"
        ]
