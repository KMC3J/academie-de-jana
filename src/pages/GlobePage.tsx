import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, RotateCcw, Sparkles, XCircle } from "lucide-react";
import WorldMap from "@/components/WorldMap";
import rawCountries from "@/data/countries.json";

type Country = {
  id: string;
  name: string;
  official: string;
  lat: number;
  lon: number;
  capital: string | null;
  currency: { code: string; name: string; symbol: string | null } | null;
  languages: string[];
  region: string | null;
  subregion: string | null;
  area: number | null;
  population: number | null;
  history: { text: string; title: string } | null;
};

const COUNTRIES = rawCountries as Country[];

const REGIONS = ["Toutes", "Europe", "Afrique", "Asie", "Amériques", "Océanie"];

const CURRENCY_FR: Record<string, string> = {
  EUR: "l'euro", USD: "le dollar américain", GBP: "la livre sterling", JPY: "le yen", CNY: "le yuan",
  INR: "la roupie indienne", RUB: "le rouble", BRL: "le réal brésilien", AUD: "le dollar australien",
  CAD: "le dollar canadien", CHF: "le franc suisse", MAD: "le dirham marocain", DZD: "le dinar algérien",
  TND: "le dinar tunisien", EGP: "la livre égyptienne", TRY: "la livre turque", XOF: "le franc CFA",
  XAF: "le franc CFA", ZAR: "le rand", MXN: "le peso mexicain", ARS: "le peso argentin", KRW: "le won",
  SEK: "la couronne suédoise", NOK: "la couronne norvégienne", DKK: "la couronne danoise", PLN: "le zloty",
  CZK: "la couronne tchèque", HUF: "le forint", RON: "le leu", UAH: "la hryvnia", NGN: "le naira",
  KES: "le shilling kényan", ETB: "le birr", SAR: "le riyal saoudien", AED: "le dirham des Émirats",
  ILS: "le shekel", IDR: "la roupie indonésienne", THB: "le baht", VND: "le dong", PHP: "le peso philippin",
  MYR: "le ringgit", SGD: "le dollar de Singapour", NZD: "le dollar néo-zélandais", CLP: "le peso chilien",
  COP: "le peso colombien", PEN: "le sol",
};

const LANGUAGE_FR: Record<string, string> = {
  French: "français", English: "anglais", Spanish: "espagnol", Portuguese: "portugais", German: "allemand",
  Italian: "italien", Dutch: "néerlandais", Arabic: "arabe", Russian: "russe", Chinese: "chinois",
  Japanese: "japonais", Korean: "coréen", Hindi: "hindi", Turkish: "turc", Polish: "polonais",
  Swedish: "suédois", Norwegian: "norvégien", Danish: "danois", Finnish: "finnois", Greek: "grec",
  Hebrew: "hébreu", Persian: "persan", Urdu: "ourdou", Bengali: "bengali", Indonesian: "indonésien",
  Malay: "malais", Thai: "thaï", Vietnamese: "vietnamien", Swahili: "swahili", Amharic: "amharique",
  Romanian: "roumain", Czech: "tchèque", Hungarian: "hongrois", Ukrainian: "ukrainien", Catalan: "catalan",
  Albanian: "albanais", Serbian: "serbe", Croatian: "croate", Bulgarian: "bulgare", Slovak: "slovaque",
  Slovenian: "slovène", Lithuanian: "lituanien", Latvian: "letton", Estonian: "estonien",
  Icelandic: "islandais", Irish: "irlandais", Welsh: "gallois", Georgian: "géorgien", Armenian: "arménien",
  Azerbaijani: "azéri", Kazakh: "kazakh", Uzbek: "ouzbek", Mongolian: "mongol", Nepali: "népalais",
  Sinhala: "cingalais", Tamil: "tamoul", Burmese: "birman", Khmer: "khmer", Lao: "lao",
  Dzongkha: "dzongkha", Pashto: "pachto", Dari: "dari", Kurdish: "kurde", Somali: "somali",
  Hausa: "haoussa", Yoruba: "yoruba", Igbo: "igbo", Zulu: "zoulou", Afrikaans: "afrikaans",
  Malagasy: "malgache", Quechua: "quechua", Guarani: "guarani", Aymara: "aymara",
};

const nf = new Intl.NumberFormat("fr-FR");
const formatArea = (km2: number | null) => (km2 ? `${nf.format(Math.round(km2))} km²` : "—");
const formatPop = (n: number | null) => (n ? `${nf.format(Math.round(n / 1000) * 1000)} habitants` : "—");
const currencyLabel = (c: Country["currency"]) => {
  if (!c) return "—";
  const fr = CURRENCY_FR[c.code];
  return fr ? `${fr} (${c.code})` : `${c.name} (${c.code})`;
};
const langLabel = (l: string[]) => (l.length ? l.slice(0, 3).map((x) => LANGUAGE_FR[x] ?? x.toLowerCase()).join(", ") : "—");

