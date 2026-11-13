// ---------------------------------------------------------------------------
// Petites connaissances « hors fiche » de Dame Morgane.
// Le contenu du programme (fiches, chapitres, quiz) ne suffit pas pour les
// questions de tous les jours : conjugaison d'un verbe précis, calcul posé,
// traduction d'un mot, définition. Ces réponses sont calculées, pas devinées.
// ---------------------------------------------------------------------------

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();

// ---------------------------------------------------------------------------
// Conjugaison française
// ---------------------------------------------------------------------------
type Family = "er" | "ir" | "re" | "irr";

type Verb = {
  inf: string;
  family: Family;
  /** participe passé */
  pp: string;
  /** auxiliaire */
  aux: "avoir" | "etre";
  /** présent, 6 personnes */
  pres: string[];
  /** futur simple, 6 personnes */
  fut?: string[];
  /** passé simple, 6 personnes (3e pl. pour -er) */
  ps?: string[];
  /** imparfait déduit du présent si absent */
  imp?: string[];
  /** subjonctif présent (3e pl. pour former l'imparfait du subjonctif) */
  subj?: string[];
  /** impératif (tu, nous, vous) */
  imper?: string[];
  note?: string;
};

const P = ["je", "tu", "il", "nous", "vous", "ils"];

/** Verbes irréguliers les plus fréquents du programme de 5e. */
const IRREGULIERS: Record<string, Omit<Verb, "inf" | "family">> = {
  être: {
    pp: "été", aux: "avoir",
    pres: ["suis", "es", "est", "sommes", "êtes", "sont"],
    fut: ["serai", "seras", "sera", "serons", "serez", "seront"],
    ps: ["fus", "fus", "fut", "fûmes", "fûtes", "furent"],
    imp: ["étais", "étais", "était", "étions", "étiez", "étaient"],
    subj: ["sois", "sois", "soit", "soyons", "soyez", "soient"],
    imper: ["sois", "soyons", "soyez"],
  },
  avoir: {
    pp: "eu", aux: "avoir",
    pres: ["ai", "as", "a", "avons", "avez", "ont"],
    fut: ["aurai", "auras", "aura", "aurons", "aurez", "auront"],
    ps: ["eus", "eus", "eut", "eûmes", "eûtes", "eurent"],
    imp: ["avais", "avais", "avait", "avions", "aviez", "avaient"],
    subj: ["aie", "aies", "ait", "ayons", "ayez", "aient"],
    imper: ["aie", "ayons", "ayez"],
  },
  aller: {
    pp: "allé", aux: "etre",
    pres: ["vais", "vas", "va", "allons", "allez", "vont"],
    fut: ["irai", "iras", "ira", "irons", "irez", "iront"],
    ps: ["allai", "allas", "alla", "allâmes", "allâtes", "allèrent"],
    imp: ["allais", "allais", "allait", "allions", "alliez", "allaient"],
    subj: ["aille", "ailles", "aille", "allions", "alliez", "aillent"],
    imper: ["va", "allons", "allez"],
  },
  faire: {
    pp: "fait", aux: "avoir",
    pres: ["fais", "fais", "fait", "faisons", "faites", "font"],
    fut: ["ferai", "feras", "fera", "ferons", "ferez", "feront"],
    ps: ["fis", "fis", "fit", "fîmes", "fîtes", "firent"],
    imp: ["faisais", "faisais", "faisait", "faisions", "faisiez", "faisaient"],
    subj: ["fasse", "fasses", "fasse", "fassions", "fassiez", "fassent"],
    imper: ["fais", "faisons", "faites"],
  },
  dire: {
    pp: "dit", aux: "avoir",
    pres: ["dis", "dis", "dit", "disons", "dites", "disent"],
    fut: ["dirai", "diras", "dira", "dirons", "direz", "diront"],
    ps: ["dis", "dis", "dit", "dîmes", "dîtes", "dirent"],
    imp: ["disais", "disais", "disait", "disions", "disiez", "disaient"],
    subj: ["dise", "dises", "dise", "disions", "disiez", "disent"],
    imper: ["dis", "disons", "dites"],
  },
  prendre: {
    pp: "pris", aux: "avoir",
    pres: ["prends", "prends", "prend", "prenons", "prenez", "prennent"],
    fut: ["prendrai", "prendras", "prendra", "prendrons", "prendrez", "prendront"],
    ps: ["pris", "pris", "prit", "prîmes", "prîtes", "prirent"],
    imp: ["prenais", "prenais", "prenait", "prenions", "preniez", "prenaient"],
    subj: ["prenne", "prennes", "prenne", "prenions", "preniez", "prennent"],
    imper: ["prends", "prenons", "prenez"],
  },
  venir: {
    pp: "venu", aux: "etre",
    pres: ["viens", "viens", "vient", "venons", "venez", "viennent"],
    fut: ["viendrai", "viendras", "viendra", "viendrons", "viendrez", "viendront"],
    ps: ["vins", "vins", "vint", "vînmes", "vîntes", "vinrent"],
    imp: ["venais", "venais", "venait", "venions", "veniez", "venaient"],
    subj: ["vienne", "viennes", "vienne", "venions", "veniez", "viennent"],
    imper: ["viens", "venons", "venez"],
  },
  voir: {
    pp: "vu", aux: "avoir",
    pres: ["vois", "vois", "voit", "voyons", "voyez", "voient"],
    fut: ["verrai", "verras", "verra", "verrons", "verrez", "verront"],
    ps: ["vis", "vis", "vit", "vîmes", "vîtes", "virent"],
    imp: ["voyais", "voyais", "voyait", "voyions", "voyiez", "voyaient"],
    subj: ["voie", "voies", "voie", "voyions", "voyiez", "voient"],
    imper: ["vois", "voyons", "voyez"],
  },
  pouvoir: {
    pp: "pu", aux: "avoir",
    pres: ["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"],
    fut: ["pourrai", "pourras", "pourra", "pourrons", "pourrez", "pourront"],
    ps: ["pus", "pus", "put", "pûmes", "pûtes", "purent"],
    imp: ["pouvais", "pouvais", "pouvait", "pouvions", "pouviez", "pouvaient"],
    subj: ["puisse", "puisses", "puisse", "puissions", "puissiez", "puissent"],
    note: "Pas d'impératif.",
  },
  vouloir: {
    pp: "voulu", aux: "avoir",
    pres: ["veux", "veux", "veut", "voulons", "voulez", "veulent"],
    fut: ["voudrai", "voudras", "voudra", "voudrons", "voudrez", "voudront"],
    ps: ["voulus", "voulus", "voulut", "voulûmes", "voulûtes", "voulurent"],
    imp: ["voulais", "voulais", "voulait", "voulions", "vouliez", "voulaient"],
    subj: ["veuille", "veuilles", "veuille", "voulions", "vouliez", "veuillent"],
    imper: ["veuille", "veuillons", "veuillez"],
  },
  devoir: {
    pp: "dû", aux: "avoir",
    pres: ["dois", "dois", "doit", "devons", "devez", "doivent"],
    fut: ["devrai", "devras", "devra", "devrons", "devrez", "devront"],
    ps: ["dus", "dus", "dut", "dûmes", "dûtes", "durent"],
    imp: ["devais", "devais", "devait", "devions", "deviez", "devaient"],
    subj: ["doive", "doives", "doive", "devions", "deviez", "doivent"],
  },
  savoir: {
    pp: "su", aux: "avoir",
    pres: ["sais", "sais", "sait", "savons", "savez", "savent"],
    fut: ["saurai", "sauras", "saura", "saurons", "saurez", "sauront"],
    ps: ["sus", "sus", "sut", "sûmes", "sûtes", "surent"],
    imp: ["savais", "savais", "savait", "savions", "saviez", "savaient"],
    subj: ["sache", "saches", "sache", "sachions", "sachiez", "sachent"],
    imper: ["sache", "sachons", "sachez"],
  },
  coudre: {
    pp: "cousu", aux: "avoir",
    pres: ["couds", "couds", "coud", "cousons", "cousez", "cousent"],
    fut: ["coudrai", "coudras", "coudra", "coudrons", "coudrez", "coudront"],
    ps: ["cousis", "cousis", "cousit", "cousîmes", "cousîtes", "cousirent"],
    imp: ["cousais", "cousais", "cousait", "cousions", "cousiez", "cousaient"],
    subj: ["couse", "couses", "couse", "cousions", "cousiez", "cousent"],
    imper: ["couds", "cousons", "cousez"],
    note: "On dit « je couds » (d muet), mais « nous cousons » : le d devient s.",
  },
  coudre2: {
    pp: "cousu", aux: "avoir",
    pres: ["couds", "couds", "coud", "cousons", "cousez", "cousent"],
  },
  mettre: {
    pp: "mis", aux: "avoir",
    pres: ["mets", "mets", "met", "mettons", "mettez", "mettent"],
    fut: ["mettrai", "mettras", "mettra", "mettrons", "mettrez", "mettront"],
    ps: ["mis", "mis", "mit", "mîmes", "mîtes", "mirent"],
    imp: ["mettais", "mettais", "mettait", "mettions", "mettiez", "mettaient"],
    subj: ["mette", "mettes", "mette", "mettions", "mettiez", "mettent"],
    imper: ["mets", "mettons", "mettez"],
  },
  partir: {
    pp: "parti", aux: "etre",
    pres: ["pars", "pars", "part", "partons", "partez", "partent"],
    fut: ["partirai", "partiras", "partira", "partirons", "partirez", "partiront"],
    ps: ["partis", "partis", "partit", "partîmes", "partîtes", "partirent"],
    imp: ["partais", "partais", "partait", "partions", "partiez", "partaient"],
    subj: ["parte", "partes", "parte", "partions", "partiez", "partent"],
    imper: ["pars", "partons", "partez"],
  },
  sortir: {
    pp: "sorti", aux: "etre",
    pres: ["sors", "sors", "sort", "sortons", "sortez", "sortent"],
    fut: ["sortirai", "sortiras", "sortira", "sortirons", "sortirez", "sortiront"],
    ps: ["sortis", "sortis", "sortit", "sortîmes", "sortîtes", "sortirent"],
    imp: ["sortais", "sortais", "sortait", "sortions", "sortiez", "sortaient"],
    subj: ["sorte", "sortes", "sorte", "sortions", "sortiez", "sortent"],
    imper: ["sors", "sortons", "sortez"],
  },
  ecrire: {
    pp: "écrit", aux: "avoir",
    pres: ["écris", "écris", "écrit", "écrivons", "écrivez", "écrivent"],
    fut: ["écrirai", "écriras", "écrira", "écrirons", "écrirez", "écriront"],
    ps: ["écrivis", "écrivis", "écrivit", "écrivîmes", "écrivîtes", "écrivirent"],
    imp: ["écrivais", "écrivais", "écrivait", "écrivions", "écriviez", "écrivaient"],
    subj: ["écrive", "écrives", "écrive", "écrivions", "écriviez", "écrivent"],
    imper: ["écris", "écrivons", "écrivez"],
  },
  lire: {
    pp: "lu", aux: "avoir",
    pres: ["lis", "lis", "lit", "lisons", "lisez", "lisent"],
    fut: ["lirai", "liras", "lira", "lirons", "lirez", "liront"],
    ps: ["lus", "lus", "lut", "lûmes", "lûtes", "lurent"],
    imp: ["lisais", "lisais", "lisait", "lisions", "lisiez", "lisaient"],
    subj: ["lise", "lises", "lise", "lisions", "lisiez", "lisent"],
    imper: ["lis", "lisons", "lisez"],
  },
  boire: {
    pp: "bu", aux: "avoir",
    pres: ["bois", "bois", "boit", "buvons", "buvez", "boivent"],
    fut: ["boirai", "boiras", "boira", "boirons", "boirez", "boiront"],
    ps: ["bus", "bus", "but", "bûmes", "bûtes", "burent"],
    imp: ["buvais", "buvais", "buvait", "buvions", "buviez", "buvaient"],
    subj: ["boive", "boives", "boive", "buvions", "buviez", "boivent"],
  },
  dormir: {
    pp: "dormi", aux: "avoir",
    pres: ["dors", "dors", "dort", "dormons", "dormez", "dorment"],
    fut: ["dormirai", "dormiras", "dormira", "dormirons", "dormirez", "dormiront"],
    ps: ["dormis", "dormis", "dormit", "dormîmes", "dormîtes", "dormirent"],
    imp: ["dormais", "dormais", "dormait", "dormions", "dormiez", "dormaient"],
    subj: ["dorme", "dormes", "dorme", "dormions", "dormiez", "dorment"],
    imper: ["dors", "dormons", "dormez"],
  },
  manger: {
    pp: "mangé", aux: "avoir",
    pres: ["mange", "manges", "mange", "mangeons", "mangez", "mangent"],
    fut: ["mangerai", "mangeras", "mangera", "mangerons", "mangerez", "mangeront"],
    ps: ["mangeai", "mangeas", "mangea", "mangeâmes", "mangeâtes", "mangèrent"],
    imper: ["mange", "mangeons", "mangez"],
    note: "« nous mangeons » garde le e pour conserver le son [ʒ].",
  },
  appeler: {
    pp: "appelé", aux: "avoir",
    pres: ["appelle", "appelles", "appelle", "appelons", "appelez", "appellent"],
    fut: ["appellerai", "appelleras", "appellera", "appellerons", "appellerez", "appelleront"],
    ps: ["appelai", "appelas", "appela", "appelâmes", "appelâtes", "appelèrent"],
    imper: ["appelle", "appelons", "appelez"],
    note: "Double le l devant un e muet : j'appelle, nous appelons.",
  },
};

