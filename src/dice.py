"""
Système de dés 2D6 pour le jeu de rôle Baldur's Gate
"""
import random


class DiceRoller:
    """Gère les lancers de dés 2D6"""

    @staticmethod
    def roll_2d6():
        """Lance 2 dés à 6 faces et retourne le résultat"""
        dice1 = random.randint(1, 6)
        dice2 = random.randint(1, 6)
        total = dice1 + dice2
        return dice1, dice2, total

    @staticmethod
    def roll_with_modifier(modifier=0):
        """Lance 2D6 avec un modificateur"""
        dice1, dice2, total = DiceRoller.roll_2d6()
        final_total = total + modifier
        return dice1, dice2, total, modifier, final_total

    @staticmethod
    def check_result(roll, difficulty):
        """
        Vérifie si le lancer réussit contre une difficulté

        Échelle de difficulté 2D6:
        2-6: Échec
        7-9: Succès partiel
        10+: Succès total
        """
        if roll >= difficulty:
            if roll >= 10:
                return "succès_total"
            elif roll >= 7:
                return "succès_partiel"
        return "échec"

    @staticmethod
    def interpret_roll(total):
        """Interprète le résultat d'un lancer 2D6"""
        if total == 2:
            return "Échec critique! 💀"
        elif total <= 6:
            return "Échec"
        elif total <= 9:
            return "Succès partiel ⚔️"
        elif total == 12:
            return "Succès critique! ⭐"
        else:
            return "Succès! ✓"
