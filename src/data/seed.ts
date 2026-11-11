import type { BadgeDef, Chapter, MindBranch, Profile, Quest, Sheet, Slot, Subject } from "@/lib/types";
import { EXTRA_QUESTIONS, EXTRA_SHEETS, EXTRA_SUBJECTS } from "@/data/extra-subjects";

export const PROFILE_IDS = { jana: "p-jana", leo: "p-leo" } as const;

export const BADGES: BadgeDef[] = [
  { id: "premier-pas", title: "Premier pas", description: "Terminer son premier quiz", icon: "sparkles" },
  { id: "sans-faute", title: "Sans faute", description: "Un quiz 100 % réussi", icon: "trophy" },
  { id: "serie-3", title: "Série de 3", description: "3 quiz d'affilée à 80 % ou plus", icon: "flame" },
  { id: "exploratrice", title: "Exploratrice", description: "Travailler 4 matières différentes", icon: "compass" },
  { id: "plume", title: "Plume d'or", description: "Écrire une histoire", icon: "feather" },
  { id: "artiste", title: "Artiste", description: "Créer un dessin dans l'atelier", icon: "palette" },
  { id: "quete-1", title: "Aventurière", description: "Terminer une quête", icon: "star" },
  { id: "niveau-3", title: "Apprentie confirmée", description: "Atteindre le niveau 3", icon: "crown" },
];

export const SUBJECTS: Subject[] = [
  {
    id: "maths",
    name: "Mathématiques",
    magic_name: "Arithmomancie",
    icon: "calculator",
    color: "#8B5CF6",
    order: 1,
    chapters: [
      { id: "maths-fractions", title: "Fractions", description: "Additionner, simplifier, comparer les fractions" },
      { id: "maths-relatifs", title: "Nombres relatifs", description: "Addition et soustraction de nombres négatifs" },
      { id: "maths-proportion", title: "Proportionnalité", description: "Pourcentages, échelles et tableaux" },
      { id: "maths-triangles", title: "Triangles et symétrie", description: "Construction, propriétés et axe de symétrie" },
      { id: "maths-aires", title: "Périmètres et aires", description: "Calculer le tour et la surface des figures" },
    ],
  },
  {
    id: "francais",
    name: "Français",
    magic_name: "Langue des runes",
    icon: "feather",
    color: "#EC4899",
    order: 2,
    chapters: [
      { id: "francais-passe-simple", title: "Le passé simple", description: "Conjuguer et reconnaître le passé simple" },
      { id: "francais-figures", title: "Figures de style", description: "Comparaison, métaphore, personnification" },
      { id: "francais-recits", title: "Récits d'aventure", description: "Analyser un récit d'aventure" },
      { id: "francais-conjugaison", title: "Imparfait et passé composé", description: "Choisir le bon temps du récit" },
      { id: "francais-grammaire", title: "Classes grammaticales", description: "Nom, verbe, adjectif, adverbe…" },
    ],
  },
  {
    id: "histoire",
    name: "Histoire-Géo",
    magic_name: "Chronomancie",
    icon: "landmark",
    color: "#F59E0B",
    order: 3,
    chapters: [
      { id: "histoire-féodalité", title: "Féodalité et seigneurs", description: "Vassaux, suzerains et châteaux forts" },
      { id: "histoire-islam", title: "Naissance de l'islam", description: "Mahomet et l'empire musulman" },
      { id: "histoire-climat", title: "Changements climatiques", description: "Répartition de la population et climat" },
      { id: "histoire-villes", title: "Villes et commerce", description: "Bourgs, foires et réseaux marchands" },
      { id: "histoire-revolutions", title: "Révolutions et empires", description: "Révolutions modernes et empires coloniaux" },
    ],
  },
  {
    id: "anglais",
    name: "Anglais",
    magic_name: "Langue des brumes",
    icon: "languages",
    color: "#06B6D4",
    order: 4,
    chapters: [
      { id: "anglais-present", title: "Présent simple", description: "Le présent simple et les adverbes de fréquence" },
      { id: "anglais-questions", title: "Poser des questions", description: "Question words et auxiliaires" },
      { id: "anglais-irregular", title: "Verbes irréguliers", description: "Les 20 verbes irréguliers les plus utiles" },
      { id: "anglais-prétérit", title: "Le prétérit", description: "Raconter au passé en anglais" },
      { id: "anglais-vie", title: "Ma vie quotidienne", description: "School, hobbies et daily routine" },
    ],
  },
  {
    id: "svt",
    name: "SVT",
    magic_name: "Potions et plantes",
    icon: "flask",
    color: "#10B981",
    order: 5,
    chapters: [
      { id: "svt-cellule", title: "La cellule", description: "Cellule végétale et cellule animale" },
      { id: "svt-alimentation", title: "Alimentation et digestion", description: "Besoins nutritionnels et appareil digestif" },
      { id: "svt-respiration", title: "Respiration et circulation", description: "Comment l'oxygène arrive aux organes" },
      { id: "svt-plantes", title: "Les plantes", description: "Photosynthèse, floraison et reproduction" },
      { id: "svt-roches", title: "La Terre et les roches", description: "Séismes, volcans et plaques tectoniques" },
    ],
  },
  {
    id: "arts",
    name: "Arts plastiques",
    magic_name: "Illusionmine",
    icon: "palette",
    color: "#FB923C",
    order: 6,
    chapters: [
      { id: "arts-couleurs", title: "Couleurs et contrastes", description: "Cercle chromatique et mélanges" },
      { id: "arts-perspective", title: "La perspective", description: "Donner une impression de profondeur" },
      { id: "arts-volume", title: "Modeler en volume", description: "Assemblage, sculpture et maquette" },
    ],
  },
  ...EXTRA_SUBJECTS,
];

