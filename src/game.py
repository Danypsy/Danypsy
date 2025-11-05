"""
Jeu de rôle 2D6 - Baldur's Gate
Système de jeu principal
"""
import random
import time
from character import Character
from enemies import creer_ennemi_aleatoire, Sarevok
from combat import Combat


class Game:
    """Classe principale du jeu"""

    def __init__(self):
        self.personnage = None
        self.chapitre = 1
        self.boss_vaincu = False

    def afficher_titre(self):
        """Affiche le titre du jeu"""
        print("\n" + "="*60)
        print("""
    ╔══════════════════════════════════════════════════════╗
    ║                                                      ║
    ║         BALDUR'S GATE: L'AVENTURE 2D6               ║
    ║                                                      ║
    ║         Un jeu de rôle dans l'univers               ║
    ║         légendaire de Baldur's Gate                 ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
        """)
        print("="*60 + "\n")

    def creation_personnage(self):
        """Crée le personnage du joueur"""
        print("\n🎭 CRÉATION DE PERSONNAGE\n")

        nom = input("Entrez le nom de votre héros: ").strip()
        if not nom:
            nom = "Abdel Adrian"

        print("\n📜 RACES DISPONIBLES:")
        for race, info in Character.RACES.items():
            print(f"  - {race.capitalize()}: {info['bonus']}")

        while True:
            race = input("\nChoisissez votre race: ").strip().lower()
            if race in Character.RACES:
                break
            print("Race invalide!")

        print("\n⚔️ CLASSES DISPONIBLES:")
        for classe, info in Character.CLASSES.items():
            print(f"  - {classe.capitalize()}: {info['description']}")
            print(f"    PV: {info['pv']} | Combat: {info['bonus_combat']:+d} | Magie: {info['bonus_magie']:+d}")

        while True:
            classe = input("\nChoisissez votre classe: ").strip().lower()
            if classe in Character.CLASSES:
                break
            print("Classe invalide!")

        self.personnage = Character(nom, classe, race)

        print("\n✨ Personnage créé avec succès!")
        self.personnage.afficher_stats()

        input("\nAppuyez sur Entrée pour commencer l'aventure...")

    def introduction(self):
        """Affiche l'introduction du jeu"""
        print("\n" + "="*60)
        print("📖 PROLOGUE")
        print("="*60)
        print("""
Vous êtes dans la ville de Porte de Baldur, un carrefour commercial
prospère de la Côte des Épées. Mais la paix est menacée...

Des rumeurs de guerre se répandent, et d'étranges créatures
apparaissent dans les environs. Votre mentor, Gorion, vous a
toujours protégé, mais le temps est venu de découvrir votre
véritable destinée.

Un complot sombre se trame, mené par le mystérieux guerrier
Sarevok. C'est à vous de découvrir la vérité et de sauver
la Côte des Épées!
        """)
        print("="*60)
        input("\nAppuyez sur Entrée pour continuer...")

    def chapitre_1(self):
        """Premier chapitre: Les premières aventures"""
        print("\n" + "="*60)
        print("📖 CHAPITRE 1: Les Routes Dangereuses")
        print("="*60)
        print("""
Vous avez quitté Château-Suif avec Gorion. Sur la route de
Porte de Baldur, vous êtes attaqué par des créatures hostiles!
        """)
        input("\nAppuyez sur Entrée pour continuer...")

        combats_gagnes = 0
        for i in range(3):
            print(f"\n🗺️ Rencontre {i+1}/3")
            ennemi = creer_ennemi_aleatoire(1)
            combat = Combat(self.personnage, ennemi)

            if combat.demarrer():
                combats_gagnes += 1
            else:
                return False

            if i < 2 and self.personnage.est_vivant:
                self.repos_entre_combats()

        print("\n" + "="*60)
        print("✅ CHAPITRE 1 TERMINÉ!")
        print("="*60)
        return True

    def chapitre_2(self):
        """Deuxième chapitre: Exploration"""
        print("\n" + "="*60)
        print("📖 CHAPITRE 2: Les Mines de Nashkel")
        print("="*60)
        print("""
Vous arrivez à Nashkel, une ville minière en proie à d'étranges
problèmes. Les mineurs parlent de créatures dans les profondeurs.
Vous devez enquêter!
        """)
        input("\nAppuyez sur Entrée pour continuer...")

        for i in range(3):
            print(f"\n⛏️ Exploration des mines - Niveau {i+1}/3")
            ennemi = creer_ennemi_aleatoire(2)
            combat = Combat(self.personnage, ennemi)

            if combat.demarrer():
                pass
            else:
                return False

            if i < 2:
                self.repos_entre_combats()

        print("\n" + "="*60)
        print("✅ CHAPITRE 2 TERMINÉ!")
        print("="*60)
        return True

    def chapitre_3(self):
        """Troisième chapitre: Le complot se dévoile"""
        print("\n" + "="*60)
        print("📖 CHAPITRE 3: Le Complot de Sarevok")
        print("="*60)
        print("""
Vos investigations vous ont mené à découvrir un complot visant
à déstabiliser la région. Sarevok, un guerrier mystérieux, semble
être au centre de tout cela. Il est temps de l'affronter!
        """)
        input("\nAppuyez sur Entrée pour continuer...")

        for i in range(2):
            print(f"\n🏰 Les gardes de Sarevok - Vague {i+1}/2")
            ennemi = creer_ennemi_aleatoire(3)
            combat = Combat(self.personnage, ennemi)

            if combat.demarrer():
                pass
            else:
                return False

            if i < 1:
                self.repos_entre_combats()

        return True

    def combat_final(self):
        """Combat final contre Sarevok"""
        print("\n" + "="*60)
        print("⚔️ COMBAT FINAL: SAREVOK")
        print("="*60)
        print("""
Vous vous trouvez face à Sarevok, le fils de Bhaal, dieu du meurtre.
Il vous révèle que vous partagez le même héritage divin...
Seul l'un de vous peut survivre!

Préparez-vous pour le combat de votre vie!
        """)
        input("\nAppuyez sur Entrée pour affronter votre destin...")

        # Soin complet avant le boss
        print("\n✨ Vous prenez un moment pour vous préparer...")
        self.personnage.pv = self.personnage.pv_max
        print(f"💚 PV restaurés au maximum: {self.personnage.pv}/{self.personnage.pv_max}")

        boss = Sarevok()
        combat = Combat(self.personnage, boss)

        if combat.demarrer():
            self.boss_vaincu = True
            return True
        else:
            return False

    def repos_entre_combats(self):
        """Permet au joueur de se reposer"""
        print("\n" + "-"*60)
        choix = input("\nVoulez-vous vous reposer? (o/n): ").strip().lower()
        if choix == 'o':
            soin = random.randint(3, 6)
            self.personnage.soigner(soin)
            print("💤 Vous vous reposez un moment...")
            time.sleep(1)
        print("-"*60)

    def epilogue(self):
        """Affiche l'épilogue du jeu"""
        print("\n" + "="*60)
        print("🏆 ÉPILOGUE")
        print("="*60)
        print("""
Félicitations, héros!

Vous avez vaincu Sarevok et déjoué son complot maléfique.
La Côte des Épées est sauvée grâce à votre courage et votre
détermination.

Mais ce n'est que le début de votre légende...
Votre héritage de Bhaal vous appelle vers de nouvelles aventures.

Votre histoire continuera dans BALDUR'S GATE II...
        """)
        print("="*60)
        print(f"\n⭐ STATISTIQUES FINALES:")
        self.personnage.afficher_stats()

    def demarrer(self):
        """Démarre le jeu"""
        self.afficher_titre()
        self.creation_personnage()
        self.introduction()

        # Déroulement de l'histoire
        if not self.chapitre_1():
            self.game_over()
            return

        if not self.chapitre_2():
            self.game_over()
            return

        if not self.chapitre_3():
            self.game_over()
            return

        if not self.combat_final():
            self.game_over()
            return

        # Victoire!
        self.epilogue()

    def game_over(self):
        """Affiche l'écran de Game Over"""
        print("\n" + "="*60)
        print("💀 GAME OVER 💀")
        print("="*60)
        print(f"""
{self.personnage.nom} est tombé au combat...

Mais votre légende ne s'arrête pas là!
Les héros ne meurent jamais vraiment.

Merci d'avoir joué!
        """)
        print("="*60)


def main():
    """Fonction principale"""
    jeu = Game()
    jeu.demarrer()


if __name__ == "__main__":
    main()
