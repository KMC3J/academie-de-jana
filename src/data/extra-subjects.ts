import type { Subject } from "@/lib/types";

// Matières ajoutées au programme de 5e (français : Espagnol, SVT, Physique-Chimie,
// Technologie, Musique, Arabe). Les chapitres suivent les thèmes des programmes
// officiels de cycle 4 / classe de 5e.

export const EXTRA_SUBJECTS: Subject[] = [
  {
    id: "espagnol",
    name: "Espagnol",
    magic_name: "Langue du soleil",
    icon: "languages",
    color: "#F97316",
    order: 7,
    chapters: [
      { id: "es-presente", title: "Se présenter", description: "Saludos, nombre, edad y gustos (A1)" },
      { id: "es-verbos", title: "Ser, estar, tener", description: "Les trois verbes de base au présent" },
      { id: "es-presente-reg", title: "Présent de l'indicatif", description: "Verbes en -ar, -er, -ir" },
      { id: "es-familia", title: "La familia y la casa", description: "Vocabulaire de la famille et du logement" },
      { id: "es-hispanos", title: "El mundo hispano", description: "Pays hispanophones, drapeaux et fêtes" },
    ],
  },
  {
    id: "physique",
    name: "Physique-Chimie",
    magic_name: "Alchimie des éléments",
    icon: "atom",
    color: "#3B82F6",
    order: 9,
    chapters: [
      { id: "pc-eau", title: "L'eau et les mélanges", description: "États, dissolution et mélanges" },
      { id: "pc-masse-volume", title: "Masse et volume", description: "Mesures, unités et masse volumique" },
      { id: "pc-changements", title: "Changements d'état", description: "Fusion, solidification, évaporation" },
      { id: "pc-circuits", title: "Circuits électriques", description: "Série, dérivation et lampes" },
      { id: "pc-lumiere", title: "Lumière et ombres", description: "Propagation rectiligne, ombres et éclipses" },
    ],
  },
  {
    id: "technologie",
    name: "Technologie",
    magic_name: "Artisanat des engrenages",
    icon: "cpu",
    color: "#64748B",
    order: 10,
    chapters: [
      { id: "tec-objets", title: "Objets techniques", description: "Fonctions, besoins et évolutions" },
      { id: "tec-materiaux", title: "Les matériaux", description: "Bois, métaux, plastiques et leurs propriétés" },
      { id: "tec-energies", title: "Les énergies", description: "Sources, conversion et économies" },
      { id: "tec-programmation", title: "Initiation à la programmation", description: "Algorithmes, boucles et conditions" },
      { id: "tec-projet", title: "Le projet technique", description: "Cahier des charges et prototype" },
    ],
  },
  {
    id: "musique",
    name: "Éducation musicale",
    magic_name: "Chant des sphères",
    icon: "music",
    color: "#A855F7",
    order: 11,
    chapters: [
      { id: "mus-notation", title: "Lire les notes", description: "Portée, clé de sol et valeurs rythmiques" },
      { id: "mus-instruments", title: "Les familles d'instruments", description: "Cordes, vents, percussions et voix" },
      { id: "mus-tempo", title: "Tempo, nuance, timbre", description: "Les paramètres du son musical" },
      { id: "mus-histoire", title: "Des chants et des époques", description: "Du Moyen Âge au jazz" },
    ],
  },
  {
    id: "arabe",
    name: "Arabe",
    magic_name: "Langue des sables",
    icon: "book",
    color: "#14B8A6",
    order: 12,
    chapters: [
      { id: "ar-alphabet", title: "L'alphabet arabe", description: "Les 28 lettres et leur écriture" },
      { id: "ar-salam", title: "Se présenter", description: "Salutations et phrases de base" },
      { id: "ar-chiffres", title: "Les chiffres", description: "Nombres de 1 à 20" },
      { id: "ar-famille", title: "La famille", description: "Vocabulaire de la famille" },
      { id: "ar-voyelles", title: "Voyelles courtes et longues", description: "Harakat et allongement" },
    ],
  },
];