// ---------------------------------------------------------------------------
// Banque de questions : sert au « générateur » local de quiz.
// ---------------------------------------------------------------------------
type Seed = { q: string; options: string[]; answer: string; why: string };

export const QUESTION_BANK: Record<string, Seed[]> = {
  "maths-fractions": [
    { q: "Combien font 1/4 + 1/4 ?", options: ["2/8", "1/2", "1/8", "2/4 + 1/4"], answer: "1/2", why: "On additionne les numérateurs quand les dénominateurs sont égaux : 2/4 = 1/2." },
    { q: "Quelle fraction est égale à 0,5 ?", options: ["1/5", "1/2", "2/5", "5/1"], answer: "1/2", why: "1 divisé par 2 donne 0,5." },
    { q: "Comment simplifie-t-on 6/8 ?", options: ["3/4", "2/3", "1/2", "6/4"], answer: "3/4", why: "On divise le haut et le bas par 2 : 6÷2=3 et 8÷2=4." },
    { q: "Quelle fraction est la plus grande ?", options: ["3/5", "1/2", "2/7", "4/9"], answer: "3/5", why: "3/5 = 0,6 ; c'est plus que 0,5, 0,29 et 0,44." },
    { q: "Combien font 3/4 − 1/4 ?", options: ["2/4", "4/8", "1/4", "2/8"], answer: "2/4", why: "3 − 1 = 2, on garde le dénominateur 4. 2/4 = 1/2." },
    { q: "Un gâteau coupé en 8 parts : tu en manges 2. Quelle fraction reste ?", options: ["6/8", "2/8", "1/8", "8/6"], answer: "6/8", why: "8 − 2 = 6 parts restantes sur 8." },
    { q: "Combien font 1/3 + 1/6 ?", options: ["1/2", "2/9", "1/9", "2/6"], answer: "1/2", why: "1/3 = 2/6, donc 2/6 + 1/6 = 3/6 = 1/2." },
    { q: "Quelle écriture décimale correspond à 7/10 ?", options: ["0,7", "7,0", "0,07", "1,7"], answer: "0,7", why: "7 divisé par 10 donne 0,7." },
  ],
  "maths-relatifs": [
    { q: "Combien font (−3) + 5 ?", options: ["2", "−2", "8", "−8"], answer: "2", why: "On part de −3 et on avance de 5 : on arrive à 2." },
    { q: "Combien font (−4) − (−6) ?", options: ["2", "−10", "−2", "10"], answer: "2", why: "Soustraire un négatif revient à ajouter : −4 + 6 = 2." },
    { q: "Quel nombre est le plus petit ?", options: ["−7", "−2", "0", "3"], answer: "−7", why: "Sur la droite graduée, −7 est le plus à gauche." },
    { q: "Combien font (−5) + (−3) ?", options: ["−8", "8", "−2", "2"], answer: "−8", why: "Deux nombres négatifs s'additionnent en gardant le signe −." },
    { q: "Combien font (−2) × 3 ?", options: ["−6", "6", "−5", "5"], answer: "−6", why: "Un négatif fois un positif donne un négatif." },
    { q: "L'opposé de −9 est…", options: ["9", "−9", "0", "1/9"], answer: "9", why: "L'opposé a la même distance à zéro, avec le signe contraire." },
  ],
  "maths-proportion": [
    { q: "Combien font 20 % de 150 ?", options: ["30", "15", "20", "75"], answer: "30", why: "10 % de 150 = 15, donc 20 % = 30." },
    { q: "Si 3 stylos coûtent 6 €, combien coûtent 5 stylos ?", options: ["10 €", "8 €", "12 €", "9 €"], answer: "10 €", why: "1 stylo coûte 2 €, donc 5 × 2 = 10 €." },
    { q: "Un article de 80 € est soldé à −25 %. Quel est le prix ?", options: ["60 €", "55 €", "65 €", "75 €"], answer: "60 €", why: "25 % de 80 = 20, donc 80 − 20 = 60 €." },
    { q: "Sur un plan au 1/100, 3 cm représentent…", options: ["3 m", "30 cm", "300 m", "3 cm"], answer: "3 m", why: "1 cm sur le plan = 100 cm réels, soit 3 m pour 3 cm." },
    { q: "Quel tableau est proportionnel ?", options: ["2→6 et 5→15", "2→5 et 4→9", "1→3 et 3→8", "4→10 et 6→14"], answer: "2→6 et 5→15", why: "Le coefficient est 3 dans les deux colonnes." },
  ],
  "francais-passe-simple": [
    { q: "« Il ___ un trésor. » (trouver, passé simple)", options: ["trouva", "trouvait", "trouvera", "trouve"], answer: "trouva", why: "Le passé simple du 1er groupe à la 3e personne du singulier : trouva." },
    { q: "« Nous ___ au château. » (aller, passé simple)", options: ["allâmes", "allions", "allons", "irons"], answer: "allâmes", why: "Aller au passé simple : j'allai, tu allas, il alla, nous allâmes." },
    { q: "Quel temps exprime une action courte et terminée du passé ?", options: ["Le passé simple", "L'imparfait", "Le futur", "Le présent"], answer: "Le passé simple", why: "Le passé simple raconte l'action de premier plan ; l'imparfait décrit le décor." },
    { q: "« Ils ___ la porte. » (ouvrir, passé simple)", options: ["ouvrirent", "ouvraient", "ouvriront", "ouvrent"], answer: "ouvrirent", why: "Ouvrir au passé simple : ils ouvrirent." },
    { q: "« Je ___ mon grimoire. » (lire, passé simple)", options: ["lus", "lisais", "lirai", "lis"], answer: "lus", why: "Lire au passé simple : je lus, tu lus, il lut." },
  ],
  "francais-figures": [
    { q: "« Ses yeux sont deux étoiles » est une…", options: ["Métaphore", "Comparaison", "Personnification", "Hyperbole"], answer: "Métaphore", why: "Il n'y a pas d'outil de comparaison (« comme ») : c'est une métaphore." },
    { q: "« Le vent murmure » est une…", options: ["Personnification", "Métaphore", "Antithèse", "Litote"], answer: "Personnification", why: "On prête une action humaine à un élément naturel." },
    { q: "« Il est fort comme un bœuf » est une…", options: ["Comparaison", "Métaphore", "Hyperbole", "Métonymie"], answer: "Comparaison", why: "L'outil « comme » introduit une comparaison." },
    { q: "« Je meurs de faim » est une…", options: ["Hyperbole", "Litote", "Personnification", "Comparaison"], answer: "Hyperbole", why: "L'exagération volontaire est une hyperbole." },
    { q: "« Va, je ne te hais point » est une…", options: ["Litote", "Hyperbole", "Métaphore", "Antithèse"], answer: "Litote", why: "On dit moins pour suggérer plus : elle l'aime." },
  ],
  "francais-recits": [
    { q: "Quel est le rôle du héros dans un récit d'aventure ?", options: ["Affronter des obstacles", "Décrire le paysage", "Compter les chapitres", "Écrire la morale"], answer: "Affronter des obstacles", why: "Le héros avance grâce aux épreuves qu'il surmonte." },
    { q: "Le schéma narratif commence par…", options: ["La situation initiale", "Le dénouement", "Les péripéties", "L'élément perturbateur"], answer: "La situation initiale", why: "Ordre : situation initiale, élément perturbateur, péripéties, dénouement." },
    { q: "Un récit est raconté à la première personne quand…", options: ["Le narrateur dit « je »", "Le narrateur dit « il »", "Il n'y a pas de narrateur", "Le héros est absent"], answer: "Le narrateur dit « je »", why: "« Je » signale un narrateur interne." },
    { q: "L'élément perturbateur sert à…", options: ["Lancer l'action", "Terminer l'histoire", "Décrire le héros", "Donner la date"], answer: "Lancer l'action", why: "Il brise l'équilibre de la situation initiale." },
  ],
  "histoire-féodalité": [
    { q: "Au Moyen Âge, le seigneur qui protège le vassal est son…", options: ["Suzerain", "Serf", "Écuyer", "Abbé"], answer: "Suzerain", why: "Le vassal prête hommage à son suzerain qui lui donne une terre (le fief)." },
    { q: "Le château fort sert d'abord à…", options: ["Protéger et surveiller", "Stocker le blé uniquement", "Accueillir les marchés", "Élever les enfants"], answer: "Protéger et surveiller", why: "Donjon, remparts et fossés servent à la défense." },
    { q: "Un paysan non libre attaché à la terre est un…", options: ["Serf", "Vassal", "Chevalier", "Bourgeois"], answer: "Serf", why: "Le serf est soumis à la seigneurie, contrairement au vilain libre." },
    { q: "La cérémonie où le vassal jure fidélité s'appelle…", options: ["L'hommage", "Le sacre", "La joute", "La foire"], answer: "L'hommage", why: "L'hommage lie vassal et seigneur." },
  ],
  "histoire-islam": [
    { q: "Qui fonde l'islam au VIIe siècle ?", options: ["Mahomet", "Charlemagne", "Justinien", "Clovis"], answer: "Mahomet", why: "Mahomet prêche à La Mecque puis s'installe à Médine en 622." },
    { q: "Le livre sacré de l'islam est…", options: ["Le Coran", "La Bible", "La Torah", "Les Évangiles"], answer: "Le Coran", why: "Le Coran rassemble les révélations reçues par Mahomet." },
    { q: "La ville sainte vers laquelle prient les musulmans est…", options: ["La Mecque", "Bagdad", "Damas", "Cordoue"], answer: "La Mecque", why: "La Mecque abrite la Kaaba." },
    { q: "En 622, Mahomet quitte La Mecque pour…", options: ["Médine", "Rome", "Jérusalem", "Constantinople"], answer: "Médine", why: "Cette migration, l'Hégire, marque le début du calendrier musulman." },
  ],
  "histoire-climat": [
    { q: "La majorité de la population mondiale vit…", options: ["Près des littoraux et des plaines", "Dans les déserts", "En haute montagne", "Sur les banquises"], answer: "Près des littoraux et des plaines", why: "Eau, sols fertiles et climat doux attirent les habitants." },
    { q: "Un désert est une zone…", options: ["Très sèche", "Très humide", "Toujours froide", "Sans relief"], answer: "Très sèche", why: "Les précipitations y sont très faibles." },
    { q: "Le changement climatique provoque notamment…", options: ["La montée des océans", "La baisse du niveau des mers", "Moins de sécheresses", "La disparition des saisons"], answer: "La montée des océans", why: "La fonte des glaces et la dilatation de l'eau élèvent le niveau des mers." },
  ],
  "anglais-present": [
    { q: "« She ___ to school every day. »", options: ["goes", "go", "going", "gone"], answer: "goes", why: "Au présent simple, la 3e personne du singulier prend un -s." },
    { q: "Quel adverbe signifie « souvent » ?", options: ["often", "never", "always", "sometimes"], answer: "often", why: "often = souvent." },
    { q: "« I ___ football on Sundays. »", options: ["play", "plays", "playing", "played"], answer: "play", why: "Avec I, pas de -s au présent simple." },
    { q: "Où se place « always » ?", options: ["Avant le verbe", "Après le complément", "En fin de phrase", "Jamais dans la phrase"], answer: "Avant le verbe", why: "Les adverbes de fréquence se placent avant le verbe principal." },
  ],
  "anglais-questions": [
    { q: "« ___ are you? » (demander l'âge… non : comment vas-tu ?)", options: ["How", "What", "Who", "When"], answer: "How", why: "How are you? = Comment vas-tu ?" },
    { q: "« ___ old are you? »", options: ["How", "What", "Which", "Where"], answer: "How", why: "L'expression est How old are you?" },
    { q: "Pour poser une question au présent simple, on utilise…", options: ["do / does", "be only", "have", "will"], answer: "do / does", why: "Do you like…? / Does she like…?" },
    { q: "« ___ is your favourite colour? »", options: ["What", "Who", "When", "Why"], answer: "What", why: "What demande une chose." },
  ],
  "anglais-irregular": [
    { q: "Prétérit de « go »", options: ["went", "goed", "gone", "going"], answer: "went", why: "go – went – gone." },
    { q: "Prétérit de « see »", options: ["saw", "seed", "seen", "sawed"], answer: "saw", why: "see – saw – seen." },
    { q: "Participe passé de « eat »", options: ["eaten", "ate", "eated", "eating"], answer: "eaten", why: "eat – ate – eaten." },
    { q: "Prétérit de « take »", options: ["took", "taked", "taken", "tooken"], answer: "took", why: "take – took – taken." },
  ],
  "svt-cellule": [
    { q: "Quel élément n'existe que dans la cellule végétale ?", options: ["La paroi et les chloroplastes", "Le noyau", "La membrane", "Le cytoplasme"], answer: "La paroi et les chloroplastes", why: "La paroi rigide et les chloroplastes sont propres aux végétaux." },
    { q: "La cellule est…", options: ["L'unité de base du vivant", "Un organe", "Un tissu", "Une molécule"], answer: "L'unité de base du vivant", why: "Tous les êtres vivants sont faits de cellules." },
    { q: "Le noyau contient…", options: ["L'information génétique", "L'eau uniquement", "Les déchets", "Le sucre"], answer: "L'information génétique", why: "L'ADN est dans le noyau." },
  ],
  "svt-alimentation": [
    { q: "Les aliments énergétiques sont surtout…", options: ["Les féculents et les lipides", "L'eau", "Les vitamines", "Les fibres"], answer: "Les féculents et les lipides", why: "Ils fournissent l'énergie au corps." },
    { q: "Les aliments bâtisseurs apportent…", options: ["Des protéines", "Du sucre", "De l'eau", "Des fibres"], answer: "Des protéines", why: "Les protéines construisent muscles et os." },
    { q: "Le petit-déjeuner idéal contient…", options: ["Un produit céréalier, un laitier et un fruit", "Un soda et des bonbons", "Uniquement du café", "Que du pain"], answer: "Un produit céréalier, un laitier et un fruit", why: "Il doit apporter énergie, calcium et vitamines." },
  ],
  "arts-couleurs": [
    { q: "Laquelle est une couleur primaire ?", options: ["Rouge", "Vert", "Orange", "Violet"], answer: "Rouge", why: "Les primaires sont le rouge, le bleu et le jaune." },
    { q: "Bleu + jaune donne…", options: ["Vert", "Violet", "Orange", "Marron"], answer: "Vert", why: "Mélange de deux primaires : une secondaire." },
    { q: "Les couleurs complémentaires sont…", options: ["Opposées sur le cercle chromatique", "Toujours identiques", "Toujours sombres", "Les primaires entre elles"], answer: "Opposées sur le cercle chromatique", why: "Leur contraste est maximal (rouge/vert, bleu/orange)." },
  ],
  "arts-perspective": [
    { q: "En perspective, les lignes parallèles se rejoignent…", options: ["Au point de fuite", "Au centre du dessin", "En haut de la feuille", "Nulle part"], answer: "Au point de fuite", why: "C'est ce qui crée la profondeur." },
    { q: "Plus un objet est loin, plus il paraît…", options: ["Petit", "Grand", "Net", "Coloré"], answer: "Petit", why: "La taille apparente diminue avec la distance." },
  ],
  // --- chapitres ajoutés (programme de 5e) ---
  "maths-triangles": [
    { q: "La somme des angles d'un triangle vaut…", options: ["180°", "90°", "360°", "100°"], answer: "180°", why: "Quel que soit le triangle, la somme des trois angles fait 180°." },
    { q: "Un triangle avec trois côtés égaux est…", options: ["Équilatéral", "Isocèle", "Rectangle", "Quelconque"], answer: "Équilatéral", why: "Équilatéral = 3 côtés égaux ; isocèle = 2." },
    { q: "Une médiatrice passe par…", options: ["Le milieu d'un côté, perpendiculairement", "Un sommet et le milieu opposé", "Le centre du cercle inscrit seulement", "Les trois côtés en diagonale"], answer: "Le milieu d'un côté, perpendiculairement", why: "C'est la perpendiculaire au milieu du côté." },
    { q: "Une figure a un axe de symétrie quand…", options: ["Le pliage superpose les deux moitiés", "Elle a des angles droits", "Elle est colorée", "Ses côtés sont parallèles"], answer: "Le pliage superpose les deux moitiés", why: "La symétrie axiale est un pliage qui superpose exactement." },
  ],
  "maths-aires": [
    { q: "L'aire d'un rectangle de 5 cm sur 3 cm est…", options: ["15 cm²", "8 cm²", "16 cm²", "30 cm²"], answer: "15 cm²", why: "Aire = longueur × largeur = 15 cm²." },
    { q: "Le périmètre d'un carré de 4 cm de côté :", options: ["16 cm", "8 cm", "16 cm²", "4 cm"], answer: "16 cm", why: "4 côtés × 4 cm = 16 cm (une longueur, pas une aire)." },
    { q: "L'aire d'un triangle se calcule par…", options: ["(base × hauteur) / 2", "base + hauteur", "côté × côté", "2 × base"], answer: "(base × hauteur) / 2", why: "Le triangle est la moitié d'un rectangle." },
    { q: "1 m² est égal à…", options: ["10 000 cm²", "100 cm²", "1 000 cm²", "100 m²"], answer: "10 000 cm²", why: "1 m = 100 cm, donc 100 × 100 = 10 000 cm²." },
  ],
  "francais-conjugaison": [
    { q: "« Il ___ quand je suis arrivé. » (dormir, imparfait)", options: ["dormait", "dormit", "dormira", "dort"], answer: "dormait", why: "L'imparfait décrit l'action en cours, le décor." },
    { q: "« J'___ mes devoirs. » (finir, passé composé)", options: ["ai fini", "suis fini", "avais fini", "finissais"], answer: "ai fini", why: "Passé composé = avoir au présent + participe passé." },
    { q: "Le passé composé se forme avec…", options: ["Avoir ou être + participe passé", "L'imparfait + infinitif", "Le présent + -s", "Être + infinitif"], answer: "Avoir ou être + participe passé", why: "Ex. : j'ai mangé / je suis parti." },
    { q: "Quel temps pour le décor dans un récit au passé ?", options: ["L'imparfait", "Le passé simple", "Le futur", "Le présent"], answer: "L'imparfait", why: "Imparfait = décor ; passé simple = actions." },
  ],
  "francais-grammaire": [
    { q: "Dans « le chat noir dort », « noir » est un…", options: ["Adjectif", "Adverbe", "Nom", "Verbe"], answer: "Adjectif", why: "Il qualifie le nom « chat »." },
    { q: "« Rapidement » est un…", options: ["Adverbe", "Adjectif", "Pronom", "Déterminant"], answer: "Adverbe", why: "Les adverbes en -ment sont invariables." },
    { q: "Dans « Elle lit un livre », « Elle » est…", options: ["Un pronom", "Un déterminant", "Un nom", "Un adjectif"], answer: "Un pronom", why: "Il remplace un nom (sujet)." },
    { q: "Un déterminant sert à…", options: ["Introduire le nom", "Remplacer le verbe", "Qualifier l'adverbe", "Relier deux phrases"], answer: "Introduire le nom", why: "Le, la, les, un, mon… introduisent le nom." },
  ],
  "histoire-villes": [
    { q: "Au Moyen Âge, les marchands se retrouvent…", options: ["Sur les foires et les marchés", "Dans les monastères", "Dans les châteaux forts", "Sur les champs"], answer: "Sur les foires et les marchés", why: "Les foires de Champagne sont célèbres." },
    { q: "Un bourg est…", options: ["Un village qui grandit grâce au commerce", "Un château royal", "Un champ de blé", "Une abbaye"], answer: "Un village qui grandit grâce au commerce", why: "Artisans et marchands s'y installent." },
    { q: "Les habitants des villes obtiennent des…", options: ["Chartes de franchises", "Titres de noblesse", "Terres seigneuriales", "Fiefs"], answer: "Chartes de franchises", why: "Elles limitent le pouvoir du seigneur." },
  ],
  "histoire-revolutions": [
    { q: "La Révolution française commence en…", options: ["1789", "1515", "1492", "1815"], answer: "1789", why: "La prise de la Bastille a lieu le 14 juillet 1789." },
    { q: "L'esclavage est définitivement aboli en France en…", options: ["1848", "1789", "1799", "1815"], answer: "1848", why: "Grâce à Victor Schœlcher." },
    { q: "La colonisation consiste à…", options: ["Dominer et exploiter un territoire lointain", "Échanger des idées", "Protéger une réserve", "Construire des routes"], answer: "Dominer et exploiter un territoire lointain", why: "Colonies de peuplement ou d'exploitation." },
  ],
  "anglais-prétérit": [
    { q: "« I ___ to London last year. »", options: ["went", "go", "gone", "am going"], answer: "went", why: "Prétérit de go : went." },
    { q: "Prétérit régulier de « play » :", options: ["played", "plaid", "playd", "playing"], answer: "played", why: "Les verbes réguliers prennent -ed." },
    { q: "« They ___ football yesterday. »", options: ["played", "play", "have played", "playing"], answer: "played", why: "Le prétérit s'emploie avec un marqueur de temps passé." },
    { q: "Forme interrogative au prétérit :", options: ["Did you go?", "Do you went?", "You went did?", "Are you went?"], answer: "Did you go?", why: "Did + base verbale." },
  ],
  "anglais-vie": [
    { q: "« I go to school ___ Monday. »", options: ["on", "in", "at", "to"], answer: "on", why: "On s'utilise avec les jours." },
    { q: "« What is your favourite hobby? » demande…", options: ["Ton passe-temps préféré", "Ton adresse", "Ton âge", "Ta classe"], answer: "Ton passe-temps préféré", why: "Hobby = loisir." },
    { q: "« I have breakfast at 7 am » signifie…", options: ["Je prends le petit-déjeuner à 7h", "Je me couche à 7h", "Je dîne à 7h", "Je pars à 7h"], answer: "Je prends le petit-déjeuner à 7h", why: "Breakfast = petit-déjeuner." },
  ],
  "arts-volume": [
    { q: "Une sculpture qui se voit de tous les côtés est dite…", options: ["En ronde-bosse", "En bas-relief", "Plane", "Perspective"], answer: "En ronde-bosse", why: "On peut en faire le tour." },
    { q: "Une maquette sert à…", options: ["Représenter un objet en réduction", "Mesurer la lumière", "Écrire une histoire", "Peindre un portrait"], answer: "Représenter un objet en réduction", why: "Elle aide à visualiser un projet." },
  ],
  ...EXTRA_QUESTIONS,
};