/** Terminaisons régulières. */
const TERM = {
  er: {
    pres: ["e", "es", "e", "ons", "ez", "ent"],
    imp: ["ais", "ais", "ait", "ions", "iez", "aient"],
    fut: ["erai", "eras", "era", "erons", "erez", "eront"],
    ps: ["ai", "as", "a", "âmes", "âtes", "èrent"],
    subj: ["e", "es", "e", "ions", "iez", "ent"],
    pp: "é",
  },
  ir: {
    pres: ["is", "is", "it", "issons", "issez", "issent"],
    imp: ["issais", "issais", "issait", "issions", "issiez", "issaient"],
    fut: ["irai", "iras", "ira", "irons", "irez", "iront"],
    ps: ["is", "is", "it", "îmes", "îtes", "irent"],
    subj: ["isse", "isses", "isse", "issions", "issiez", "issent"],
    pp: "i",
  },
  re: {
    pres: ["s", "s", "", "ons", "ez", "ent"],
    imp: ["ais", "ais", "ait", "ions", "iez", "aient"],
    fut: ["rai", "ras", "ra", "rons", "rez", "ront"],
    ps: ["is", "is", "it", "îmes", "îtes", "irent"],
    subj: ["e", "es", "e", "ions", "iez", "ent"],
    pp: "u",
  },
};