export const EXTRA_QUESTIONS: Record<string, { q: string; options: string[]; answer: string; why: string }[]> = {
  "es-presente": [
    { q: "Comment dit-on « Bonjour » en espagnol ?", options: ["Hola", "Adiós", "Gracias", "Buenas noches"], answer: "Hola", why: "Hola = bonjour ; adiós = au revoir." },
    { q: "« ¿Cómo te llamas? » signifie…", options: ["Comment t'appelles-tu ?", "Quel âge as-tu ?", "Où habites-tu ?", "Comment vas-tu ?"], answer: "Comment t'appelles-tu ?", why: "Llamarse = s'appeler." },
    { q: "« Me llamo Ana » veut dire…", options: ["Je m'appelle Ana", "J'aime Ana", "Je vois Ana", "Je suis Ana"], answer: "Je m'appelle Ana", why: "Me llamo… = je m'appelle…." },
    { q: "Quel est le mot espagnol pour « merci » ?", options: ["Gracias", "Por favor", "De nada", "Perdón"], answer: "Gracias", why: "Gracias = merci ; de nada = de rien." },
    { q: "« Tengo doce años » signifie…", options: ["J'ai douze ans", "Il est midi", "J'ai douze frères", "Je suis en 12e"], answer: "J'ai douze ans", why: "Tener = avoir ; años = années, ans." },
  ],
  "es-verbos": [
    { q: "Complète : « Yo ___ estudiante. »", options: ["soy", "estoy", "tengo", "es"], answer: "soy", why: "Ser décrit un état permanent : yo soy estudiante." },
    { q: "Complète : « Ella ___ en casa. »", options: ["está", "es", "tiene", "son"], answer: "está", why: "Estar indique un lieu : ella está en casa." },
    { q: "« Tener » à la 1re personne du singulier donne…", options: ["tengo", "tienes", "tiene", "tenemos"], answer: "tengo", why: "Tener est irrégulier : tengo, tienes, tiene, tenemos." },
    { q: "Quel verbe utilise-t-on pour la nationalité ?", options: ["Ser", "Estar", "Tener", "Hacer"], answer: "Ser", why: "« Soy español » : l'origine se dit avec ser." },
    { q: "« Nosotros ___ quince años. »", options: ["tenemos", "tenéis", "tienen", "tengo"], answer: "tenemos", why: "1re personne du pluriel de tener : tenemos." },
  ],
  "es-presente-reg": [
    { q: "« Hablar » à la 3e personne du singulier :", options: ["habla", "hablo", "hablas", "hablan"], answer: "habla", why: "Verbe en -ar : hablo, hablas, habla…" },
    { q: "« Comer » à la 1re personne du singulier :", options: ["como", "comes", "come", "comemos"], answer: "como", why: "Verbe en -er : como, comes, come…" },
    { q: "« Vivir » à la 3e personne du pluriel :", options: ["viven", "vive", "vivo", "vivís"], answer: "viven", why: "Verbe en -ir : vivo, vives, vive, vivimos, vivís, viven." },
    { q: "Quelle terminaison n'existe pas au présent pour les verbes en -ar ?", options: ["-emos", "-amos", "-an", "-as"], answer: "-emos", why: "Les verbes en -ar prennent -amos, pas -emos." },
  ],
  "es-familia": [
    { q: "« la madre » signifie…", options: ["la mère", "la sœur", "la tante", "la fille"], answer: "la mère", why: "El padre = le père ; la madre = la mère." },
    { q: "« el hermano » est…", options: ["le frère", "le cousin", "le grand-père", "l'oncle"], answer: "le frère", why: "La hermana = la sœur." },
    { q: "« la cocina » est une pièce de la maison :", options: ["la cuisine", "la chambre", "la salle de bain", "le salon"], answer: "la cuisine", why: "El salón = le salon ; el baño = la salle de bain." },
  ],
  "es-hispanos": [
    { q: "Quelle est la capitale de l'Espagne ?", options: ["Madrid", "Barcelona", "Sevilla", "Valencia"], answer: "Madrid", why: "Madrid est la capitale depuis 1561." },
    { q: "Combien de pays ont l'espagnol pour langue officielle ?", options: ["21", "5", "8", "12"], answer: "21", why: "21 pays, de l'Argentine à la Guinée équatoriale." },
    { q: "« La Tomatina » est une fête de…", options: ["Buñol, en Espagne", "Mexico, au Mexique", "Cusco, au Pérou", "La Havane, à Cuba"], answer: "Buñol, en Espagne", why: "Cette bataille de tomates a lieu à Buñol chaque août." },
  ],
  "svt-respiration": [
    { q: "L'air pénètre dans les poumons par…", options: ["Les bronches", "L'œsophage", "L'estomac", "Les reins"], answer: "Les bronches", why: "Trachée, bronches puis bronchioles mènent aux alvéoles." },
    { q: "Les échanges gazeux ont lieu dans…", options: ["Les alvéoles pulmonaires", "Le cœur", "Les muscles", "Le foie"], answer: "Les alvéoles pulmonaires", why: "L'oxygène passe dans le sang au niveau des alvéoles." },
    { q: "Le sang transporte l'oxygène grâce aux…", options: ["Globules rouges", "Globules blancs", "Plaquettes", "Neurones"], answer: "Globules rouges", why: "L'hémoglobine des globules rouges fixe l'oxygène." },
    { q: "Le cœur envoie le sang aux organes par les…", options: ["Artères", "Veines", "Nerfs", "Bronches"], answer: "Artères", why: "Les artères partent du cœur, les veines y ramènent le sang." },
  ],
  "svt-plantes": [
    { q: "Les plantes fabriquent leur matière grâce à…", options: ["La photosynthèse", "La digestion", "La respiration seule", "La fermentation"], answer: "La photosynthèse", why: "Eau + sels minéraux + CO2 + lumière = matière organique." },
    { q: "La photosynthèse rejette de…", options: ["L'oxygène", "Du dioxyde de carbone", "De l'azote", "Du sucre"], answer: "L'oxygène", why: "L'O2 est libéré dans l'air par les feuilles." },
    { q: "Quel organe de la plante absorbe l'eau ?", options: ["La racine", "La fleur", "La feuille", "Le fruit"], answer: "La racine", why: "Les poils absorbants des racines prélèvent l'eau du sol." },
    { q: "La fleur sert à…", options: ["La reproduction", "La respiration", "Stocker l'eau", "La photosynthèse uniquement"], answer: "La reproduction", why: "La pollinisation précède la formation de la graine." },
  ],
  "svt-roches": [
    { q: "Les séismes se produisent surtout…", options: ["Aux limites des plaques", "Au centre des continents", "Dans les océans polaires", "À la surface du Soleil"], answer: "Aux limites des plaques", why: "Les contraintes entre plaques cassent les roches en profondeur." },
    { q: "Un volcan rejette…", options: ["De la lave et des gaz", "De l'eau douce", "Des nuages", "De la glace"], answer: "De la lave et des gaz", why: "Le magma remonte par une cheminée et sort en surface." },
    { q: "La Terre est découpée en grandes…", options: ["Plaques tectoniques", "Couches de verre", "Îles", "Cratères"], answer: "Plaques tectoniques", why: "Une douzaine de plaques se déplacent de quelques cm par an." },
  ],
  "pc-eau": [
    { q: "Comment appelle-t-on un mélange homogène d'eau et de sel ?", options: ["Une solution", "Une suspension", "Une émulsion", "Un précipité"], answer: "Une solution", why: "Le sel est dissous dans l'eau : on ne distingue plus les composants." },
    { q: "L'eau, l'huile et le sable forment un mélange…", options: ["Hétérogène", "Homogène", "Pur", "Gazeux"], answer: "Hétérogène", why: "On distingue l'huile et le sable à l'œil." },
    { q: "Quelle eau est un corps pur ?", options: ["L'eau distillée", "L'eau du robinet", "L'eau de mer", "L'eau minérale"], answer: "L'eau distillée", why: "L'eau distillée ne contient qu'une seule espèce chimique." },
    { q: "Pour séparer l'eau et le sable, on fait…", options: ["Une filtration", "Une distillation", "Une décantation magnétique", "Un chauffage puissant"], answer: "Une filtration", why: "Le filtre retient le sable, l'eau passe." },
  ],
  "pc-masse-volume": [
    { q: "Quelle est l'unité légale de masse ?", options: ["Le kilogramme", "Le litre", "Le mètre", "Le newton"], answer: "Le kilogramme", why: "La masse se mesure en kg, le volume en litres." },
    { q: "1 L est égal à…", options: ["1 dm³", "1 cm³", "1 m³", "10 dm³"], answer: "1 dm³", why: "1 L = 1 dm³ = 0,001 m³." },
    { q: "La masse volumique s'exprime en…", options: ["g/cm³ ou kg/m³", "litres", "mètres", "secondes"], answer: "g/cm³ ou kg/m³", why: "ρ = m / V : une masse divisée par un volume." },
    { q: "1 kg d'eau occupe environ…", options: ["1 litre", "10 litres", "0,1 litre", "100 litres"], answer: "1 litre", why: "La masse volumique de l'eau est 1 kg/L." },
  ],
  "pc-changements": [
    { q: "Le passage de l'eau liquide à la glace s'appelle…", options: ["La solidification", "La fusion", "La vaporisation", "La condensation"], answer: "La solidification", why: "L'eau se solidifie à 0 °C sous pression normale." },
    { q: "Le passage de l'eau liquide à la vapeur s'appelle…", options: ["La vaporisation", "La fusion", "La solidification", "La liquéfaction"], answer: "La vaporisation", why: "Elle se produit à 100 °C à pression normale, ou plus lentement par évaporation." },
    { q: "Pendant un changement d'état, la température…", options: ["Reste constante", "Augmente tout de suite", "Diminue fortement", "Double"], answer: "Reste constante", why: "L'énergie sert à changer d'état, pas à chauffer." },
    { q: "La glace fond à…", options: ["0 °C", "100 °C", "−10 °C", "20 °C"], answer: "0 °C", why: "La fusion de l'eau se fait à 0 °C sous pression atmosphérique." },
  ],
  "pc-circuits": [
    { q: "Dans un circuit en série, si une lampe grille…", options: ["Toutes les lampes s'éteignent", "Les autres restent allumées", "Rien ne change", "Le circuit explose"], answer: "Toutes les lampes s'éteignent", why: "Le circuit est ouvert : le courant ne passe plus." },
    { q: "Dans un circuit en dérivation, une lampe grillée…", options: ["N'empêche pas les autres de briller", "Éteint toutes les lampes", "Devient un générateur", "Empêche le courant"], answer: "N'empêche pas les autres de briller", why: "Chaque branche a son propre chemin." },
    { q: "Un interrupteur sert à…", options: ["Ouvrir ou fermer le circuit", "Augmenter la tension", "Stocker l'électricité", "Chauffer la lampe"], answer: "Ouvrir ou fermer le circuit", why: "Fermé, il laisse passer le courant." },
  ],
  "pc-lumiere": [
    { q: "La lumière se propage…", options: ["En ligne droite", "En zigzag", "En cercle", "Dans le vide seulement"], answer: "En ligne droite", why: "C'est ce qui forme des ombres nettes." },
    { q: "Une éclipse de Soleil a lieu quand…", options: ["La Lune est entre la Terre et le Soleil", "La Terre cache la Lune", "Le Soleil s'éteint", "La Lune est pleine"], answer: "La Lune est entre la Terre et le Soleil", why: "L'ombre de la Lune tombe alors sur la Terre." },
    { q: "Un objet qui laisse passer la lumière est…", options: ["Transparent", "Opaque", "Réfléchissant", "Lumineux"], answer: "Transparent", why: "Le verre clair est transparent ; le bois est opaque." },
  ],
  "tec-objets": [
    { q: "Un objet technique sert à…", options: ["Répondre à un besoin", "Décorer seulement", "Remplacer les humains", "Faire du bruit"], answer: "Répondre à un besoin", why: "Il est fabriqué pour assurer une fonction d'usage." },
    { q: "La fonction d'usage d'un vélo est…", options: ["Se déplacer", "Se reposer", "Écrire", "Cuisiner"], answer: "Se déplacer", why: "C'est l'usage principal pour l'utilisateur." },
    { q: "Pourquoi les objets techniques évoluent-ils ?", options: ["Nouveaux besoins et technologies", "Par hasard", "Pour changer de couleur", "Parce qu'ils vieillissent"], answer: "Nouveaux besoins et technologies", why: "Le téléphone en est un bon exemple." },
  ],
  "tec-materiaux": [
    { q: "Quel matériau est un métal ?", options: ["L'aluminium", "Le bois", "Le verre", "Le coton"], answer: "L'aluminium", why: "L'aluminium est un métal léger et conducteur." },
    { q: "Une propriété des plastiques est…", options: ["Légers et isolants", "Toujours conducteurs", "Magnétiques", "Transparents obligatoirement"], answer: "Légers et isolants", why: "Ils isolent souvent l'électricité et la chaleur." },
    { q: "Le bois provient de…", options: ["Matière vivante (arbres)", "Minerais métalliques", "Pétrole", "Sable"], answer: "Matière vivante (arbres)", why: "C'est une matière organique renouvelable." },
  ],
  "tec-energies": [
    { q: "Une énergie renouvelable est…", options: ["Le soleil", "Le pétrole", "Le charbon", "Le gaz naturel"], answer: "Le soleil", why: "Elle se renouvelle en permanence." },
    { q: "Un panneau solaire thermique produit…", options: ["De la chaleur", "Du vent", "De l'essence", "De la lumière"], answer: "De la chaleur", why: "Il chauffe de l'eau ; le panneau photovoltaïque produit de l'électricité." },
    { q: "Quelle chaîne d'énergie correspond à une lampe torche ?", options: ["Pile → électricité → lumière", "Eau → chaleur → électricité", "Vent → lumière", "Essence → mouvement"], answer: "Pile → électricité → lumière", why: "Réservoir, convertisseur, puis transmetteur." },
  ],
  "tec-programmation": [
    { q: "Un algorithme est…", options: ["Une suite d'instructions ordonnées", "Un type d'écran", "Un moteur", "Un matériau"], answer: "Une suite d'instructions ordonnées", why: "Il décrit les étapes pour résoudre un problème." },
    { q: "Une boucle sert à…", options: ["Répéter des instructions", "Stocker définitivement", "Afficher un texte", "Éteindre l'appareil"], answer: "Répéter des instructions", why: "Elle évite d'écrire 20 fois la même instruction." },
    { q: "Une condition « si… alors… » permet de…", options: ["Choisir une action selon un test", "Répéter à l'infini", "Mesurer la lumière", "Stocker une image"], answer: "Choisir une action selon un test", why: "C'est le branchement conditionnel." },
  ],
  "tec-projet": [
    { q: "Le cahier des charges d'un projet décrit…", options: ["Le besoin, les fonctions et les contraintes", "Seulement la couleur", "Le prix final uniquement", "La liste des élèves"], answer: "Le besoin, les fonctions et les contraintes", why: "Il guide la conception du prototype." },
    { q: "Un prototype sert à…", options: ["Tester la solution", "Vendre l'objet", "Remplacer le dessin", "Décorer l'atelier"], answer: "Tester la solution", why: "Il permet d'éprouver les choix techniques." },
    { q: "Une contrainte de projet peut être…", options: ["Le budget", "La couleur du préau", "Le nombre d'élèves", "Le jour de la semaine"], answer: "Le budget", why: "Budget, sécurité, taille ou matériaux sont des contraintes." },
  ],
  "mus-notation": [
    { q: "Combien de lignes a une portée musicale ?", options: ["5", "4", "6", "8"], answer: "5", why: "Une portée a 5 lignes et 4 interlignes." },
    { q: "La clé placée au début de la portée pour les voix aiguës est…", options: ["La clé de sol", "La clé de fa", "La clé d'ut", "La clé de ré"], answer: "La clé de sol", why: "Elle fixe le sol sur la deuxième ligne." },
    { q: "Une noire vaut…", options: ["1 temps", "2 temps", "4 temps", "1/2 temps"], answer: "1 temps", why: "Blanche = 2 temps, ronde = 4 temps." },
    { q: "Le silence d'un temps s'appelle…", options: ["Un soupir", "Une pause", "Une blanche", "Une croche"], answer: "Un soupir", why: "Le demi-soupir vaut une croche." },
  ],
  "mus-instruments": [
    { q: "Le violon appartient aux…", options: ["Cordes frottées", "Vents", "Percussions", "Claviers"], answer: "Cordes frottées", why: "On frotte les cordes avec un archet." },
    { q: "La flûte traversière est un…", options: ["Instrument à vent", "Instrument à cordes", "Instrument à percussion", "Instrument électronique"], answer: "Instrument à vent", why: "L'air est mis en vibration dans le tube." },
    { q: "La voix la plus aiguë chez l'enfant est…", options: ["Le soprano", "Le baryton", "Le ténor", "La basse"], answer: "Le soprano", why: "Soprano > alto > ténor > basse." },
  ],
  "mus-tempo": [
    { q: "Un tempo lent est indiqué par…", options: ["Adagio", "Presto", "Allegro", "Vivace"], answer: "Adagio", why: "Adagio ≈ 60 à 76 pulsations par minute." },
    { q: "Le timbre d'un son correspond…", options: ["À sa couleur", "À sa durée", "À sa hauteur", "À son volume"], answer: "À sa couleur", why: "Deux instruments jouant la même note ont des timbres différents." },
    { q: "« Forte » signifie…", options: ["Jouer fort", "Jouer vite", "Jouer lentement", "Jouer en silence"], answer: "Jouer fort", why: "Les nuances vont de pianissimo à fortissimo." },
  ],
  "mus-histoire": [
    { q: "Quel chant médiéval à plusieurs voix est célèbre ?", options: ["Le chant grégorien", "Le rap", "Le blues", "La techno"], answer: "Le chant grégorien", why: "Chant monodique latin du Moyen Âge." },
    { q: "Le jazz est né…", options: ["Aux États-Unis", "En Italie", "En Chine", "Au Brésil"], answer: "Aux États-Unis", why: "Il naît au début du XXe siècle à La Nouvelle-Orléans." },
    { q: "Qui a composé « Les Quatre Saisons » ?", options: ["Vivaldi", "Mozart", "Beethoven", "Debussy"], answer: "Vivaldi", why: "Antonio Vivaldi, compositeur italien du XVIIIe siècle." },
  ],
  "ar-alphabet": [
    { q: "Combien de lettres compte l'alphabet arabe ?", options: ["28", "26", "22", "30"], answer: "28", why: "De alif à yāʾ." },
    { q: "Dans quel sens s'écrit l'arabe ?", options: ["De droite à gauche", "De gauche à droite", "De haut en bas", "En spirale"], answer: "De droite à gauche", why: "Les lettres s'enchaînent de droite à gauche." },
    { q: "Quelle est la première lettre de l'alphabet arabe ?", options: ["Alif", "Bāʾ", "Yāʾ", "Mīm"], answer: "Alif", why: "Alif correspond au son a long." },
  ],
  "ar-salam": [
    { q: "« As-salāmu ʿalaykum » signifie…", options: ["Que la paix soit sur vous", "Bon appétit", "Bonne nuit", "Combien ça coûte ?"], answer: "Que la paix soit sur vous", why: "La réponse est « wa ʿalaykum as-salām »." },
    { q: "« Kayfa ḥāluk? » veut dire…", options: ["Comment vas-tu ?", "Quel est ton nom ?", "Où es-tu ?", "Quel âge as-tu ?"], answer: "Comment vas-tu ?", why: "On répond par exemple « bikhayr, shukran »." },
    { q: "« Shukran » signifie…", options: ["Merci", "Bonjour", "Pardon", "Au revoir"], answer: "Merci", why: "Une autre formule : « shukran jazīlan »." },
  ],
  "ar-chiffres": [
    { q: "Comment écrit-on « trois » en arabe ?", options: ["Thalātha (٣)", "Ithnān (٢)", "Khamsa (٥)", "Sitta (٦)"], answer: "Thalātha (٣)", why: "1 wāḥid, 2 ithnān, 3 thalātha." },
    { q: "Le chiffre arabe ٥ correspond à…", options: ["5", "7", "2", "0"], answer: "5", why: "٣ = 3, ٤ = 4, ٥ = 5." },
    { q: "« Dix » en arabe est…", options: ["ʿAshara", "Thamāniya", "Sabʿa", "Tisʿa"], answer: "ʿAshara", why: "De 1 à 10 : wāḥid, ithnān, thalātha, arbaʿa, khamsa, sitta, sabʿa, thamāniya, tisʿa, ʿashara." },
  ],
  "ar-famille": [
    { q: "« Umm » signifie…", options: ["Mère", "Père", "Frère", "Sœur"], answer: "Mère", why: "Ab = père, umm = mère." },
    { q: "« Ab » veut dire…", options: ["Père", "Mère", "Fils", "Oncle"], answer: "Père", why: "« Abī » = mon père." },
    { q: "« Akh » signifie…", options: ["Frère", "Sœur", "Fille", "Grand-père"], answer: "Frère", why: "Ukht = sœur." },
  ],
  "ar-voyelles": [
    { q: "Comment appelle-t-on les voyelles courtes en arabe ?", options: ["Les harakāt", "Les harf", "Les kalimāt", "Les surāt"], answer: "Les harakāt", why: "Fatha, kasra et damma sont les trois principales." },
    { q: "La fatha donne un son…", options: ["« a »", "« i »", "« ou »", "« é »"], answer: "« a »", why: "Kasra donne « i », damma donne « ou »." },
    { q: "Une voyelle longue est obtenue en ajoutant…", options: ["Alif, wāw ou yāʾ", "Une lettre muette", "Un point", "Un accent aigu"], answer: "Alif, wāw ou yāʾ", why: "Les lettres allonges prolongent la voyelle." },
  ],
};

