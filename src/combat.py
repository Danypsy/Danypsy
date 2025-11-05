"""
Système de combat pour le jeu de rôle Baldur's Gate 2D6
"""
import time


class Combat:
    """Gère les combats entre personnages et ennemis"""

    def __init__(self, personnage, ennemi):
        self.personnage = personnage
        self.ennemi = ennemi
        self.tour = 1

    def demarrer(self):
        """Démarre un combat"""
        print(f"\n{'='*60}")
        print(f"⚔️  COMBAT COMMENCE! ⚔️")
        print(f"{'='*60}")
        print(f"{self.personnage.nom} VS {self.ennemi.nom}")
        print(f"{'='*60}\n")

        while self.personnage.est_vivant and self.ennemi.est_vivant:
            self.tour_de_combat()

        return self.resolution()

    def tour_de_combat(self):
        """Exécute un tour de combat"""
        print(f"\n--- TOUR {self.tour} ---")
        print(f"🧙 {self.personnage.nom}: {self.personnage.pv}/{self.personnage.pv_max} PV")
        print(f"👹 {self.ennemi.nom}: {self.ennemi.pv}/{self.ennemi.pv_max} PV\n")

        # Tour du joueur
        print(f"C'est le tour de {self.personnage.nom}!")
        action = self.choisir_action()

        if action == "1":
            self.personnage.attaquer(self.ennemi)
        elif action == "2" and self.personnage.bonus_magie >= 0:
            self.personnage.lancer_sort(self.ennemi)
        elif action == "3":
            self.utiliser_potion()

        time.sleep(1)

        # Tour de l'ennemi
        if self.ennemi.est_vivant:
            print(f"\nC'est le tour de {self.ennemi.nom}!")
            time.sleep(1)
            self.ennemi.attaquer(self.personnage)

        self.tour += 1
        time.sleep(1.5)

    def choisir_action(self):
        """Permet au joueur de choisir une action"""
        while True:
            print("\nQue voulez-vous faire?")
            print("1. Attaquer au corps-à-corps")
            if self.personnage.bonus_magie >= 0:
                print("2. Lancer un sort")
            print("3. Utiliser une potion")

            choix = input("\nVotre choix: ").strip()

            if choix == "1":
                return "1"
            elif choix == "2" and self.personnage.bonus_magie >= 0:
                return "2"
            elif choix == "3":
                return "3"
            else:
                print("Choix invalide!")

    def utiliser_potion(self):
        """Utilise une potion de soin"""
        import random

        soin = random.randint(3, 8)
        print(f"\n🧪 {self.personnage.nom} utilise une potion de soin!")
        self.personnage.soigner(soin)

    def resolution(self):
        """Résout le combat et distribue les récompenses"""
        print(f"\n{'='*60}")
        print(f"⚔️  FIN DU COMBAT! ⚔️")
        print(f"{'='*60}\n")

        if self.personnage.est_vivant:
            print(f"🎉 Victoire! {self.personnage.nom} a vaincu {self.ennemi.nom}!")
            print(f"\n💰 Récompenses:")
            print(f"  - XP: {self.ennemi.xp_recompense}")
            print(f"  - Or: {self.ennemi.or_recompense}")

            self.personnage.gagner_experience(self.ennemi.xp_recompense)
            self.personnage.gold += self.ennemi.or_recompense

            return True
        else:
            print(f"💀 Défaite! {self.personnage.nom} a été vaincu par {self.ennemi.nom}...")
            print(f"\nGAME OVER")
            return False
