"""Base de connaissances sur les dispositifs de financement."""

from typing import List, Dict, Any
from ..models import FinancingScheme, FinancingType


class FinancingKnowledgeBase:
    """Base de connaissances des dispositifs de financement en France."""

    def __init__(self):
        self.schemes = self._load_financing_schemes()

    def _load_financing_schemes(self) -> List[FinancingScheme]:
        """Charge tous les dispositifs de financement."""
        return [
            self._create_cpf_scheme(),
            self._create_aif_scheme(),
            self._create_afpr_scheme(),
            self._create_poei_scheme(),
            self._create_opco_scheme(),
            self._create_region_scheme(),
            self._create_agefiph_scheme(),
            self._create_transition_pro_scheme(),
            self._create_pdc_scheme()
        ]

    def _create_cpf_scheme(self) -> FinancingScheme:
        """CPF - Compte Personnel de Formation."""
        return FinancingScheme(
            id="cpf_001",
            name="CPF - Compte Personnel de Formation",
            financing_type=FinancingType.CPF,
            description=(
                "Le Compte Personnel de Formation (CPF) permet à toute personne active "
                "d'acquérir des droits à la formation mobilisables tout au long de sa vie professionnelle."
            ),
            eligibility_criteria=[
                "Être salarié, indépendant, demandeur d'emploi ou jeune sorti du système scolaire",
                "Formation éligible au CPF (certifiante ou qualifiante)",
                "Avoir des droits CPF disponibles"
            ],
            excluded_profiles=[],
            max_amount=None,  # Dépend du solde individuel
            coverage_percentage=100,  # Si solde suffisant
            required_documents=[
                "Inscription sur Mon Compte Formation",
                "Pièce d'identité",
                "Numéro de sécurité sociale"
            ],
            processing_time_days=7,
            deadline_before_training=11,  # 11 jours ouvrés
            application_process=[
                "1. Créer un compte sur moncompteformation.gouv.fr",
                "2. Vérifier son solde CPF",
                "3. Rechercher une formation éligible",
                "4. S'inscrire et valider la demande",
                "5. Attendre la validation (11 jours de délai)"
            ],
            contact_info="0800 222 999 (numéro vert)",
            website="https://www.moncompteformation.gouv.fr",
            can_combine_with=[
                FinancingType.POLE_EMPLOI_AIF,
                FinancingType.REGION,
                FinancingType.AGEFIPH,
                FinancingType.PERSONAL
            ],
            requirements={
                "formation": "Doit être inscrite au RNCP ou RS",
                "organisme": "Doit être certifié Qualiopi"
            },
            additional_benefits=[
                "Mobilisable à tout moment",
                "Droits acquis même en cas de changement d'employeur",
                "Alimentation annuelle automatique"
            ]
        )

    def _create_aif_scheme(self) -> FinancingScheme:
        """AIF - Aide Individuelle à la Formation (Pôle Emploi)."""
        return FinancingScheme(
            id="aif_001",
            name="AIF - Aide Individuelle à la Formation",
            financing_type=FinancingType.POLE_EMPLOI_AIF,
            description=(
                "L'Aide Individuelle à la Formation permet à Pôle Emploi de financer "
                "tout ou partie d'une formation professionnelle pour les demandeurs d'emploi."
            ),
            eligibility_criteria=[
                "Être inscrit comme demandeur d'emploi",
                "Formation validée par le conseiller Pôle Emploi",
                "Formation cohérente avec le projet professionnel",
                "Autres financements insuffisants (CPF, Région, etc.)"
            ],
            excluded_profiles=["Salariés", "Indépendants en activité"],
            max_amount=None,  # Décision au cas par cas
            coverage_percentage=None,  # Variable, souvent complément
            required_documents=[
                "Demande d'AIF signée",
                "Devis de formation détaillé",
                "Programme de formation",
                "Justificatif d'inscription",
                "Attestation CPF (si applicable)"
            ],
            processing_time_days=15,
            deadline_before_training=30,
            application_process=[
                "1. Trouver la formation adaptée",
                "2. Obtenir un devis détaillé",
                "3. Présenter le projet au conseiller Pôle Emploi",
                "4. Remplir la demande d'AIF",
                "5. Attendre la décision (environ 15 jours)",
                "6. Mobiliser le CPF en complément si nécessaire"
            ],
            contact_info="3949 (service Pôle Emploi)",
            website="https://www.pole-emploi.fr",
            can_combine_with=[
                FinancingType.CPF,
                FinancingType.AGEFIPH,
                FinancingType.PERSONAL
            ],
            requirements={
                "validation": "Accord préalable du conseiller Pôle Emploi obligatoire",
                "pertinence": "Formation en lien direct avec retour à l'emploi"
            },
            additional_benefits=[
                "Possibilité de financement à 100%",
                "Maintien des allocations pendant la formation (sous conditions)",
                "Accompagnement du conseiller"
            ]
        )

    def _create_afpr_scheme(self) -> FinancingScheme:
        """AFPR - Action de Formation Préalable au Recrutement."""
        return FinancingScheme(
            id="afpr_001",
            name="AFPR - Action de Formation Préalable au Recrutement",
            financing_type=FinancingType.POLE_EMPLOI_AFPR,
            description=(
                "L'AFPR finance une formation courte nécessaire pour occuper un emploi "
                "pour lequel il manque certaines compétences au candidat."
            ),
            eligibility_criteria=[
                "Être demandeur d'emploi",
                "Avoir une promesse d'embauche (CDD 6-12 mois)",
                "Formation de 400 heures maximum",
                "Écart de compétences identifié"
            ],
            excluded_profiles=["Personnes sans promesse d'embauche"],
            max_amount=None,
            coverage_percentage=100,
            required_documents=[
                "Promesse d'embauche",
                "Devis de formation",
                "Demande AFPR complétée"
            ],
            processing_time_days=10,
            deadline_before_training=15,
            application_process=[
                "1. Obtenir une promesse d'embauche en CDD (6-12 mois)",
                "2. Identifier avec l'employeur les compétences manquantes",
                "3. Trouver une formation adaptée (max 400h)",
                "4. Faire la demande avec le conseiller Pôle Emploi"
            ],
            contact_info="3949",
            website="https://www.pole-emploi.fr",
            can_combine_with=[],
            requirements={
                "durée": "Maximum 400 heures",
                "contrat": "CDD de 6 à 12 mois obligatoire"
            },
            additional_benefits=[
                "Financement à 100% par Pôle Emploi",
                "Formation ciblée sur le poste",
                "Emploi garanti à l'issue"
            ]
        )

    def _create_poei_scheme(self) -> FinancingScheme:
        """POEI - Préparation Opérationnelle à l'Emploi Individuelle."""
        return FinancingScheme(
            id="poei_001",
            name="POEI - Préparation Opérationnelle à l'Emploi Individuelle",
            financing_type=FinancingType.POLE_EMPLOI_POEI,
            description=(
                "La POEI permet de financer une formation préalable à un recrutement "
                "en CDI ou CDD de plus de 12 mois."
            ),
            eligibility_criteria=[
                "Être demandeur d'emploi",
                "Avoir une promesse d'embauche (CDI ou CDD ≥12 mois)",
                "Formation de 400 heures maximum"
            ],
            excluded_profiles=["Personnes sans promesse d'embauche longue durée"],
            max_amount=None,
            coverage_percentage=100,
            required_documents=[
                "Promesse d'embauche CDI ou CDD ≥12 mois",
                "Convention POEI",
                "Programme de formation"
            ],
            processing_time_days=15,
            deadline_before_training=30,
            application_process=[
                "1. Obtenir une promesse d'embauche (CDI ou CDD ≥12 mois)",
                "2. Définir le programme de formation avec l'employeur",
                "3. Déposer la demande POEI via le conseiller",
                "4. Signature de la convention tripartite"
            ],
            contact_info="3949",
            website="https://www.pole-emploi.fr",
            can_combine_with=[],
            requirements={
                "durée": "Maximum 400 heures",
                "contrat": "CDI ou CDD ≥12 mois"
            },
            additional_benefits=[
                "Financement à 100%",
                "Statut de stagiaire de la formation professionnelle",
                "Emploi durable garanti"
            ]
        )

    def _create_opco_scheme(self) -> FinancingScheme:
        """OPCO - Opérateur de Compétences."""
        return FinancingScheme(
            id="opco_001",
            name="OPCO - Financement par l'Opérateur de Compétences",
            financing_type=FinancingType.OPCO,
            description=(
                "Les OPCO financent les formations des salariés dans le cadre du "
                "plan de développement des compétences de l'entreprise."
            ),
            eligibility_criteria=[
                "Être salarié d'une entreprise",
                "Formation inscrite au plan de développement des compétences",
                "Accord de l'employeur"
            ],
            excluded_profiles=["Demandeurs d'emploi", "Indépendants"],
            max_amount=None,  # Dépend de l'OPCO et de la taille d'entreprise
            coverage_percentage=None,  # Variable selon OPCO
            required_documents=[
                "Convention de formation",
                "Programme détaillé",
                "Demande de prise en charge",
                "Attestation employeur"
            ],
            processing_time_days=30,
            deadline_before_training=45,
            application_process=[
                "1. Discuter du projet de formation avec l'employeur",
                "2. Identifier l'OPCO de l'entreprise",
                "3. Constituer le dossier de demande",
                "4. Déposer la demande auprès de l'OPCO",
                "5. Attendre l'accord de prise en charge"
            ],
            contact_info="Variable selon OPCO",
            website="https://travail-emploi.gouv.fr/opco",
            can_combine_with=[FinancingType.CPF],
            requirements={
                "accord_employeur": "Obligatoire",
                "opco": "Dépend du secteur d'activité de l'entreprise"
            },
            additional_benefits=[
                "Maintien de la rémunération pendant la formation",
                "Formation pendant le temps de travail",
                "Financement total ou partiel selon l'OPCO"
            ]
        )

    def _create_region_scheme(self) -> FinancingScheme:
        """Financement Conseil Régional."""
        return FinancingScheme(
            id="region_001",
            name="Financement Conseil Régional",
            financing_type=FinancingType.REGION,
            description=(
                "Les Conseils Régionaux financent des formations qualifiantes "
                "pour les demandeurs d'emploi et les jeunes."
            ),
            eligibility_criteria=[
                "Être demandeur d'emploi ou jeune de moins de 26 ans",
                "Formation inscrite au programme régional",
                "Domicile dans la région"
            ],
            excluded_profiles=["Salariés en poste"],
            max_amount=None,  # Variable selon région
            coverage_percentage=100,  # Souvent prise en charge totale
            required_documents=[
                "Dossier de candidature",
                "CV et lettre de motivation",
                "Justificatif de situation",
                "Pièce d'identité"
            ],
            processing_time_days=30,
            deadline_before_training=60,
            application_process=[
                "1. Consulter le catalogue de formations régionales",
                "2. Vérifier son éligibilité",
                "3. Candidater auprès de l'organisme de formation",
                "4. Constituer le dossier régional",
                "5. Attendre la validation"
            ],
            contact_info="Variable selon région",
            website="Variable selon région",
            can_combine_with=[
                FinancingType.CPF,
                FinancingType.POLE_EMPLOI_AIF
            ],
            requirements={
                "domiciliation": "Dans la région concernée",
                "catalogue": "Formation doit être dans le programme régional"
            },
            additional_benefits=[
                "Prise en charge totale fréquente",
                "Rémunération possible pendant la formation",
                "Priorité aux publics éloignés de l'emploi"
            ]
        )

    def _create_agefiph_scheme(self) -> FinancingScheme:
        """AGEFIPH - Aide pour personnes handicapées."""
        return FinancingScheme(
            id="agefiph_001",
            name="AGEFIPH - Aide à la formation",
            financing_type=FinancingType.AGEFIPH,
            description=(
                "L'AGEFIPH aide les personnes en situation de handicap à financer "
                "leur formation professionnelle."
            ),
            eligibility_criteria=[
                "Avoir une reconnaissance de travailleur handicapé (RQTH)",
                "Être demandeur d'emploi ou salarié",
                "Formation nécessaire au maintien ou retour à l'emploi"
            ],
            excluded_profiles=["Personnes sans RQTH"],
            max_amount=5000.0,
            coverage_percentage=None,  # Complément d'autres financements
            required_documents=[
                "Reconnaissance RQTH",
                "Devis de formation",
                "Justificatif de situation",
                "Projet professionnel"
            ],
            processing_time_days=21,
            deadline_before_training=45,
            application_process=[
                "1. Vérifier la reconnaissance RQTH",
                "2. Identifier la formation adaptée",
                "3. Mobiliser d'abord CPF et autres financements",
                "4. Faire une demande AGEFIPH en complément",
                "5. Contacter Cap emploi pour accompagnement"
            ],
            contact_info="0800 11 10 09",
            website="https://www.agefiph.fr",
            can_combine_with=[
                FinancingType.CPF,
                FinancingType.POLE_EMPLOI_AIF,
                FinancingType.REGION
            ],
            requirements={
                "rqth": "Obligatoire",
                "complement": "Vient en complément d'autres financements"
            },
            additional_benefits=[
                "Aide au transport",
                "Aides techniques possibles",
                "Accompagnement Cap emploi"
            ]
        )

    def _create_transition_pro_scheme(self) -> FinancingScheme:
        """Transition Pro (ex-Fongecif)."""
        return FinancingScheme(
            id="transitionpro_001",
            name="Transition Pro - Projet de Transition Professionnelle",
            financing_type=FinancingType.TRANSITION_PRO,
            description=(
                "Le Projet de Transition Professionnelle permet aux salariés de financer "
                "une formation certifiante pour changer de métier ou de profession."
            ),
            eligibility_criteria=[
                "Être salarié en CDI avec 24 mois d'ancienneté (dont 12 dans l'entreprise)",
                "Ou être salarié en CDD avec 24 mois d'ancienneté sur 5 ans",
                "Formation certifiante ou diplômante",
                "Projet de reconversion professionnelle"
            ],
            excluded_profiles=["Demandeurs d'emploi"],
            max_amount=None,
            coverage_percentage=100,  # Sous conditions
            required_documents=[
                "Dossier de demande de financement",
                "CV détaillé",
                "Lettre de motivation du projet",
                "Devis et programme de formation",
                "Justificatifs d'ancienneté"
            ],
            processing_time_days=60,
            deadline_before_training=120,  # 4 mois minimum
            application_process=[
                "1. Définir précisément son projet de reconversion",
                "2. Choisir une formation certifiante adaptée",
                "3. Contacter l'Association Transitions Pro de sa région",
                "4. Constituer un dossier complet",
                "5. Présenter son projet devant une commission",
                "6. Demander un congé de formation à l'employeur"
            ],
            contact_info="Variable selon région",
            website="https://www.transitionspro.fr",
            can_combine_with=[FinancingType.CPF],
            requirements={
                "ancienneté": "24 mois minimum",
                "certification": "Formation certifiante obligatoire",
                "délai": "Prévoir 4 à 6 mois avant le début"
            },
            additional_benefits=[
                "Maintien de la rémunération pendant la formation",
                "Protection sociale maintenue",
                "Possibilité de formation longue (jusqu'à 1 an)",
                "Retour dans l'entreprise ou démission à l'issue"
            ]
        )

    def _create_pdc_scheme(self) -> FinancingScheme:
        """PDC - Plan de Développement des Compétences."""
        return FinancingScheme(
            id="pdc_001",
            name="PDC - Plan de Développement des Compétences",
            financing_type=FinancingType.PDC,
            description=(
                "Le Plan de Développement des Compétences regroupe les formations "
                "à l'initiative de l'employeur pour ses salariés."
            ),
            eligibility_criteria=[
                "Être salarié de l'entreprise",
                "Formation décidée par l'employeur",
                "Formation liée à l'activité professionnelle"
            ],
            excluded_profiles=[],
            max_amount=None,
            coverage_percentage=100,
            required_documents=[
                "Aucun (gestion par l'employeur)"
            ],
            processing_time_days=0,
            deadline_before_training=None,
            application_process=[
                "1. L'employeur identifie les besoins en formation",
                "2. Inscription des formations au plan",
                "3. Information des salariés concernés",
                "4. Organisation de la formation"
            ],
            contact_info="Service RH de l'entreprise",
            website=None,
            can_combine_with=[],
            requirements={
                "initiative": "À l'initiative de l'employeur",
                "temps": "Pendant le temps de travail"
            },
            additional_benefits=[
                "Pas de démarche pour le salarié",
                "Maintien intégral de la rémunération",
                "Formation pendant le temps de travail",
                "Prise en charge totale des coûts"
            ]
        )

    def get_all_schemes(self) -> List[FinancingScheme]:
        """Retourne tous les dispositifs de financement."""
        return self.schemes

    def get_scheme_by_type(self, financing_type: FinancingType) -> FinancingScheme:
        """Récupère un dispositif par son type."""
        for scheme in self.schemes:
            if scheme.financing_type == financing_type:
                return scheme
        return None

    def get_schemes_by_profile(self, employment_status: str, **kwargs) -> List[FinancingScheme]:
        """Filtre les dispositifs selon le profil."""
        relevant = []

        for scheme in self.schemes:
            # Logique de filtrage simplifiée
            if employment_status == "demandeur_emploi":
                if scheme.financing_type in [
                    FinancingType.CPF,
                    FinancingType.POLE_EMPLOI_AIF,
                    FinancingType.POLE_EMPLOI_AFPR,
                    FinancingType.POLE_EMPLOI_POEI,
                    FinancingType.REGION
                ]:
                    relevant.append(scheme)
            elif employment_status == "salarie":
                if scheme.financing_type in [
                    FinancingType.CPF,
                    FinancingType.OPCO,
                    FinancingType.TRANSITION_PRO,
                    FinancingType.PDC
                ]:
                    relevant.append(scheme)

            # AGEFIPH pour tous si RQTH
            if kwargs.get('has_handicap_status') and scheme.financing_type == FinancingType.AGEFIPH:
                if scheme not in relevant:
                    relevant.append(scheme)

        return relevant