/** Radicaux des verbes en -ir du type « finir » (2e groupe) vs « partir » (3e groupe). */
const IR_2E = /(fin|chois|grand|roug|réuss|rempl|obé|pun|guér|nourr|sal|un|fourn|aplat|atterr|ralent|bond|pâl|vieill|embell|établ|défin|réfléch|applaud|bén|flétr|fleur|dur|moll|noirc|ver|jaun|blanch|éclair|affaibl|enrich|obéi|trah|rétréc|surg|resplend|compat|fourb|gar|invest)/;

/** Verbes en -ir du 2e groupe les plus courants (présent en -is/-issons). */
const DEUXIEME: Record<string, string> = {
  finir: "finis", choisir: "choisis", grandir: "grandis", réussir: "réussis", remplir: "remplis",
  obéir: "obéis", punir: "punis", guérir: "guéris", nourrir: "nourris", salir: "salis",
  unir: "unis", fournir: "fournis", aplatir: "aplatis", atterrir: "atterris", ralentir: "ralentis",
  bondir: "bondis", pâlir: "pâlis", vieillir: "vieillis", embellir: "embellis", établir: "établis",
  définir: "définis", réfléchir: "réfléchis", applaudir: "applaudis", fleurir: "fleuris", durcir: "durcis",
  rougir: "rougis", noircir: "noircis", jaunir: "jaunis", blanchir: "blanchis", éclaircir: "éclaircis",
  affaiblir: "affaiblis", enrichir: "enrichis", trahir: "trahis", surgir: "surgis", frémir: "frémis",
};