// --- Quiz ---------------------------------------------------------------

type QuestionKind = "capital" | "currency" | "map";

type Question = {
  kind: QuestionKind;
  country: Country;
  prompt: string;
  choices: string[];
  answer: string;
};

// « de France », « du Cameroun », « des États-Unis », « de l'Inde »…
const ARTICLE = /^(États-Unis|Pays-Bas|Émirats arabes unis|Philippines|Seychelles|Comores|Maldives|Bahamas|Fidji|Salomon|Maurice)$/;
const MASC = /^(Cameroun|Canada|Japon|Mexique|Brésil|Pérou|Chili|Maroc|Sénégal|Mali|Niger|Tchad|Gabon|Congo|Bénin|Togo|Burkina|Kenya|Zimbabwe|Mozambique|Liban|Portugal|Danemark|Royaume-Uni|Vietnam|Viêt Nam|Cambodge|Laos|Panama|Honduras|Guatemala|Équateur|Uruguay|Paraguay|Venezuela|Israël|Iran|Irak|Koweït|Qatar|Bahreïn|Oman|Yémen|Soudan|Éthiopie|Luxembourg|Bhoutan|Népal|Sri Lanka|Kazakhstan|Ouzbékistan|Turkménistan|Kirghizistan|Tadjikistan|Azerbaïdjan|Monténégro|Liechtenstein)$/;
const FEM_VOWEL = /^(Inde|Argentine|Australie|Autriche|Égypte|Afrique du Sud|Algérie|Arabie saoudite|Arménie|Estonie|Hongrie|Ukraine|Ouganda|Angola|Érythrée|Indonésie|Irlande|Islande|Italie|Espagne|Albanie|Bolivie|Colombie|Corée du Sud|Corée du Nord|Géorgie|Jordanie|Malaisie|Mongolie|Norvège|Pologne|Roumanie|Suède|Suisse|Tunisie|Turquie|Zambie|Tanzanie|Mauritanie)$/;

function capitalPhrase(name: string) {
  if (ARTICLE.test(name)) return `des ${name}`;
  if (MASC.test(name)) return `du ${name}`;
  if (FEM_VOWEL.test(name)) return `de l'${name}`;
  if (/^(Chine|Grèce|Russie|Slovaquie|Slovénie|Croatie|Serbie|Bosnie|Bulgarie|Lettonie|Lituanie|Finlande|France|Belgique|Birmanie|Thaïlande|Somalie|Libye|Syrie|Jamaïque|Guyana)$/.test(name)) return `de ${name}`;
  return `du ${name}`;
}

function currencyPhrase(name: string) {
  if (ARTICLE.test(name)) return `aux ${name}`;
  if (MASC.test(name)) return `au ${name}`;
  if (/^[AEIOUÉÈÂÎÔÛ]/.test(name)) return `en ${name}`;
  return `en ${name}`;
}

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function buildQuiz(pool: Country[], count: number): Question[] {
  const usable = pool.filter((c) => c.capital);
  const qs: Question[] = [];

  for (let i = 0; i < count; i++) {
    const country = usable[Math.floor(Math.random() * usable.length)];
    const kind: QuestionKind = country.currency
      ? (["capital", "currency", "map"] as QuestionKind[])[i % 3]
      : (["capital", "map"] as QuestionKind[])[i % 2];

    if (kind === "capital") {
      const others = shuffle(usable.filter((c) => c.capital !== country.capital)).slice(0, 3).map((c) => c.capital!);
      qs.push({
        kind,
        country,
        prompt: `Quelle est la capitale ${capitalPhrase(country.name)} ?`,
        choices: shuffle([country.capital!, ...others]),
        answer: country.capital!,
      });
    } else if (kind === "currency" && country.currency) {
      const others = shuffle(
        usable.filter((c) => c.currency && c.currency.code !== country.currency!.code),
      )
        .slice(0, 3)
        .map((c) => CURRENCY_FR[c.currency!.code] ?? c.currency!.name);
      const answerLabel = CURRENCY_FR[country.currency.code] ?? country.currency.name;
      qs.push({
        kind,
        country,
        prompt: `Quelle monnaie utilise-t-on ${currencyPhrase(country.name)} ?`,
        choices: shuffle([answerLabel, ...others]),
        answer: answerLabel,
      });
    } else {
      const others = shuffle(usable.filter((c) => c.id !== country.id)).slice(0, 3);
      qs.push({
        kind: "map",
        country,
        prompt: `Clique sur ${country.name} sur la carte.`,
        choices: shuffle([country, ...others]).map((c) => c.name),
        answer: country.id,
      });
    }
  }
  return qs;
}

