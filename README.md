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