/** Construit un verbe régulier. */
function regular(inf: string): Verb {
  if (inf.endsWith("er")) {
    const rad = inf.slice(0, -2);
    const t = TERM.er;
    return {
      inf,
      family: "er",
      pp: rad + t.pp,
      aux: "avoir",
      pres: t.pres.map((e) => rad + e),
      imp: t.imp.map((e) => rad + e),
      fut: t.fut.map((e) => rad + e),
      ps: t.ps.map((e) => rad + e),
      subj: t.subj.map((e) => rad + e),
      imper: [t.pres[0] && rad + t.pres[0], rad + "ons", rad + "ez"],
    };
  }
  if (inf.endsWith("ir")) {
    const rad = inf.slice(0, -2);
    const t = IR_2E.test(rad) ? TERM.ir : TERM.re; // 3e groupe : « je pars », « je sors »
    const is2 = IR_2E.test(rad);
    return {
      inf,
      family: is2 ? "ir" : "re",
      pp: is2 ? rad + "i" : rad + "u",
      aux: "avoir",
      pres: is2 ? t.pres.map((e) => rad + e) : [rad + "s", rad + "s", rad + "t", rad + "ons", rad + "ez", rad + "ent"],
      imp: [rad + "ais", rad + "ais", rad + "ait", rad + "ions", rad + "iez", rad + "aient"],
      fut: is2 ? [inf + "ai", inf + "as", inf + "a", inf + "ons", inf + "ez", inf + "ont"] : [rad + "rai", rad + "ras", rad + "ra", rad + "rons", rad + "rez", rad + "ront"],
      ps: is2 ? [rad + "is", rad + "is", rad + "it", rad + "îmes", rad + "îtes", rad + "irent"] : [rad + "is", rad + "is", rad + "it", rad + "îmes", rad + "îtes", rad + "irent"],
      subj: is2 ? [rad + "isse", rad + "isses", rad + "isse", rad + "issions", rad + "issiez", rad + "issent"] : [rad + "e", rad + "es", rad + "e", rad + "ions", rad + "iez", rad + "ent"],
      imper: is2 ? [rad + "is", rad + "issons", rad + "issez"] : [rad + "s", rad + "ons", rad + "ez"],
    };
  }
  // « coudre » → coud-, « prendre » → prend- (le d fait partie du radical)
  const rad = /(dre|ndre|ttre|mettre)$/.test(inf) ? inf.slice(0, -1) : inf.replace(/re$/, "");
  const t = TERM.re;
  return {
    inf,
    family: "re",
    pp: rad + t.pp,
    aux: "avoir",
    pres: t.pres.map((e) => rad + e),
    imp: t.imp.map((e) => rad + e),
    fut: t.fut.map((e) => rad + e),
    ps: t.ps.map((e) => rad + e),
    subj: t.subj.map((e) => rad + e),
    imper: [rad + "s", rad + "ons", rad + "ez"],
  };
}