// --- Composant ----------------------------------------------------------

export default function GlobePage() {
  const [selectedId, setSelectedId] = useState<string | null>("FR");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Toutes");
  const [hovered, setHovered] = useState<string | null>(null);

  // Quiz
  const [quizRegion, setQuizRegion] = useState("Europe");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const quizRef = useRef<HTMLDivElement | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COUNTRIES.filter((c) => {
      if (region !== "Toutes" && c.region !== region) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.capital ?? "").toLowerCase().includes(q) ||
        (c.currency?.code ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, region]);

  const selected = COUNTRIES.find((c) => c.id === selectedId) ?? null;
  const hoveredCountry = hovered ? COUNTRIES.find((c) => c.id === hovered) : null;

  const startQuiz = useCallback(
    (reg: string) => {
      const pool = COUNTRIES.filter((c) => reg === "Toutes" || c.region === reg);
      setQuestions(buildQuiz(pool, 8));
      setIndex(0);
      setPicked(null);
      setScore(0);
      setFinished(false);
      setQuizRegion(reg);
      setTimeout(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    },
    [],
  );

  const question = questions[index] ?? null;
  const answered = picked !== null;
  const isCorrect = question ? picked === question.answer : false;

  const answer = (value: string) => {
    if (!question || answered) return;
    setPicked(value);
    if (value === question.answer) setScore((s) => s + 1);
  };

  const next = () => {
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex(nextIndex);
    setPicked(null);
  };

  // Clic sur la carte pendant la question « localise »
  const onMapPick = (id: string) => {
    if (question && question.kind === "map" && !answered) {
      answer(id);
      return;
    }
    setSelectedId(id);
  };

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-[#FDE68A] uppercase">La carte du monde</p>
      <h1 className="mt-1 font-heading text-4xl font-bold text-white">Les pays du monde</h1>
      <p className="mt-2 max-w-2xl text-[#A7A1C8]">
        Explore la carte, ouvre la fiche d'un pays (capitale, monnaie, histoire) et lance le quiz pour tester ta mémoire.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Carte */}
        <div>
          <WorldMap
            countries={COUNTRIES.map((c) => ({ id: c.id, name: c.name, lat: c.lat, lon: c.lon }))}
            selectedId={selectedId}
            highlightId={question?.kind === "map" && answered && isCorrect ? question.country.id : null}
            onSelect={onMapPick}
            onHover={setHovered}
          />
          {question?.kind === "map" && !answered && (
            <p className="mt-2 text-sm text-[#FDE68A]">À toi : clique sur {question.country.name}.</p>
          )}
          {hoveredCountry && (
            <p className="mt-2 text-xs text-[#8B84B0]">
              Survole : {hoveredCountry.name} — capitale {hoveredCountry.capital ?? "inconnue"}
            </p>
          )}
        </div>

        {/* Fiche du pays */}
        <motion.aside
          key={selected?.id ?? "vide"}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-fit rounded-3xl border border-[#7C5CFF40] bg-[#18142A] p-5"
          data-testid="country-card"
        >
          {!selected ? (
            <p className="text-sm text-[#A7A1C8]">Choisis un pays sur la carte.</p>
          ) : (
            <>
              <h2 className="font-heading text-3xl font-bold text-white" data-testid="country-name">
                {selected.name}
              </h2>
              <p className="text-xs text-[#9D95C2]">{selected.official}</p>

              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Capitale" value={selected.capital ?? "—"} testId="country-capital" />
                <Row label="Monnaie" value={currencyLabel(selected.currency)} testId="country-currency" />
                <Row label="Langue" value={langLabel(selected.languages)} />
                <Row label="Continent" value={selected.region ?? "—"} />
                <Row label="Superficie" value={formatArea(selected.area)} />
                <Row label="Population" value={formatPop(selected.population)} />
              </dl>

              <div className="mt-5 border-t border-[#7C5CFF26] pt-4">
                <h3 className="font-heading text-lg text-[#FDE68A]">Son histoire</h3>
                {selected.history ? (
                  <>
                    <p className="mt-1 max-h-56 overflow-y-auto pr-1 text-sm leading-relaxed text-[#C9C3E6]" data-testid="country-history">
                      {selected.history.text}
                    </p>
                    <p className="mt-2 text-[11px] text-[#6F689A]">
                      Source : Wikipédia FR — « {selected.history.title} » (CC BY-SA)
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-[#9D95C2]">Pas encore de résumé pour ce pays dans le grimoire.</p>
                )}
              </div>
            </>
          )}
        </motion.aside>
      </div>

      {/* Quiz */}
      <div ref={quizRef} className="mt-10 rounded-3xl border border-[#7C5CFF33] bg-[#141026] p-6" data-testid="geo-quiz">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">Quiz des pays</h2>
            <p className="text-sm text-[#A7A1C8]">Capitales, monnaies et pays à trouver sur la carte.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#8B84B0]">Série :</span>
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => startQuiz(r)}
                data-testid={`quiz-region-${r}`}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  questions.length && quizRegion === r
                    ? "border-[#FDE68A] bg-[#FDE68A22] text-[#FDE68A]"
                    : "border-[#7C5CFF33] text-[#A7A1C8] hover:border-[#7C5CFF66]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {!questions.length ? (
          <p className="mt-5 text-sm text-[#8B84B0]">
            Choisis une zone ci-dessus pour commencer une série de 8 questions.
          </p>
        ) : finished ? (
          <div className="mt-6" data-testid="quiz-finished">
            <p className="font-heading text-3xl text-white">
              {score} / {questions.length} <Sparkles className="inline size-6 text-[#FDE68A]" />
            </p>
            <p className="mt-1 text-sm text-[#A7A1C8]">
              {score === questions.length
                ? "Sans faute ! Le château s'incline."
                : score >= questions.length / 2
                  ? "Bien joué, encore un tour pour tout retenir."
                  : "Pas mal : refais une série, la carte va rentrer."}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => startQuiz(quizRegion)}
                data-testid="quiz-restart"
                className="flex items-center gap-2 rounded-xl bg-[#FDE68A] px-4 py-2 text-sm font-semibold text-[#231a02] hover:brightness-105"
              >
                <RotateCcw className="size-4" /> Rejouer
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6" data-testid="quiz-question">
            <p className="text-xs text-[#8B84B0]">
              Question {index + 1} / {questions.length} · score {score}
            </p>
            <p className="mt-1 font-heading text-xl text-white" data-testid="quiz-prompt">
              {question!.prompt}
            </p>

            {question!.kind === "map" ? (
              <p className="mt-3 text-sm text-[#A7A1C8]">
                Clique directement sur le point du pays, en haut de la page.
              </p>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {question!.choices.map((choice) => {
                  const chosen = picked === choice;
                  const good = choice === question!.answer;
                  return (
                    <button
                      key={choice}
                      onClick={() => answer(choice)}
                      disabled={answered}
                      data-testid={`quiz-choice-${choice}`}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-default ${
                        answered && good
                          ? "border-[#7CF5A8] bg-[#7CF5A81A] text-[#D7FFE6]"
                          : chosen
                            ? "border-[#FF5F8D] bg-[#FF5F8D1A] text-white"
                            : "border-[#7C5CFF33] bg-[#18142A] text-[#C9C3E6] hover:border-[#7C5CFF66]"
                      }`}
                    >
                      {choice}
                      {answered && good && <CheckCircle2 className="size-4 text-[#7CF5A8]" />}
                      {answered && chosen && !good && <XCircle className="size-4 text-[#FF5F8D]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {answered && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className={`text-sm ${isCorrect ? "text-[#7CF5A8]" : "text-[#FF9AB6]"}`}>
                  {isCorrect ? "Bonne réponse !" : `La bonne réponse : ${question!.kind === "map" ? question!.country.name : question!.answer}`}
                </p>
                <button
                  onClick={next}
                  data-testid="quiz-next"
                  className="rounded-xl bg-[#FDE68A] px-4 py-2 text-sm font-semibold text-[#231a02] hover:brightness-105"
                >
                  {index + 1 === questions.length ? "Voir le score" : "Suivant"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recherche + liste */}
      <div className="mt-10">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un pays, une capitale, une monnaie…"
            data-testid="globe-search"
            className="w-full max-w-xs rounded-xl border border-[#7C5CFF40] bg-[#18142A] px-3 py-2 text-sm text-white placeholder:text-[#6F689A] focus:ring-2 focus:ring-[#7C5CFF66] focus:outline-none"
          />
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              data-testid={`globe-region-${r}`}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                region === r
                  ? "border-[#FDE68A] bg-[#FDE68A22] text-[#FDE68A]"
                  : "border-[#7C5CFF33] text-[#A7A1C8] hover:border-[#7C5CFF66]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-[#6F689A]">{list.length} pays</p>
        <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              data-testid={`country-item-${c.id}`}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                c.id === selectedId
                  ? "border-[#FF5F8D] bg-[#FF5F8D1A] text-white"
                  : "border-[#7C5CFF26] bg-[#18142A] text-[#C9C3E6] hover:border-[#7C5CFF66]"
              }`}
            >
              <span className="block truncate">{c.name}</span>
              <span className="block truncate text-[11px] text-[#8B84B0]">{c.capital ?? "—"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-[#8B84B0]">{label}</dt>
      <dd className="text-[#E9E5FF]" data-testid={testId}>
        {value}
      </dd>
    </div>
  );
}
