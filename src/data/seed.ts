import type { BadgeDef, Chapter, MindBranch, Profile, Quest, Sheet, Slot, Subject } from "@/lib/types";

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
    ],
  },
  {
    id: "svt",
    name: "Sciences",
    magic_name: "Potions et plantes",
    icon: "flask",
    color: "#10B981",
    order: 5,
    chapters: [
      { id: "svt-cellule", title: "La cellule", description: "Cellule végétale et cellule animale" },
      { id: "svt-alimentation", title: "Alimentation", description: "Besoins nutritionnels et digestion" },
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
    ],
  },
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
