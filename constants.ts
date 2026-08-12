import { LevelData } from './types';

export const LEVELS: LevelData[] = [
  {
    id: 1,
    title: "Le Verrou Chromatique",
    concept: "Synthèse Additive (RVB)",
    description: "Le système de verrouillage utilise des diodes lumineuses. Une lumière violette est attendue par le capteur.",
    mission: "Modifiez les valeurs R, V, B pour créer du violet (Rouge + Bleu).",
    imageUrl: "https://picsum.photos/id/454/600/400",
    initialCode: `# Le pixel est composé de 3 sous-pixels : Rouge, Vert, Bleu.
# Valeurs de 0 (éteint) à 255 (intensité max).

rouge = 0
vert = 0
bleu = 0

set_color(rouge, vert, bleu)`,
    validationRegex: [
      /(rouge)\s*=\s*(12[0-9]|13[0-5]|255)/, 
      /(vert)\s*=\s*0/,
      /(bleu)\s*=\s*(12[0-9]|13[0-5]|255)/
    ],
    hintPrompt: "Comment faire du violet en lumière ? On mélange du rouge et du bleu.",
    courseContent: {
      title: "Le Pixel et la Couleur",
      body: "Une image numérique est une grille de points appelés **Pixels** (Picture Elements). Sur les écrans, chaque pixel est composé de trois lumières : Rouge, Verte et Bleue (RVB). C'est la **synthèse additive**. En mélangeant ces trois couleurs à différentes intensités (de 0 à 255, soit un octet par canal), on peut créer plus de 16 millions de couleurs.",
      keyPoints: ["Pixel = plus petit élément d'une image", "RVB = Rouge Vert Bleu", "Noir = (0,0,0)", "Blanc = (255,255,255)"]
    }
  },
  {
    id: 2,
    title: "Le Fichier Corrompu",
    concept: "Définition (Taille en pixels)",
    description: "L'ordinateur demande la définition exacte de l'image en mémoire pour débloquer l'accès.",
    mission: "L'image fait 800px de large et 600px de haut. Calculez le nombre total de pixels.",
    imageUrl: "https://picsum.photos/id/532/800/600",
    initialCode: `# Calcul de la définition
largeur = 800
hauteur = 600

# La définition est le nombre total de pixels
# Formule : largeur x hauteur
total_pixels = 0

check_definition(total_pixels)`,
    validationRegex: [
      /total_pixels\s*=\s*(480000|largeur\s*\*\s*hauteur)/
    ],
    hintPrompt: "La définition est simplement la multiplication de la largeur par la hauteur.",
    courseContent: {
      title: "La Définition",
      body: "La **définition** d'une image correspond au nombre total de pixels qui la composent. Elle se calcule en multipliant le nombre de pixels sur la largeur par le nombre de pixels sur la hauteur (ex: 1920 x 1080 = 2 073 600 pixels, soit environ 2 Mégapixels).",
      keyPoints: ["Définition = Largeur x Hauteur", "S'exprime en pixels (px) ou Mégapixels (Mpx)"]
    }
  },
  {
    id: 3,
    title: "L'Imprimante Obsolète",
    concept: "Résolution (PPP / DPI)",
    description: "Vous devez imprimer un badge d'accès. L'image fait 1200 pixels de large. L'imprimante est réglée sur 300 ppp (pixels par pouce).",
    mission: "Calculez la largeur physique de l'image imprimée en pouces.",
    imageUrl: "https://picsum.photos/id/200/600/400",
    initialCode: `# Calcul de la taille d'impression
pixels_largeur = 1200
resolution_ppp = 300  # Points Par Pouce (DPI)

# Quelle sera la largeur en pouces sur le papier ?
largeur_pouces = 0

imprimer(largeur_pouces)`,
    validationRegex: [
      /largeur_pouces\s*=\s*(4|pixels_largeur\s*\/\s*resolution_ppp)/
    ],
    hintPrompt: "Si j'ai 300 points dans un pouce, et que j'ai 1200 points au total, combien de pouces ai-je ?",
    courseContent: {
      title: "La Résolution",
      body: "La **résolution** lie le monde numérique (pixels) au monde physique (cm ou pouces). Elle s'exprime en **PPP** (Points Par Pouce) ou **DPI** (Dots Per Inch). C'est la densité de pixels. Plus la résolution est élevée, plus l'impression est fine.",
      keyPoints: ["Résolution = Densité de pixels", "Unité : PPP ou DPI", "Taille réelle = Taille en pixels / Résolution"]
    }
  },
  {
    id: 4,
    title: "Le Message Fantôme",
    concept: "Canaux & Filtrage",
    description: "Un mot de passe est caché dans cette image bruitée. Il est inscrit uniquement sur le canal ROUGE, mais le bruit vert et bleu le rend illisible.",
    mission: "Mettez les composantes VERTE et BLEUE à 0 pour isoler le message rouge.",
    imageUrl: "", // Généré dynamiquement
    initialCode: `# Filtrage des canaux
# Pour chaque pixel, on garde le Rouge, 
# mais on supprime le Vert et le Bleu (mettre à 0).

def nettoyer_bruit(pixel):
    pixel.red = pixel.red      # On garde le rouge
    pixel.green = 255          # TODO: Mettre à 0
    pixel.blue = 255           # TODO: Mettre à 0`,
    validationRegex: [
      /pixel\.green\s*=\s*0/,
      /pixel\.blue\s*=\s*0/
    ],
    hintPrompt: "Si le message est caché dans le rouge, le vert et le bleu sont des parasites. Il faut les éteindre (valeur 0).",
    courseContent: {
      title: "Les Canaux RVB",
      body: "Une image couleur est la superposition de 3 couches (ou canaux) : Rouge, Vert, Bleu. En programmation, on peut manipuler ces canaux indépendamment. Par exemple, mettre le canal Vert et Bleu à 0 permet de ne voir que la composante Rouge de l'image, agissant comme un filtre optique rouge.",
      keyPoints: ["Image = Superposition de 3 couches", "Filtrage = Modifier un canal spécifique", "Supprimer une couleur = Mettre sa valeur à 0"]
    }
  },
  {
    id: 5,
    title: "Le Négatif Caché",
    concept: "Traitement : Inversion",
    description: "Un message est caché sur un négatif numérique. Il faut inverser les couleurs pour le lire.",
    mission: "Complétez la boucle pour inverser chaque canal (255 - valeur).",
    imageUrl: "https://picsum.photos/id/870/600/400?grayscale",
    initialCode: `# Inversion des couleurs (Négatif)
def inverser(pixel):
    # Valeur max est 255.
    # Blanc (255) devient Noir (0).
    
    pixel.red = 0    # TODO: 255 - pixel.red
    pixel.green = 0  # TODO: 255 - pixel.green
    pixel.blue = 0   # TODO: 255 - pixel.blue`,
    validationRegex: [
      /pixel\.red\s*=\s*255\s*-\s*pixel\.red/,
      /pixel\.green\s*=\s*255\s*-\s*pixel\.green/,
      /pixel\.blue\s*=\s*255\s*-\s*pixel\.blue/
    ],
    hintPrompt: "Pour inverser une valeur sur 8 bits (0-255), on fait l'opération : 255 moins la valeur actuelle.",
    courseContent: {
      title: "Algorithmes de Traitement",
      body: "On peut modifier une image en appliquant un **algorithme** (une suite d'instructions) à chaque pixel. Pour obtenir le négatif d'une image, on inverse l'intensité de chaque composante RVB.",
      keyPoints: ["Algorithme = Traitement automatique", "Boucle = Répéter l'action sur chaque pixel", "Négatif = 255 - valeur"]
    }
  },
  {
    id: 6,
    title: "Vision Binaire",
    concept: "Seuillage (Noir & Blanc)",
    description: "Le capteur de sécurité ne détecte que le contraste extrême. Transformez l'image en pur Noir et Blanc (pas de gris).",
    mission: "Si la moyenne RVB est inférieure à 128 (seuil), mettez le pixel à 0 (noir), sinon à 255 (blanc).",
    imageUrl: "https://picsum.photos/id/1011/600/400",
    initialCode: `# Seuillage (Binarisation)
seuil = 128

for pixel in image:
    moyenne = (pixel.red + pixel.green + pixel.blue) / 3
    
    # TODO: Appliquer le seuil
    if moyenne < seuil:
        couleur = 128 # Changer ceci en 0 (Noir)
    else:
        couleur = 128 # Changer ceci en 255 (Blanc)
        
    pixel.set_all(couleur)`,
    validationRegex: [
      /couleur\s*=\s*0/,
      /couleur\s*=\s*255/
    ],
    hintPrompt: "C'est une condition Si/Sinon. Si c'est sombre (< seuil), ça devient noir (0). Sinon blanc (255).",
    courseContent: {
      title: "Seuillage et Profondeur",
      body: "Le **seuillage** permet de simplifier une image en ne gardant que deux couleurs (souvent noir et blanc). On perd de l'information (la nuance de gris) pour ne garder que la forme. Cela réduit drastiquement la taille du fichier (1 bit par pixel au lieu de 24 bits).",
      keyPoints: ["Binarisation = 2 couleurs", "Seuil = Limite de basculement", "Réduction de poids"]
    }
  },
  {
    id: 7,
    title: "Le Puzzle Matriciel",
    concept: "Reconstruction d'Image",
    description: "L'image du code final est mélangée. C'est un taquin 4x4 (16 cases).",
    mission: "Résolvez le taquin pour lire le mot de passe, puis entrez-le dans la variable.",
    imageUrl: "",
    initialCode: `# Authentification Finale
# Résolvez le puzzle visuel à droite.
# Entrez le mot qui apparaît.

mot_de_passe = "???"

login(mot_de_passe)`,
    validationRegex: [
      /mot_de_passe\s*=\s*["']SNT2025["']/i
    ],
    hintPrompt: "Résous le puzzle. Le mot est composé de lettres et chiffres liés à la matière.",
    courseContent: {
      title: "Matrice de Pixels",
      body: "Une image est stockée en mémoire sous forme de **matrice** (un tableau à deux dimensions : lignes et colonnes). Chaque case du tableau contient les valeurs RVB du pixel. Si on mélange les indices de la matrice, l'image devient illisible.",
      keyPoints: ["Image = Tableau 2D", "Coordonnées (x, y)", "Ordre des données crucial"]
    }
  }
];