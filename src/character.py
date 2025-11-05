"""
Système de personnages pour le jeu de rôle Baldur's Gate 2D6
"""
from dice import DiceRoller


class Character:
    """Classe de base pour les personnages"""

    CLASSES = {
        'guerrier': {
            'pv': 10,
            'bonus_combat': 2,
            'bonus_magie': -1,
            'description': 'Maître des armes et du combat rapproché'
        },
        'mage': {
            'pv': 6,
            'bonus_combat': -1,
            'bonus_magie': 3,
            'description': 'Manipulateur des arcanes et de la magie'
        },
        'roublard': {
            'pv': 8,
            'bonus_combat': 1,
            'bonus_magie': 0,
            'description': 'Expert en discrétion et en ruse'
        },
        'clerc': {
            'pv': 8,
            'bonus_combat': 1,
            'bonus_magie': 2,
            'description': 'Serviteur des dieux, guérisseur et protecteur'
        },
        'rôdeur': {
            'pv': 9,
            'bonus_combat': 2,
            'bonus_magie': 0,
            'description': 'Traqueur et survivant expert'
        }
    }

    RACES = {
        'humain': {
            'bonus': 'Polyvalent: +1 à toutes les actions',
            'modificateur': 1
        },
        'elfe': {
            'bonus': 'Magie: +2 aux actions magiques',
            'modificateur_magie': 2
        },
        'nain': {
            'bonus': 'Résistance: +2 PV supplémentaires',
            'pv_bonus': 2
        },
        'demi-elfe': {
            'bonus': 'Charisme: +1 aux interactions sociales',
            'modificateur_social': 1
        },
        'halfelin': {
            'bonus': 'Discrétion: +2 aux actions furtives',
            'modificateur_furtif': 2
        }
    }

    def __init__(self, nom, classe, race):
        self.nom = nom
        self.classe = classe.lower()
        self.race = race.lower()

        if self.classe not in self.CLASSES:
            raise ValueError(f"Classe invalide: {classe}")
        if self.race not in self.RACES:
            raise ValueError(f"Race invalide: {race}")

        classe_info = self.CLASSES[self.classe]
        race_info = self.RACES[self.race]

        self.pv_max = classe_info['pv'] + race_info.get('pv_bonus', 0)
        self.pv = self.pv_max
        self.bonus_combat = classe_info['bonus_combat']
        self.bonus_magie = classe_info['bonus_magie']

        self.niveau = 1
        self.experience = 0
        self.inventaire = []
        self.gold = 50
        self.est_vivant = True

    def attaquer(self, cible):
        """Effectue une attaque contre une cible"""
        dice1, dice2, total, mod, final = DiceRoller.roll_with_modifier(self.bonus_combat)
        print(f"\n{self.nom} attaque {cible.nom}!")
        print(f"🎲 Lancer: [{dice1}] + [{dice2}] = {total} + {mod} = {final}")

        resultat = DiceRoller.interpret_roll(final)
        print(f"Résultat: {resultat}")

        if final >= 10:
            degats = random.randint(3, 6)
            print(f"💥 Coup puissant! {degats} dégâts!")
            cible.subir_degats(degats)
            return True
        elif final >= 7:
            degats = random.randint(1, 4)
            print(f"⚔️ Coup réussi! {degats} dégâts!")
            cible.subir_degats(degats)
            return True
        else:
            print(f"❌ Attaque manquée!")
            return False

    def lancer_sort(self, cible, nom_sort="Éclair magique"):
        """Lance un sort sur une cible"""
        dice1, dice2, total, mod, final = DiceRoller.roll_with_modifier(self.bonus_magie)
        print(f"\n{self.nom} lance {nom_sort} sur {cible.nom}!")
        print(f"🎲 Lancer: [{dice1}] + [{dice2}] = {total} + {mod} = {final}")

        resultat = DiceRoller.interpret_roll(final)
        print(f"Résultat: {resultat}")

        if final >= 10:
            degats = random.randint(4, 8)
            print(f"✨ Sort puissant! {degats} dégâts magiques!")
            cible.subir_degats(degats)
            return True
        elif final >= 7:
            degats = random.randint(2, 5)
            print(f"🔮 Sort réussi! {degats} dégâts magiques!")
            cible.subir_degats(degats)
            return True
        else:
            print(f"❌ Le sort échoue!")
            return False

    def subir_degats(self, degats):
        """Subit des dégâts"""
        self.pv -= degats
        if self.pv <= 0:
            self.pv = 0
            self.est_vivant = False
            print(f"💀 {self.nom} est vaincu!")
        else:
            print(f"❤️ {self.nom}: {self.pv}/{self.pv_max} PV")

    def soigner(self, montant):
        """Se soigne"""
        ancien_pv = self.pv
        self.pv = min(self.pv + montant, self.pv_max)
        gain = self.pv - ancien_pv
        if gain > 0:
            print(f"💚 {self.nom} récupère {gain} PV! ({self.pv}/{self.pv_max})")
        else:
            print(f"{self.nom} a déjà tous ses PV!")

    def gagner_experience(self, xp):
        """Gagne de l'expérience"""
        self.experience += xp
        print(f"⭐ {self.nom} gagne {xp} XP! (Total: {self.experience} XP)")

        xp_requis = self.niveau * 100
        if self.experience >= xp_requis:
            self.monter_niveau()

    def monter_niveau(self):
        """Monte d'un niveau"""
        self.niveau += 1
        ancien_pv_max = self.pv_max
        self.pv_max += 3
        self.pv = self.pv_max
        print(f"🎉 {self.nom} monte au niveau {self.niveau}!")
        print(f"PV max: {ancien_pv_max} → {self.pv_max}")

    def afficher_stats(self):
        """Affiche les statistiques du personnage"""
        print(f"\n{'='*50}")
        print(f"👤 {self.nom} - {self.race.capitalize()} {self.classe.capitalize()}")
        print(f"{'='*50}")
        print(f"Niveau: {self.niveau} | XP: {self.experience}")
        print(f"PV: {self.pv}/{self.pv_max}")
        print(f"Bonus Combat: {self.bonus_combat:+d} | Bonus Magie: {self.bonus_magie:+d}")
        print(f"Or: {self.gold} pièces")
        print(f"Statut: {'Vivant' if self.est_vivant else 'Mort'}")
        print(f"{'='*50}\n")


import random