// Fiches méthodes pour les nouvelles matières
export const EXTRA_SHEETS = [
  {
    id: "s-es-presente",
    subject_id: "espagnol",
    kind: "methode" as const,
    title: "Se présenter en espagnol",
    content:
      "1. Saludar : ¡Hola! / Buenos días / Buenas tardes.\n2. Decir su nombre : Me llamo… / Soy….\n3. Dar su edad : Tengo … años.\n4. Dar sus gustos : Me gusta … / No me gusta ….\n5. Despedirse : ¡Adiós! / ¡Hasta luego!",
    branches: [],
  },
  {
    id: "s-ser-estar",
    subject_id: "espagnol",
    kind: "methode" as const,
    title: "Ser ou Estar ?",
    content:
      "SER : identité et permanence (soy francés, es alto, son hermanos).\nESTAR : état passager et lieu (estoy cansado, está en casa, están aquí).\nTENER : possession et âge (tengo un perro, tiene trece años).",
    branches: [],
  },
  {
    id: "s-svt-alimentation",
    subject_id: "svt",
    kind: "methode" as const,
    title: "Bien se nourrir",
    content:
      "Aliments bâtisseurs : viande, poisson, œufs, lait → protéines.\nAliments énergétiques : féculents, matières grasses → énergie.\nAliments protecteurs : fruits et légumes → vitamines et fibres.\nLa digestion découpe les aliments en nutriments qui passent dans le sang au niveau de l'intestin grêle.",
    branches: [],
  },
  {
    id: "s-pc-masse-volume",
    subject_id: "physique",
    kind: "methode" as const,
    title: "Masse, volume et masse volumique",
    content:
      "Masse (kg) : balance. Volume (L) : éprouvette graduée.\nMasse volumique : ρ = m / V.\nExemples : eau 1 kg/L ; aluminium 2,7 g/cm³ ; fer 7,9 g/cm³.\n1 L = 1 dm³ = 1 000 cm³ ; 1 m³ = 1 000 L.",
    branches: [],
  },
  {
    id: "s-pc-changements",
    subject_id: "physique",
    kind: "methode" as const,
    title: "Les changements d'état",
    content:
      "Fusion : solide → liquide (glace à 0 °C).\nSolidification : liquide → solide (eau à 0 °C).\nVaporisation : liquide → gaz (eau à 100 °C).\nLiquéfaction : gaz → liquide.\nPendant le changement d'état, la température reste constante.",
    branches: [],
  },
  {
    id: "s-tec-energies",
    subject_id: "technologie",
    kind: "methode" as const,
    title: "Les chaînes d'énergie",
    content:
      "Une chaîne d'énergie : source → convertisseur → transmetteur → préactionneur → actionneur.\nExemples : pile (électricité) → lampe (lumière) ; vent (vent) → éolienne → électricité.\nÉconomiser : réduire, remplacer, réutiliser.",
    branches: [],
  },
  {
    id: "s-mus-notation",
    subject_id: "musique",
    kind: "methode" as const,
    title: "Lire une portée",
    content:
      "Portée : 5 lignes, 4 interlignes.\nClé de sol : le sol sur la 2e ligne ; clé de fa : le fa sur la 4e ligne.\nValeurs : ronde = 4 temps, blanche = 2, noire = 1, croche = 1/2, double croche = 1/4.\nSilences : pause, demi-pause, soupir, demi-soupir.",
    branches: [],
  },
  {
    id: "s-ar-alphabet",
    subject_id: "arabe",
    kind: "methode" as const,
    title: "Écrire l'arabe",
    content:
      "28 lettres, écriture de droite à gauche, aucun majuscule.\nUne lettre peut prendre 4 formes : isolée, initiale, médiane, finale.\nLes voyelles courtes (harakāt) se notent par de petits signes au-dessus ou en dessous : fatha = a, kasra = i, damma = ou.",
    branches: [],
  },
];