// ---------------------------------------------------------------------------
// Quêtes
// ---------------------------------------------------------------------------
export const QUESTS: Quest[] = [
  {
    id: "q-fractions",
    title: "Le secret des fractions",
    description: "La bibliothèque est verrouillée : seules les fractions peuvent ouvrir le grimoire.",
    subject_id: "maths",
    reward_stars: 12,
    steps: [
      { title: "La serrure à parts", question: "Quelle fraction représente la moitié d'un gâteau ? (écris a/b)", answer: "1/2|2/4" },
      { title: "Le chaudron", question: "Combien font 1/4 + 1/4 ? (écris a/b)", answer: "1/2|2/4" },
      { title: "Le mot de passe", question: "Simplifie 6/8. (écris a/b)", answer: "3/4" },
    ],
  },
  {
    id: "q-grammaire",
    title: "Les runes du passé",
    description: "Dame Morgane a perdu ses runes : retrouve les verbes au passé simple.",
    subject_id: "francais",
    reward_stars: 10,
    steps: [
      { title: "La première rune", question: "Conjugue « trouver » à la 3e personne du singulier au passé simple.", answer: "trouva" },
      { title: "La deuxième rune", question: "Conjugue « aller » à la 1re personne du singulier au passé simple.", answer: "allai" },
      { title: "La rune finale", question: "Quel temps emploie-t-on pour les actions de premier plan au passé ?", answer: "passé simple|le passé simple" },
    ],
  },
  {
    id: "q-chateau",
    title: "Les gardiens du château",
    description: "Trois énigmes sur le Moyen Âge pour franchir le pont-levis.",
    subject_id: "histoire",
    reward_stars: 15,
    steps: [
      { title: "Le pont-levis", question: "Comment s'appelle la cérémonie où le vassal jure fidélité ?", answer: "hommage|l'hommage" },
      { title: "La tour", question: "Quel paysan est attaché à la terre ?", answer: "serf|le serf" },
      { title: "Le sceau", question: "Comment appelle-t-on le seigneur qui protège son vassal ?", answer: "suzerain|le suzerain" },
    ],
  },
  {
    id: "q-espagnol",
    title: "Le mot perdu du Professeur",
    description: "Une quête libre : chaque étape est validée quand tu l'as faite.",
    subject_id: null,
    reward_stars: 8,
    steps: [
      { title: "Lire une fiche de la bibliothèque", question: "", answer: "" },
      { title: "Faire un quiz de ton choix", question: "", answer: "" },
      { title: "Écrire trois lignes dans l'atelier", question: "", answer: "" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Fiches méthodes & cartes mentales
// ---------------------------------------------------------------------------
const branches = (raw: [string, string[]][]): MindBranch[] => raw.map(([label, items]) => ({ label, items }));

export const SHEETS: Sheet[] = [
  ...(EXTRA_SHEETS as Sheet[]),
  {
    id: "s-fractions-methode",
    subject_id: "maths",
    kind: "methode",
    title: "Additionner des fractions",
    content:
      "1. Si les dénominateurs sont égaux, additionne les numérateurs.\n2. S'ils sont différents, mets les fractions au même dénominateur.\n3. Simplifie le résultat.\n\nExemple : 1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2.",
    branches: [],
  },
  {
    id: "s-fractions-carte",
    subject_id: "maths",
    kind: "carte",
    title: "Carte mentale — Fractions",
    content: "Fractions",
    branches: branches([
      ["Vocabulaire", ["Numérateur en haut", "Dénominateur en bas"]],
      ["Simplifier", ["Diviser haut et bas par le même nombre", "Résultat irréductible"]],
      ["Comparer", ["Même dénominateur : comparer les numérateurs", "Sinon mettre au même dénominateur"]],
      ["Opérations", ["Additionner les numérateurs", "Multiplier numérateur par numérateur"]],
      ["Décimal", ["Diviser le haut par le bas", "1/4 = 0,25"]],
    ]),
  },
  {
    id: "s-relatifs-carte",
    subject_id: "maths",
    kind: "carte",
    title: "Carte mentale — Nombres relatifs",
    content: "Nombres relatifs",
    branches: branches([
      ["Définition", ["Nombres négatifs et positifs", "Zéro est neutre"]],
      ["Addition", ["Même signe : on garde le signe", "Signes contraires : on soustrait"]],
      ["Soustraction", ["Soustraire, c'est ajouter l'opposé"]],
      ["Multiplication", ["− × − = +", "+ × − = −"]],
    ]),
  },
  {
    id: "s-passe-simple-methode",
    subject_id: "francais",
    kind: "methode",
    title: "Reconnaître le passé simple",
    content:
      "Le passé simple exprime une action courte, terminée, de premier plan.\n\nTerminaisons du 1er groupe : -ai, -as, -a, -âmes, -âtes, -èrent.\nExemple : il trouva, ils trouvèrent.\n\nAstuce : l'imparfait décrit le décor, le passé simple raconte l'action.",
    branches: [],
  },
  {
    id: "s-figures-carte",
    subject_id: "francais",
    kind: "carte",
    title: "Carte mentale — Figures de style",
    content: "Figures de style",
    branches: branches([
      ["Comparaison", ["Outil : comme, tel que", "Deux éléments rapprochés"]],
      ["Métaphore", ["Comparaison sans outil", "Image directe"]],
      ["Personnification", ["Action humaine pour une chose"]],
      ["Hyperbole", ["Exagération", "Je meurs de faim"]],
      ["Litote", ["Dire moins pour suggérer plus"]],
    ]),
  },
  {
    id: "s-feodalite-methode",
    subject_id: "histoire",
    kind: "methode",
    title: "Fiche méthode — Analyser un document historique",
    content:
      "1. Identifie la nature du document (texte, enluminure, carte…).\n2. Repère l'auteur, la date, le sujet.\n3. Cherche les mots-clés du vocabulaire.\n4. Relie le document à ce que tu sais de la période.\n5. Rédige une phrase de conclusion sur ce que le document nous apprend.",
    branches: [],
  },
  {
    id: "s-feodalite-carte",
    subject_id: "histoire",
    kind: "carte",
    title: "Carte mentale — La féodalité",
    content: "La société féodale",
    branches: branches([
      ["Seigneur", ["Protège", "Possède le fief"]],
      ["Vassal", ["Prête hommage", "Sert militairement"]],
      ["Paysans", ["Vilains libres", "Serfs non libres"]],
      ["Château fort", ["Donjon", "Remparts et fossés"]],
    ]),
  },
  {
    id: "s-anglais-present-methode",
    subject_id: "anglais",
    kind: "methode",
    title: "Méthode — Le présent simple en anglais",
    content:
      "Le présent simple décrit les habitudes et les vérités générales.\n\nI / you / we / they + verbe : I play.\nHe / she / it + verbe + s : she plays.\n\nNégation : I don't play / she doesn't play.\nQuestion : Do you play? / Does she play?\n\nAdverbes de fréquence : always, often, sometimes, never — avant le verbe.",
    branches: [],
  },
  {
    id: "s-cellule-carte",
    subject_id: "svt",
    kind: "carte",
    title: "Carte mentale — La cellule",
    content: "La cellule",
    branches: branches([
      ["Points communs", ["Membrane", "Cytoplasme", "Noyau"]],
      ["Cellule végétale", ["Paroi rigide", "Chloroplastes", "Une grande vacuole"]],
      ["Cellule animale", ["Pas de paroi", "Forme souple"]],
      ["Rôle", ["Unité de base du vivant"]],
    ]),
  },
  {
    id: "s-couleurs-methode",
    subject_id: "arts",
    kind: "methode",
    title: "Fiche méthode — Le cercle chromatique",
    content:
      "Couleurs primaires : rouge, bleu, jaune.\nCouleurs secondaires : vert (bleu + jaune), orange (rouge + jaune), violet (rouge + bleu).\n\nLes couleurs complémentaires sont opposées sur le cercle : elles créent un fort contraste.\nPour assombrir sans ternir, ajoute un peu de la complémentaire.",
    branches: [],
  },
];

// ---------------------------------------------------------------------------
// Emploi du temps (5e, semaine type)
// ---------------------------------------------------------------------------
export const TIMETABLE: Slot[] = [
  { id: "t1", day: 0, start: "08:00", end: "09:00", subject_id: "maths", label: "", room: "Salle 204" },
  { id: "t2", day: 0, start: "09:00", end: "10:00", subject_id: "francais", label: "", room: "Salle 112" },
  { id: "t3", day: 0, start: "10:15", end: "11:15", subject_id: "anglais", label: "", room: "Salle 305" },
  { id: "t4", day: 0, start: "13:30", end: "14:30", subject_id: "svt", label: "", room: "Labo 2" },
  { id: "t5", day: 1, start: "08:00", end: "09:00", subject_id: "histoire", label: "", room: "Salle 101" },
  { id: "t6", day: 1, start: "09:00", end: "10:00", subject_id: "maths", label: "", room: "Salle 204" },
  { id: "t7", day: 1, start: "10:15", end: "11:15", subject_id: "arts", label: "", room: "Atelier" },
  { id: "t8", day: 1, start: "14:30", end: "15:30", subject_id: null, label: "EPS", room: "Gymnase" },
  { id: "t9", day: 2, start: "08:00", end: "09:00", subject_id: "francais", label: "", room: "Salle 112" },
  { id: "t10", day: 2, start: "09:00", end: "10:00", subject_id: "anglais", label: "", room: "Salle 305" },
  { id: "t11", day: 2, start: "10:15", end: "11:15", subject_id: "maths", label: "", room: "Salle 204" },
  { id: "t12", day: 3, start: "08:00", end: "09:00", subject_id: "svt", label: "", room: "Labo 2" },
  { id: "t13", day: 3, start: "09:00", end: "10:00", subject_id: "histoire", label: "", room: "Salle 101" },
  { id: "t14", day: 3, start: "10:15", end: "11:15", subject_id: "francais", label: "", room: "Salle 112" },
  { id: "t15", day: 3, start: "13:30", end: "14:30", subject_id: "arts", label: "", room: "Atelier" },
  { id: "t16", day: 4, start: "08:00", end: "09:00", subject_id: "anglais", label: "", room: "Salle 305" },
  { id: "t17", day: 4, start: "09:00", end: "10:00", subject_id: "maths", label: "", room: "Salle 204" },
  { id: "t18", day: 4, start: "10:15", end: "11:15", subject_id: null, label: "Vie de classe", room: "Salle 112" },
  { id: "t19", day: 4, start: "14:30", end: "15:30", subject_id: null, label: "EPS", room: "Gymnase" },
];

export const MISSION_TEXT: Record<string, string> = {
  maths: "Révise les fractions : un quiz de 5 questions t'attend dans le grimoire.",
  francais: "Le passé simple cache ses runes : un quiz de 5 questions pour les retrouver.",
  histoire: "La société féodale n'aura plus de secrets : relève le défi du jour.",
  anglais: "Un quiz de présent simple pour garder la langue des brumes bien affûtée.",
  svt: "La cellule t'appelle : un quiz de sciences à relever aujourd'hui.",
  arts: "Couleurs et contrastes : un quiz de 5 questions à l'atelier.",
};

export function defaultProfiles(): Profile[] {
  return [
    makeProfile(PROFILE_IDS.jana, "Jana", { icon: "wand", color: "#8B5CF6" }),
    makeProfile(PROFILE_IDS.leo, "Léo", { icon: "cat", color: "#06B6D4" }),
  ];
}

function makeProfile(id: string, name: string, avatar: { icon: string; color: string }): Profile {
  return {
    id,
    name,
    avatar,
    level: 1,
    level_title: "Apprentie sorcière",
    xp: 0,
    xp_in_level: 0,
    xp_for_next: 100,
    stars: 0,
    crystals: 0,
    badges: [],
    subject_xp: {},
    quest_progress: {},
  };
}

export function chapterOf(subjectId: string, chapterId: string): { subject?: Subject; chapter?: Chapter } {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  return { subject, chapter: subject?.chapters.find((c) => c.id === chapterId) };
}
