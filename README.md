# L'Académie de Jana — clone local

Clone fonctionnel de l'application **« L'Académie de Jana — école magique pour apprendre »**
(école de magie pour une élève de 5e), reconstruit à partir du code source de l'application
d'origine, **sans serveur** : toutes les données vivent dans le `localStorage` du navigateur.

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:5173
# ou
npm run build && npm run preview
```

## Ce qui a été cloné

| Écran | Route | Contenu |
|---|---|---|
| Choix du profil | `/` | Château, « Qui entre dans l'Académie ? », profils, accès espace parent |
| Accueil | `/accueil` | Mission du jour, cours du jour, carte de l'Académie, grimoire des matières |
| Matières | `/matieres` | 6 matières, maîtrise par matière, chapitres |
| Détail matière | `/matieres/:id` | Chapitres, quiz, fiches de la Bibliothèque |
| Quiz | `/quiz/:matiere/:chapitre` | 3/5/8 questions, correction, XP, étoiles, cristaux, badges |
| Quêtes | `/quetes` | En cours / à venir / terminées, étapes à énigmes |
| Professeur magique | `/professeur` | Chat avec Dame Morgane (réponses locales, effet de frappe) |
| Fiches & cartes | `/fiches` | Fiches méthodes et cartes mentales |
| Atelier création | `/atelier` | Dessin (canvas), histoire, théâtre, **dictée corrigée**, galerie |
| Calculatrice | `/calculatrice` | Évaluateur d'expressions, fractions, historique |
| Emploi du temps | `/emploi-du-temps` | Semaine de 5e, jour courant mis en avant |
| Temps d'écran | `/temps-ecran` | Graphique 7 jours + répartition par matière |
| Mon profil | `/profil` | Niveau, XP, badges, progression, créations, avatar |
| Espace parent | `/parent` | Suivi, enfants, matières, quêtes, fiches, emploi du temps, code |

## Code d'accès parent

**1234** (modifiable depuis l'onglet « Code parent » de l'espace parent).

## Différences avec l'application d'origine

L'original est un front React (Vite) adossé à un back-end **FastAPI + base de données + IA**
(quiz générés par un modèle, professeur conversationnel en streaming, statistiques serveur).
Ce clone conserve l'interface et les écrans à l'identique, et remplace le back-end par :

- `src/lib/api.ts` — même surface (`apiGet`, `apiPost`, `apiPut`, `apiDelete`, `apiStream`)
  implémentée sur `localStorage` : profils, XP/niveaux, badges, quêtes, fiches, emploi du
  temps, créations, temps d'écran, code parent.
- **Dictée** (`src/data/dictees.ts`) : 5 dictées de 5e lues par la synthèse vocale du navigateur
  (vitesse réglable), correction automatique mot à mot (mots faux, oubliés ou en trop en rouge,
  mots justes en vert), rappel des pièges d'orthographe, et enregistrement de la copie corrigée
  dans « Mes créations ».
- `src/data/seed.ts` — contenu de départ : 6 matières, 22 chapitres, ~80 questions de quiz,
  4 quêtes, 10 fiches, emploi du temps, badges, profils « Jana » et « Léo ».
- **Quiz** : les questions sont tirées d'une banque locale par chapitre (et non générées par IA).
- **Professeur magique** : les réponses sont construites à partir des fiches et chapitres
  (et d'un petit calcul mental), avec le même rendu « streaming ».
- Les images (château, sorcière, carte) sont copiées dans `public/images`, plus aucune
  dépendance à un CDN externe.

Bouton **« Réinitialiser l'Académie »** en bas du menu latéral : remet tout à zéro.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · react-router · TanStack Query ·
framer-motion · recharts · lucide-react · sonner

## Classes de 5e

### Matières (12)
Mathématiques · Français · Histoire-Géo · Anglais · **SVT** · Arts plastiques ·
**Espagnol** · **Physique-Chimie** · **Technologie** · **Éducation musicale** · **Arabe**
(les matières en gras ont été ajoutées à la version d'origine : 5 chapitres,
quiz et fiche méthode pour chacune).

Les matières et chapitres nouveaux sont fusionnés automatiquement dans le
`localStorage` existant au démarrage (`withNewSubjects` dans `src/lib/api.ts`) :
aucun profil ne perd ses progrès et personne n'a besoin de vider le cache.

### Carte & quiz du monde
`/globe` — carte SVG classique (177 pays, `src/data/world-shapes.json`), fiche
pays (capitale, monnaie, langue, superficie, population, histoire) et quiz de
8 questions par série (capitale, monnaie, « clique sur le pays »).

### Dictée
Onglet « Dictée » de l'atelier : 5 dictées de 5e, correction mot à mot
(Levenshtein) avec score et diff coloré.

### La Bibliothèque
`/bibliotheque` — 7 livres courts (roman, mythe, documentaire, poèmes, théâtre)
avec 2 questions de compréhension par livre, et récompense XP/étoiles.

**Ajouter un livre sans coder** : espace parent (code 1234) → onglet
**Bibliothèque**. Deux zones de texte suffisent :
- Chapitres, une ligne par chapitre : `Titre | paragraphe ; paragraphe`
- Questions, une ligne par question : `Question | bonne réponse | mauvaise 1 | mauvaise 2 | mauvaise 3`

Les livres ajoutés apparaissent aussitôt dans la Bibliothèque de Jana.

### Dame Morgane, la professeure
`/professeur` — deux façons de répondre (boutons dans la colonne de gauche) :

**« Explications directes, avec exemples » (par défaut)** : elle répond vraiment —
la réponse, l'explication, un exemple résolu et un exercice à faire.

**« Méthode socratique (indices d'abord) »** : elle ne donne pas la réponse au premier message :

1. **relance** : elle te demande ce que tu sais déjà ;
2. **indice** : tape `indice` (ou « aide », « je ne sais pas ») → un seul indice,
   tiré de la fiche ou du chapitre le plus proche ;
3. **explication** : après ton essai (ou si tu redemandes la réponse) → la leçon
   complète, pas à pas.

Le moteur est dans `src/lib/socratic.ts` et `src/lib/provider.ts`.

**Connecter une IA (clé gratuite, sans carte bancaire)** — bouton
« Connecter une IA gratuite » :
| Fournisseur | Clé gratuite | Modèle par défaut |
|---|---|---|
| Google Gemini (Google AI Studio) | https://aistudio.google.com/apikey | gemini-2.0-flash |
| Groq | https://console.groq.com/keys | llama-3.3-70b-versatile |
| OpenRouter | https://openrouter.ai/keys | llama-3.3-70b-instruct:free |
| Mistral | https://console.mistral.ai/api-keys | mistral-small-latest |
| OpenAI | payant | gpt-4o-mini |

La clé reste dans le navigateur (`localStorage`) et n'est envoyée qu'au
fournisseur choisi. Si l'appel échoue (clé refusée, hors ligne), l'app répond
avec ses leçons locales au lieu de laisser l'élève sans réponse.

### Espace parent
Code par défaut : **1234**.

## Scripts de données

- `node scripts/serve-dist.mjs 59559` — serveur statique avec repli SPA (nécessaire
  pour ouvrir `/globe` ou `/atelier` en direct).
- `node scripts/build-shapes.mjs` — reconstruit `src/data/world-shapes.json`
  à partir de Natural Earth (cache dans `.cache/`).
- `node scripts/build-countries.mjs` — reconstruit `src/data/countries.json`.
