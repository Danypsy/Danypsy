"""
Ennemis de l'univers de Baldur's Gate pour le système 2D6
"""
import random


class Enemy:
    """Classe de base pour les ennemis"""

    def __init__(self, nom, pv, bonus_combat, degats_min, degats_max, xp_recompense, or_recompense):
        self.nom = nom
        self.pv_max = pv
        self.pv = pv
        self.bonus_combat = bonus_combat
        self.degats_min = degats_min
        self.degats_max = degats_max
        self.xp_recompense = xp_recompense
        self.or_recompense = or_recompense
        self.est_vivant = True

    def attaquer(self, cible):
        """Attaque un personnage"""
        from dice import DiceRoller

        dice1, dice2, total, mod, final = DiceRoller.roll_with_modifier(self.bonus_combat)
        print(f"\n{self.nom} attaque {cible.nom}!")
        print(f"🎲 Lancer: [{dice1}] + [{dice2}] = {total} + {mod} = {final}")

        if final >= 10:
            degats = random.randint(self.degats_min + 2, self.degats_max + 2)
            print(f"💥 Coup critique! {degats} dégâts!")
            cible.subir_degats(degats)
            return True
        elif final >= 7:
            degats = random.randint(self.degats_min, self.degats_max)
            print(f"⚔️ Coup réussi! {degats} dégâts!")
            cible.subir_degats(degats)
            return True
        else:
            print(f"❌ Attaque manquée!")
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


# Ennemis de Baldur's Gate
class Gobelin(Enemy):
    def __init__(self):
        super().__init__(
            nom="Gobelin",
            pv=8,
            bonus_combat=0,
            degats_min=1,
            degats_max=4,
            xp_recompense=20,
            or_recompense=10
        )


class Kobold(Enemy):
    def __init__(self):
        super().__init__(
            nom="Kobold",
            pv=6,
            bonus_combat=-1,
            degats_min=1,
            degats_max=3,
            xp_recompense=15,
            or_recompense=8
        )


class Ogre(Enemy):
    def __init__(self):
        super().__init__(
            nom="Ogre",
            pv=20,
            bonus_combat=2,
            degats_min=3,
            degats_max=6,
            xp_recompense=50,
            or_recompense=30
        )


class LoupGeant(Enemy):
    def __init__(self):
        super().__init__(
            nom="Loup Géant",
            pv=12,
            bonus_combat=1,
            degats_min=2,
            degats_max=5,
            xp_recompense=25,
            or_recompense=5
        )


class Squelette(Enemy):
    def __init__(self):
        super().__init__(
            nom="Squelette",
            pv=10,
            bonus_combat=1,
            degats_min=2,
            degats_max=4,
            xp_recompense=30,
            or_recompense=15
        )


class Bandit(Enemy):
    def __init__(self):
        super().__init__(
            nom="Bandit",
            pv=14,
            bonus_combat=1,
            degats_min=2,
            degats_max=5,
            xp_recompense=35,
            or_recompense=25
        )


class AraigneeGeante(Enemy):
    def __init__(self):
        super().__init__(
            nom="Araignée Géante",
            pv=10,
            bonus_combat=0,
            degats_min=1,
            degats_max=4,
            xp_recompense=20,
            or_recompense=8
        )


class OgreMage(Enemy):
    def __init__(self):
        super().__init__(
            nom="Ogre Mage",
            pv=25,
            bonus_combat=2,
            degats_min=4,
            degats_max=8,
            xp_recompense=80,
            or_recompense=50
        )


class DragonNoir(Enemy):
    def __init__(self):
        super().__init__(
            nom="Dragon Noir",
            pv=40,
            bonus_combat=3,
            degats_min=5,
            degats_max=10,
            xp_recompense=200,
            or_recompense=150
        )


class Sarevok(Enemy):
    """Boss final: Sarevok, l'antagoniste de Baldur's Gate"""

    def __init__(self):
        super().__init__(
            nom="Sarevok",
            pv=50,
            bonus_combat=4,
            degats_min=6,
            degats_max=12,
            xp_recompense=300,
            or_recompense=200
        )


def creer_ennemi_aleatoire(niveau_difficulte=1):
    """Crée un ennemi aléatoire adapté au niveau de difficulté"""

    if niveau_difficulte <= 1:
        ennemis = [Kobold, Gobelin, AraigneeGeante]
    elif niveau_difficulte == 2:
        ennemis = [Gobelin, LoupGeant, Squelette, Bandit]
    elif niveau_difficulte == 3:
        ennemis = [Ogre, Bandit, Squelette, LoupGeant]
    elif niveau_difficulte >= 4:
        ennemis = [Ogre, OgreMage, DragonNoir]

    EnnemiClass = random.choice(ennemis)
    return EnnemiClass()