/** Retrouve un verbe : irrégulier connu, sinon forme régulière. */
export function findVerb(word: string): Verb | null {
  const w = norm(word).replace(/^(se |s')/, "");
  if (w.length < 3) return null;
  if (IRREGULIERS[w]) return { inf: w, family: "irr", ...IRREGULIERS[w] };
  // « etre » sans accent (saisie rapide) → « être »
  const accents: Record<string, string> = { etre: "être", ecrire: "écrire", "meme": "même" };
  if (accents[w] && IRREGULIERS[accents[w]]) return { inf: accents[w], family: "irr", ...IRREGULIERS[accents[w]] };
  if (DEUXIEME[w]) {
    const rad = w.slice(0, -2);
    return {
      inf: w,
      family: "ir",
      pp: rad + "i",
      aux: "avoir",
      pres: [rad + "is", rad + "is", rad + "it", rad + "issons", rad + "issez", rad + "issent"],
      imp: [rad + "issais", rad + "issais", rad + "issait", rad + "issions", rad + "issiez", rad + "issaient"],
      fut: [w + "ai", w + "as", w + "a", w + "ons", w + "ez", w + "ont"],
      ps: [rad + "is", rad + "is", rad + "it", rad + "îmes", rad + "îtes", rad + "irent"],
      subj: [rad + "isse", rad + "isses", rad + "isse", rad + "issions", rad + "issiez", rad + "issent"],
      imper: [rad + "is", rad + "issons", rad + "issez"],
    };
  }
  if (/(er|ir|re)$/.test(w)) {
    const v = regular(w);
    // Garde-fous : pas de verbe inventé sur un mot courant.
    if (!v.pres[0] || v.pres[0].length < 2) return null;
    return v;
  }
  return null;
}

/** « je » devient « j' » devant une voyelle. */
function pronoun(i: number, form: string): string {
  if (i === 0 && /^[aeiouyâêîôûéè]/.test(form)) return "j'";
  return `${P[i]} `;
}

const TENSES: Record<string, { label: string; pick: (v: Verb) => string[] | undefined; explain: string }> = {
  present: {
    label: "présent",
    pick: (v) => v.pres,
    explain: "Le présent : ce qui se passe maintenant, ou une habitude.",
  },
  imparfait: {
    label: "imparfait",
    pick: (v) => v.imp ?? deriveImparfait(v),
    explain: "L'imparfait : le décor, une action qui dure ou se répète dans le passé.",
  },
  futur: {
    label: "futur simple",
    pick: (v) => v.fut ?? v.pres.map((f) => (f.endsWith("e") ? f.slice(0, -1) : f) + (v.family === "er" ? "erai" : "rai")),
    explain: "Le futur simple : ce qui arrivera plus tard.",
  },
  "passe simple": {
    label: "passé simple",
    pick: (v) => v.ps ?? derivePasseSimple(v),
    explain: "Le passé simple : une action courte et terminée, dans un récit au passé.",
  },
  "passe compose": {
    label: "passé composé",
    pick: (v) => P.map((_, i) => (i === 0 ? "" : "") + auxForm(v, i)),
    explain: "Le passé composé : auxiliaire au présent + participe passé.",
  },
  subjonctif: {
    label: "subjonctif présent",
    pick: (v) => v.subj ?? deriveSubjonctif(v),
    explain: "Le subjonctif présent s'emploie après « il faut que », « je veux que ».",
  },
  conditionnel: {
    label: "conditionnel présent",
    pick: (v) => (v.fut ?? []).map((f) => f.replace(/ai$|as$|a$|ons$|ez$|ont$/, "") + ""),
    explain: "Le conditionnel : une action qui dépend d'une condition (« si…, je… »).",
  },
};

function deriveImparfait(v: Verb): string[] {
  const base = v.pres[3].replace(/ons$/, "");
  return ["ais", "ais", "ait", "ions", "iez", "aient"].map((e) => base + e);
}

function derivePasseSimple(v: Verb): string[] {
  if (v.family === "er") {
    const rad = v.inf.slice(0, -2);
    return TERM.er.ps.map((e) => rad + e);
  }
  if (v.family === "ir") {
    const rad = v.inf.slice(0, -2);
    return ["is", "is", "it", "îmes", "îtes", "irent"].map((e) => rad + e);
  }
  // 3e groupe : le passé simple se forme sur le participe passé quand il finit par -u/-i.
  const base = v.pp.replace(/[ts]$/, "");
  return ["s", "s", "t", "^mes", "^tes", "rent"].map((e) => e.startsWith("^") ? base + e.replace("^", "û") : base + e);
}

function deriveSubjonctif(v: Verb): string[] {
  const base = v.pres[5].replace(/ent$/, "");
  return ["e", "es", "e", "ions", "iez", "ent"].map((e) => base + e);
}

const AGREEMENTS = ["", "e", "", "s", "s", "s"]; // je, tu, il, nous, vous, ils (accord au féminin pour « je/tu »)

function auxForm(v: Verb, i: number): string {
  const aux = v.aux === "etre" ? IRREGULIERS["être"] : IRREGULIERS["avoir"];
  const a = aux.pres[i];
  const pp = v.pp;
  const agree = v.aux === "etre" ? pp + AGREEMENTS[i] : pp;
  const pr = i === 0 && /^[aeiouyâêîôûéè]/.test(a) ? "j'" : `${P[i]} `;
  return `${pr}${a} ${agree}`;
}

const TENSE_WORDS: [RegExp, keyof typeof TENSES][] = [
  [/passe compose/, "passe compose"],
  [/plus-que-parfait/, "imparfait"],
  [/passe simple/, "passe simple"],
  [/imparfait/, "imparfait"],
  [/futur/, "futur"],
  [/conditionnel/, "conditionnel"],
  [/subjonctif/, "subjonctif"],
  [/present/, "present"],
];

/** Conjugue un verbe demandé, avec tableau complet et explication. */
export function conjugationAnswer(question: string): string | null {
  const q = norm(question);
  if (!/(conjugu|conjugaison)/.test(q) && !/(au|en) (present|futur|imparfait|passe simple)/.test(q)) return null;

  // Le verbe : le mot juste après « verbe » (ou « conjugue »), sinon un infinitif connu.
  const known = new Set([...Object.keys(IRREGULIERS), ...Object.keys(DEUXIEME)]);
  const afterVerbe = q.match(/verbe\s+(?:de\s+|du\s+|d')?([a-z' -]{3,20})/);
  const afterConj = q.match(/(?:conjugue|conjuguer|conjugaison de|conjugaison du)\s+(?:le\s+|la\s+|les\s+|verbe\s+)?([a-z' -]{3,20})/);
  const pick = (t: string | undefined) => t?.trim().split(" ")[0] ?? "";
  const direct = [pick(afterVerbe?.[1]), pick(afterConj?.[1])].filter(Boolean);
  const infinitifs = q.match(/\b([a-z]{3,}(?:er|ir|re|oir))\b/g) ?? [];

  // On privilégie un verbe réellement connu, pour ne pas inventer une conjugaison.
  const target =
    direct.map((w) => (known.has(w) ? findVerb(w) : null)).find(Boolean) ??
    infinitifs.map((w) => (known.has(w) ? findVerb(w) : null)).find(Boolean) ??
    direct.map(findVerb).find(Boolean) ??
    null;
  if (!target) return null;

  const tenseKey = TENSE_WORDS.find(([re]) => re.test(q))?.[1] ?? "present";
  const tense = TENSES[tenseKey];
  const forms = tense.pick(target) ?? [];
  if (forms.length < 6) return null;

  const table = forms
    .map((f, i) => (/^(je |j'|tu |il |nous |vous |ils |elle |on )/.test(f) ? f : `${pronoun(i, f)}${f}`))
    .join(" · ");
  const pp = target.pp;
  const aux = target.aux === "etre" ? "être" : "avoir";

  const lines = [
    `**${target.inf.charAt(0).toUpperCase() + target.inf.slice(1)} au ${tense.label}**`,
    table,
    "",
    `${tense.explain}`,
    `Participe passé : **${pp}** (passé composé avec l'auxiliaire *${aux}* : ${auxForm(target, 0)}).`,
  ];
  if (target.note) lines.push(`⚠️ ${target.note}`);
  if (target.family === "irr") lines.push("C'est un verbe irrégulier : ses formes ne suivent pas un modèle régulier, il faut les apprendre par cœur.");
  lines.push("", `**À toi :** complète « hier, je ___ » avec ce verbe au ${tense.label} — écris ta réponse, je corrige.`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Calcul posé
// ---------------------------------------------------------------------------
function evalFraction(expr: string): { value: number; shown: string; steps: string[] } | null {
  const clean = expr.replace(/\s+/g, "").replace(/,/g, ".").replace(/x/gi, "*").replace(/÷/g, "/").replace(/:/g, "/");
  if (!/^[-+*/.\d/()]+$/.test(clean)) return null;
  if (!/\d/.test(clean) || !/[-+*/]/.test(clean)) return null;

  const steps: string[] = [];
  let shown = clean;

  // Fraction simple seule : on l'écrit aussi en nombre décimal.
  const single = clean.match(/^(\d+)\/(\d+)$/);
  if (single) {
    const v = Number(single[1]) / Number(single[2]);
    steps.push(`Une fraction, c'est une division : ${single[1]} ÷ ${single[2]} = ${trim(v)}.`);
    return { value: v, shown: trim(v), steps };
  }

  // Somme de fractions de même dénominateur : on garde l'écriture fractionnaire.
  const sameDen = clean.match(/^(\d+)\/(\d+)([+-])(\d+)\/(\d+)$/);
  if (sameDen && sameDen[2] === sameDen[5]) {
    const [a, b, op, c] = [Number(sameDen[1]), Number(sameDen[2]), sameDen[3], Number(sameDen[4])];
    const num = op === "+" ? a + c : a - c;
    const g = (x: number, y: number): number => (y === 0 ? x : g(y, x % y));
    const div = g(Math.abs(num), b) || 1;
    const simp = `${num / div}/${b / div}`;
    steps.push(`Les dénominateurs sont égaux (${b}) : on additionne les numérateurs → ${a} ${op} ${c} = ${num}.`);
    steps.push(`Résultat : ${num}/${b}${div > 1 ? `, que l'on simplifie en ${simp}` : ""}.`);
    return { value: num / b, shown: div > 1 ? `${simp} (soit ${trim(num / b)})` : `${num}/${b}`, steps };
  }

  // Somme de deux fractions de dénominateurs différents : on met au même dénominateur.
  const twoFrac = clean.match(/^(\d+)\/(\d+)([+-])(\d+)\/(\d+)$/);
  if (twoFrac) {
    const [a, b, c, d] = [Number(twoFrac[1]), Number(twoFrac[2]), Number(twoFrac[4]), Number(twoFrac[5])];
    const op = twoFrac[3];
    const num = op === "+" ? a * d + c * b : a * d - c * b;
    const den = b * d;
    const g = (x: number, y: number): number => (y === 0 ? x : g(y, x % y));
    const div = g(Math.abs(num), den) || 1;
    steps.push(`Les dénominateurs sont différents : je mets au même dénominateur (${b} × ${d} = ${den}).`);
    steps.push(`${a}/${b} = ${a * d}/${den} et ${c}/${d} = ${c * b}/${den}.`);
    steps.push(`${op === "+" ? "J'additionne" : "Je soustrais"} les numérateurs : ${num}/${den}${div > 1 ? ` = ${num / div}/${den / div}` : ""}.`);
    return { value: num / den, shown: div > 1 ? `${num / div}/${den / div} (soit ${trim(num / den)})` : `${num}/${den} (soit ${trim(num / den)})`, steps };
  }

  // Fractions simples a/b
  const frac = /(\d+)\/(\d+)/g;
  if (frac.test(clean)) {
    shown = clean.replace(frac, (_m, a, b) => {
      const v = Number(a) / Number(b);
      steps.push(`Je transforme ${a}/${b} en nombre : ${a} ÷ ${b} = ${trim(v)}.`);
      return trim(v);
    });
  }

  // Fractions avec la même opération : on calcule étape par étape.
  let value: number;
  try {
    value = Number(
      // eslint-disable-next-line no-new-func
      Function(`"use strict";return (${shown})`)(),
    );
  } catch {
    return null;
  }
  if (!Number.isFinite(value)) return null;

  if (steps.length === 0) {
    // Calcul avec les priorités : on montre un ordre de calcul lisible.
    const mult = clean.match(/(-?\d+(?:\.\d+)?)\s*\*\s*(-?\d+(?:\.\d+)?)/);
    if (mult) steps.push(`D'abord la multiplication : ${mult[1]} × ${mult[2]} = ${trim(Number(mult[1]) * Number(mult[2]))}.`);
    steps.push("Ensuite on additionne (ou on soustrait) dans l'ordre, de gauche à droite.");
  } else {
    steps.push("Puis j'applique l'opération restante.");
  }
  return { value, shown: trim(value), steps };
}

const trim = (n: number) => String(Math.round(n * 10000) / 10000).replace(".", ",");

/** Calcule une expression mathématique simple (fractions acceptées). */
export function mathAnswer(question: string): string | null {
  const q = norm(question);
  const exprMatch = question.match(/(-?\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?(?:\s*[-+*/x:×÷]\s*-?\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?)+)/);
  if (!exprMatch) return null;
  if (!/(calcul|combien|font|fait|resultat|result|combien vaut|pose)/.test(q) && !/[+*/]/.test(exprMatch[1])) return null;
  const res = evalFraction(exprMatch[1]);
  if (!res) return null;
  return [
    `**${exprMatch[1].replace(/\s+/g, " ").trim()} = ${res.shown}**`,
    "",
    "**Étapes :**",
    ...res.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "**À retenir :** parenthèses d'abord, puis × et ÷, enfin + et −.",
    "",
    "**À toi :** refais le calcul seul sur ton cahier, puis demande-moi de vérifier.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Vocabulaire espagnol / anglais (mots courants du programme)
// ---------------------------------------------------------------------------
const ESP: Record<string, string> = {
  hola: "bonjour", adios: "au revoir", gracias: "merci", "por favor": "s'il te plaît", si: "oui", no: "non",
  "buenos dias": "bonjour (le matin)", "buenas noches": "bonne nuit", amigo: "ami", amiga: "amie",
  casa: "maison", escuela: "école", libro: "livre", mesa: "table", agua: "eau", pan: "pain",
  perro: "chien", gato: "chat", sol: "soleil", luna: "lune", dia: "jour", noche: "nuit",
  comer: "manger", hablar: "parler", vivir: "vivre", tener: "avoir", ser: "être", estar: "être (se trouver)",
  grande: "grand", pequeno: "petit", bueno: "bon", malo: "mauvais", rojo: "rouge", azul: "bleu",
  uno: "un", dos: "deux", tres: "trois", cuatro: "quatre", cinco: "cinq", familia: "famille",
  madre: "mère", padre: "père", hermano: "frère", hermana: "sœur", trabajar: "travailler",
};

// ---------------------------------------------------------------------------
// Traductions français ↔ anglais / espagnol (mots et expressions du programme)
// ---------------------------------------------------------------------------
const EN: Record<string, string> = {
  bonjour: "hello (ou good morning le matin)", salut: "hi", "au revoir": "goodbye", merci: "thank you", "s'il te plaît": "please",
  "s'il vous plaît": "please", oui: "yes", non: "no", "excuse-moi": "excuse me", pardon: "sorry",
  "comment vas-tu": "how are you?", "ça va": "I'm fine", "je m'appelle": "my name is", "comment t'appelles-tu": "what's your name?",
  maison: "house", école: "school", livre: "book", table: "table", eau: "water", pain: "bread", chien: "dog", chat: "cat",
  soleil: "sun", lune: "moon", jour: "day", nuit: "night", manger: "to eat", parler: "to speak", vivre: "to live",
  avoir: "to have", être: "to be", grand: "big", petit: "small", bon: "good", mauvais: "bad", rouge: "red", bleu: "blue",
  un: "one", deux: "two", trois: "three", quatre: "four", cinq: "five", famille: "family", mère: "mother", père: "father",
  frère: "brother", sœur: "sister", ami: "friend", amie: "friend", travailler: "to work", jouer: "to play",
  "j'aime": "I like", "je n'aime pas": "I don't like", "comment ça va": "how are you?", aujourd_hui: "today",
  demain: "tomorrow", hier: "yesterday", temps: "time", heure: "hour", année: "year", semaine: "week",
};

const ES2: Record<string, string> = {
  bonjour: "hola", salut: "hola", "au revoir": "adiós", merci: "gracias", "s'il te plaît": "por favor",
  oui: "sí", non: "no", maison: "casa", école: "escuela", livre: "libro", table: "mesa", eau: "agua",
  pain: "pan", chien: "perro", chat: "gato", soleil: "sol", lune: "luna", jour: "día", nuit: "noche",
  manger: "comer", parler: "hablar", vivre: "vivir", avoir: "tener", être: "ser / estar", grand: "grande",
  petit: "pequeño", bon: "bueno", mauvais: "malo", rouge: "rojo", bleu: "azul", un: "uno", deux: "dos",
  trois: "tres", quatre: "cuatro", cinq: "cinco", famille: "familia", mère: "madre", père: "padre",
  frère: "hermano", sœur: "hermana", ami: "amigo", amie: "amiga", travailler: "trabajar",
  "comment vas-tu": "¿cómo estás?", "je m'appelle": "me llamo",
};

const DE: Record<string, string> = {
  bonjour: "guten Tag (ou hallo)", salut: "hallo", "au revoir": "auf Wiedersehen", merci: "danke",
  "s'il te plaît": "bitte", oui: "ja", non: "nein", maison: "das Haus", école: "die Schule",
  livre: "das Buch", eau: "das Wasser", pain: "das Brot", chien: "der Hund", chat: "die Katze",
  un: "eins", deux: "zwei", trois: "drei", quatre: "vier", cinq: "fünf", mère: "die Mutter",
  père: "der Vater", ami: "der Freund",
};

const LANG_NAMES: Record<string, string> = {
  anglais: "anglais", english: "anglais", espagnol: "espagnol", espanol: "espagnol", spanish: "espagnol",
  allemand: "allemand", italien: "italien", francais: "français", portugais: "portugais",
};

/** Une phrase d'exemple par mot, pour que la traduction soit en situation. */
const EN_SENTENCE: Record<string, string> = {
  bonjour: "Hello! How are you? — Bonjour ! Comment vas-tu ?",
  salut: "Hi, my name is Jana. — Salut, je m'appelle Jana.",
  "au revoir": "Goodbye, see you tomorrow! — Au revoir, à demain !",
  merci: "Thank you very much! — Merci beaucoup !",
  oui: "Yes, I like English. — Oui, j'aime l'anglais.",
  non: "No, I don't like spiders. — Non, je n'aime pas les araignées.",
  maison: "My house is big. — Ma maison est grande.",
  école: "I go to school every day. — Je vais à l'école tous les jours.",
  chat: "My cat is black. — Mon chat est noir.",
  chien: "The dog is playing. — Le chien joue.",
};

const cleanWord = (w: string) =>
  norm(w).replace(/^(le |la |les |un |une |des |l')/, "").replace(/[?.!]+$/, "").trim();

/**
 * « comment dit-on bonjour en anglais ? », « traduis merci en espagnol »,
 * « dis bonjour en anglais » : traduction directe d'un mot courant.
 */
export function translationAnswer(question: string): string | null {
  const q = norm(question);
  const langKey = Object.keys(LANG_NAMES).find((l) => new RegExp(`\\b${l}\\b`).test(q));
  if (!langKey) return null;
  const lang = LANG_NAMES[langKey];

  // le mot à traduire : après « dit-on » / « traduis » / « dis », ou le premier mot connu
  const after = q.match(/(?:dit-on|traduis|traduire|dis|dire|comment dire)\s+(?:moi\s+)?(?:le\s+|la\s+|les\s+)?([a-z' ]{2,25}?)(?:\s+en\s+|$)/);
  const candidate = cleanWord(after?.[1] ?? "");
  const dict = lang === "espagnol" ? ES2 : lang === "anglais" ? EN : lang === "allemand" ? DE : null;

  const word = (dict && (dict[candidate] ? candidate : Object.keys(dict).find((w) => q.includes(w)))) || null;

  if (!word) {
    // On ne devine pas : mieux vaut le dire que répondre à côté.
    if (dict) {
      return [
        `Je ne connais pas encore la traduction de ce mot en ${lang}, Jana — et je préfère te le dire plutôt que d'inventer.`,
        "",
        `Reformule avec un mot du cours (par exemple « bonjour », « merci », « maison »), ou demande-moi de **créer une fiche** sur ce thème : je peux l'ajouter à la Bibliothèque.`,
      ].join("\n");
    }
    return null;
  }

  if (lang === "allemand") {
    const tr = DE[word];
    return [
      `**« ${word} » se dit « ${tr} » en allemand.**`,
      "",
      `**Exemple :** « ${word === "bonjour" ? "Guten Tag! Wie geht es dir?" : tr} »`,
      "",
      "**À retenir :** en allemand, les noms communs prennent une majuscule (das Haus).",
      "",
      `**À toi :** écris « merci » en allemand, je corrige.`,
    ].join("\n");
  }

  if (lang === "espagnol") {
    const tr = ES2[word];
    return [
      `**« ${word} » se dit « ${tr} » en espagnol.**`,
      "",
      `**Exemple :** « ${word === "bonjour" ? "¡Hola! ¿Cómo estás?" : tr} »`,
      "",
      "**À retenir :** en espagnol, le « h » ne se prononce jamais (hola se dit « ola »).",
      "",
      `**À toi :** écris « au revoir » en espagnol, je corrige.`,
    ].join("\n");
  }

  const tr = EN[word];
  return [
    `**« ${word} » se dit « ${tr} » en anglais.**`,
    "",
    `**Exemple :** « ${EN_SENTENCE[word] ?? tr} »`,
    "",
    `**À retenir :** ${word === "bonjour" ? "*good morning* le matin, *hello* ou *hi* le reste du temps." : `« ${word} » = « ${tr} ».`}`,
    "",
    `**À toi :** écris « merci » en anglais, je corrige.`,
  ].join("\n");
}

/** Traduction d'un mot espagnol courant. */
export function spanishAnswer(question: string): string | null {
  const q = norm(question);
  if (!/espagnol|espanol/.test(q)) return null;
  const word = Object.keys(ESP).find((w) => new RegExp(`\\b${w}\\b`).test(q));
  if (!word) return null;
  return [
    `**${word}** veut dire **${ESP[word]}** en français.`,
    "",
    `**Exemple :** « ${word === "hola" ? "¡Hola! ¿Cómo estás?" : `Me gusta ${word}.`} » — ${word === "hola" ? "Bonjour ! Comment vas-tu ?" : `J'aime ${ESP[word]}.`}`,
    "",
    "**À retenir :** en espagnol, le mot s'écrit comme il se prononce presque toujours.",
  ].join("\n");
}
