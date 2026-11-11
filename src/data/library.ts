// ---------------------------------------------------------------------------
// La petite Bibliothèque : livres de lecture courts (programme de 5e).
// Chaque livre a des chapitres de lecture et 2 questions de compréhension.
// ---------------------------------------------------------------------------

export type BookChapter = { title: string; text: string[] };
export type BookQuestion = { q: string; options: string[]; answer: string };
export type Book = {
  id: string;
  subject_id: string;
  title: string;
  author: string;
  kind: "roman" | "documentaire" | "recueil" | "mythe" | "theatre";
  summary: string;
  minutes: number;
  chapters: BookChapter[];
  questions: BookQuestion[];
};

export const BOOK_KIND_LABEL: Record<Book["kind"], string> = {
  roman: "Roman",
  documentaire: "Documentaire",
  recueil: "Recueil de poèmes",
  mythe: "Mythe",
  theatre: "Théâtre",
};

export const LIBRARY_BOOKS: Book[] = [
  {
    id: "livre-chevalier",
    subject_id: "francais",
    title: "Le chevalier au bouclier d'étoiles",
    author: "D'après un récit médiéval",
    kind: "roman",
    summary: "Un jeune écuyer doit traverser la forêt de Brocéliande pour porter un message au roi.",
    minutes: 6,
    chapters: [
      {
        title: "1. L'adoubement",
        text: [
          "Ce matin-là, le château sentait la cire chaude et le pain grillé. Gauvain, quatorze ans, serrait les poings pour ne pas trembler. Le vieux sire Bertrand posa la main sur son épaule et lui dit doucement : « Un chevalier ne craint pas la peur ; il la porte avec lui, comme un bouclier. »",
          "Il lui tendit une épée trop lourde, un bouclier sans blason et un parchemin scellé de cire rouge. « Porte ceci au roi avant la troisième lune. Traverse Brocéliande, mais ne quitte jamais le sentier des pierres. »",
        ],
      },
      {
        title: "2. La forêt",
        text: [
          "La forêt était plus vieille que les royaumes. Les arbres y parlaient bas et la lumière tombait en morceaux. Gauvain marchait depuis deux heures quand il crut voir une lanterne entre les fougères. Une voix fine l'appela : « Petit chevalier, ton chemin est long, le mien est court : donne-moi ton parchemin. »",
          "Gauvain se souvint des mots de sire Bertrand. Il ne répondit pas, serra les courroies de son bouclier et reprit sa marche sans tourner la tête. La lanterne s'éteignit derrière lui, comme un soupir.",
        ],
      },
      {
        title: "3. Le bouclier d'étoiles",
        text: [
          "Au matin, il arriva devant la porte du roi. Le parchemin disait : « Ce garçon a traversé la forêt sans rien céder. Faites-en un chevalier. »",
          "Sur le bouclier, quelqu'un avait gravé une étoile à cinq branches. On raconte encore, dans les veillées, que cette étoile brille sur le blason des voyageurs qui gardent leur parole.",
        ],
      },
    ],
    questions: [
      { q: "Que doit porter Gauvain à travers la forêt ?", options: ["Un parchemin scellé", "Une couronne d'or", "Un cheval", "Un livre de sorts"], answer: "Un parchemin scellé" },
      { q: "Pourquoi Gauvain ne répond-il pas à la voix dans la forêt ?", options: ["Il garde sa mission secrète", "Il s'est endormi", "Il est muet", "Il cherche de l'aide"], answer: "Il garde sa mission secrète" },
    ],
  },
  {
    id: "livre-odyssee",
    subject_id: "francais",
    title: "Ulysse et le chant des sirènes",
    author: "D'après Homère",
    kind: "mythe",
    summary: "Le héros le plus rusé de Grèce doit résister au chant qui rend fou.",
    minutes: 5,
    chapters: [
      {
        title: "1. Le conseil de Circé",
        text: [
          "Circé la magicienne prévint Ulysse : « Les sirènes ne dévorent pas les marins. Elles les font oublier. Celui qui les écoute ne rentre jamais chez lui : il reste sur son banc, à sourire, jusqu'à la fin. »",
          "Elle lui donna deux remèdes : de la cire pour les oreilles de ses compagnons, et une corde solide pour se faire attacher lui-même au mât. « Toi, tu écouteras. Mais tu ne pourras pas bouger. »",
        ],
      },
      {
        title: "2. Le chant",
        text: [
          "La mer devint plate comme une table. Alors le chant commença : il parlait de la maison, du chien qui attend, du seuil tiède et des matins d'enfance. Les rameurs, sourds, tiraient régulièrement. Ulysse, lui, tirait sur ses liens en hurlant qu'on le détache.",
          "Les hommes du bord n'entendaient rien : ils avaient de la cire dans les oreilles. Ils ramaient, les yeux sur l'eau, et le bateau sortit du détroit. Ce n'est pas la force qui sauva Ulysse, ce fut la ruse.",
        ],
      },
    ],
    questions: [
      { q: "Que font les sirènes selon Circé ?", options: ["Elles font oublier ceux qui les écoutent", "Elles mangent les marins", "Elles volent les bateaux", "Elles racontent l'avenir"], answer: "Elles font oublier ceux qui les écoutent" },
      { q: "Comment Ulysse échappe-t-il au chant ?", options: ["Attaché au mât, avec des rameurs sourds", "En fermant les yeux", "En chantant plus fort", "En attaquant les sirènes"], answer: "Attaché au mât, avec des rameurs sourds" },
    ],
  },
  {
    id: "livre-nuage",
    subject_id: "svt",
    title: "Le voyage d'une goutte d'eau",
    author: "Documentaire",
    kind: "documentaire",
    summary: "Du sommet au robinet : le cycle de l'eau expliqué par une goutte curieuse.",
    minutes: 4,
    chapters: [
      {
        title: "1. L'évaporation",
        text: [
          "Je m'appelle Goutte et je vivais dans la mer d'Iroise. Un après-midi d'été, le soleil m'a chauffée jusqu'à ce que je lâche tout : je suis devenue vapeur. Peu à peu, je me suis élevée, presque invisible, portée par l'air chaud.",
          "Plus haut, le froid m'a saisie. J'ai retrouvé un corps en me collant à des poussières minuscules : j'étais dans un nuage, et j'ai commencé à voyager.",
        ],
      },
      {
        title: "2. La pluie et le ruisseau",
        text: [
          "Le nuage, trop lourd, a lâché des milliers de gouttes. Je suis tombée sur une montagne grise, puis j'ai glissé dans un ruisseau, puis dans une rivière. En chemin, j'ai vu les plantes boire : leurs racines m'ont prélevée avec mes sels minéraux.",
          "Une fois dans le fleuve, j'ai tourné deux jours avant de rejoindre la mer. Mon voyage s'appelle le cycle de l'eau : évaporation, condensation, précipitation, ruissellement. Et il recommence, sans fin.",
        ],
      },
    ],
    questions: [
      { q: "Comment s'appelle le passage de l'eau liquide à la vapeur ?", options: ["L'évaporation", "La condensation", "La fusion", "La précipitation"], answer: "L'évaporation" },
      { q: "Que deviennent les gouttes dans le nuage ?", options: ["Elles se condensent autour de poussières", "Elles disparaissent", "Elles deviennent des roches", "Elles gèlent pour toujours"], answer: "Elles se condensent autour de poussières" },
    ],
  },
  {
    id: "livre-robinson",
    subject_id: "francais",
    title: "Robinson et la patience du bois",
    author: "D'après Daniel Defoe",
    kind: "roman",
    summary: "Seul sur son île, Robinson apprend qu'une cabane se construit une planche à la fois.",
    minutes: 5,
    chapters: [
      {
        title: "1. Le premier jour",
        text: [
          "Le naufrage m'a laissé sur une plage grise, avec un couteau, une marmite et beaucoup de silence. J'ai compté mes richesses : quelques biscuits, une hache sans manche, et la peur.",
          "J'ai dressé une pancarte sur la plage : « Ici, chaque jour, je marquerai une ligne. » Ce n'était pas pour être sauvé. C'était pour ne pas devenir fou.",
        ],
      },
      {
        title: "2. La cabane",
        text: [
          "Construire a tout changé. J'ai appris à couper le bois dans le sens des fibres, à laisser sécher les branches avant de les clouer, à ne jamais jurer contre la pluie. Un jour, un mur fini ; un jour, un toit en feuilles.",
          "Quand le vent est entré dans la cabane sans fermer la porte, j'ai compris : un ouvrage est fait d'une planche à la fois, et un homme aussi.",
        ],
      },
    ],
    questions: [
      { q: "Que reste-t-il à Robinson comme outils ?", options: ["Un couteau et une marmite", "Deux épées", "Une hache neuve", "Rien du tout"], answer: "Un couteau et une marmite" },
      { q: "Quelle leçon tire-t-il de son travail ?", options: ["La patience et l'essai régulier", "La force physique", "L'ennui", "La peur du vent"], answer: "La patience et l'essai régulier" },
    ],
  },
  {
    id: "livre-poemes",
    subject_id: "francais",
    title: "Trois poèmes pour l'hiver",
    author: "Messages des grands arbres",
    kind: "recueil",
    summary: "Un tout petit recueil pour écouter la neige, le vent et le silence.",
    minutes: 3,
    chapters: [
      {
        title: "Neige",
        text: [
          "La neige vient sans bruit,\ncomme une allumeuse de brindilles :\nelle pose une main sur chaque toit,\npuis s'en va plus loin que nous.",
        ],
      },
      {
        title: "Le vent d'hiver",
        text: [
          "Le vent d'hiver entre par le trou de la porte,\ns'assoit auprès du feu,\net raconte la mer à ceux qui ne l'ont jamais vue.",
        ],
      },
      {
        title: "Silence",
        text: [
          "Ce n'est pas la neige qui fait taire la forêt,\nc'est le silence qui laisse un peu de place\nà tout ce qui respire encore.",
        ],
      },
    ],
    questions: [
      { q: "Dans le premier poème, la neige est comparée à…", options: ["Une allumeuse de brindilles", "Une vieille femme", "Un bateau", "Un oiseau"], answer: "Une allumeuse de brindilles" },
      { q: "Quelles trois images le recueil écoute-t-il ?", options: ["Neige, vent, silence", "Feu, mer, forêt", "Pluie, nuit, oiseau", "Toit, porte, feu"], answer: "Neige, vent, silence" },
    ],
  },
  {
    id: "livre-seisme",
    subject_id: "svt",
    title: "La nuit où la terre s'est réveillée",
    author: "Documentaire",
    kind: "documentaire",
    summary: "Comment les séismes naissent des plaques, raconté par un sismologue.",
    minutes: 5,
    chapters: [
      {
        title: "1. Sous nos pieds",
        text: [
          "La croûte terrestre n'est pas d'un seul morceau : elle est faite d'une douzaine de grandes plaques qui glissent de quelques centimètres par an, à la vitesse d'un ongle. Personne ne le sent, et pourtant tout bouge.",
          "Quand deux plaques se pressent l'une contre l'autre, la roche se déforme, se tord lentement, sans casser. Des années, parfois, avec le temps d'une génération.",
        ],
      },
      {
        title: "2. Le bruit",
        text: [
          "Et un jour, la roche cède : elle se casse et se replace. C'est ce déplacement brutal que l'on appelle un séisme. Ses ondes traversent le sol et font trembler la mer, les murs et les cœurs.",
          "Les sismographes enregistrent ces ondes. Le sismologue qui les lit peut dire où, quand et avec quelle force le sous-sol a parlé : l'épicentre. Mieux vaut savoir lire ces signes que les craindre.",
        ],
      },
    ],
    questions: [
      { q: "Les plaques tectoniques se déplacent de quelques…", options: ["Centimètres par an", "Mètres par heure", "Kilomètres par seconde", "Micron par siècle"], answer: "Centimètres par an" },
      { q: "Un séisme se produit quand…", options: ["La roche cède brutalement entre deux plaques", "Le vent frappe la croûte", "L'eau chauffe les roches", "La Lune attire la Terre"], answer: "La roche cède brutalement entre deux plaques" },
    ],
  },
  {
    id: "livre-avare",
    subject_id: "francais",
    title: "Le théâtre d'ombres",
    author: "Petite scène à jouer à deux",
    kind: "theatre",
    summary: "Une courte scène comique à lire à deux voix, pour l'atelier théâtre.",
    minutes: 4,
    chapters: [
      {
        title: "La scène",
        text: [
          "MAÎTRE GRIFFON, derrière son paravent : — Entrez, entrez… Toi, tu es trop grand, ça fait de l'ombre sur ma lumière !",
          "LE MACHINISTE : — Mais c'est moi qui tiens les ombres, maître.",
          "MAÎTRE GRIFFON : — Justement ! Fais-toi petit, plus petit, et que ta lanterne arrête de mentir.",
          "LE MACHINISTE, à part : — Quand on n'aime pas l'ombre, il faut supporter le soleil… ou acheter une lampe plus petite.",
          "(Le paravent tombe. On ne voit que des petits pieds et une ampoule qui roule.)",
        ],
      },
    ],
    questions: [
      { q: "Qui est sur scène ?", options: ["Maître Griffon et le machiniste", "Deux chevaliers", "Un juge et un avocat", "Deux enfants"], answer: "Maître Griffon et le machiniste" },
      { q: "Combien de temps dure la scène ?", options: ["Quelques minutes", "Une journée entière", "Un an", "Trois heures"], answer: "Quelques minutes" },
    ],
  },
];
