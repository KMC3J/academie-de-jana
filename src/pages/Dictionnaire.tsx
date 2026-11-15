import { useState } from "react";
import { ArrowLeftRight, BookA, Loader2, Search, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isKnown, LANGS, lookup, suggestions, type Entry, type Lang } from "@/lib/dictionary";
import Flag from "@/components/Flag";

const EXAMPLES = ["maison", "homework", "biblioteca", "to be", "faux ami : actually", "week-end"];

/**
 * Dictionnaire français ⇄ anglais / espagnol, niveau collège-lycée.
 * Traduction par l'IA (avec exemple et remarque), orthographe vérifiée sur un
 * dictionnaire embarqué de 12 000 mots par langue.
 */
export default function Dictionnaire() {
  const [from, setFrom] = useState<Lang>("fr");
  const [to, setTo] = useState<Lang>("en");
  const [text, setText] = useState("");
  const [entry, setEntry] = useState<Entry | null>(null);
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState<string[]>([]);
  const [near, setNear] = useState<string[]>([]);

  const search = async (q = text) => {
    const word = q.trim();
    if (!word) return;
    setText(word);
    setBusy(true);
    setNear(isKnown(word, from) ? [] : suggestions(word, from));
    try {
      const res = await lookup(word, from, to);
      setEntry(res);
      setTyped((t) => [word, ...t.filter((x) => x !== word)].slice(0, 8));
    } finally {
      setBusy(false);
    }
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
    setEntry(null);
    setNear([]);
    if (entry && entry.translations[0]) setText(entry.translations[0]);
  };

  const speak = (word: string) => {
    const lang = LANGS.find((l) => l.id === to)?.id ?? "en";
    const u = new SpeechSynthesisUtterance(word);
    u.lang = lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-GB";
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-[#FDE68A] uppercase">La Bibliothèque</p>
      <h1 className="mt-1 flex items-center gap-3 font-heading text-4xl font-bold text-white">
        <BookA className="size-8 text-[#FDE68A]" /> Dictionnaire
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[#A7A1C8]">
        Français ⇄ anglais et français ⇄ espagnol, niveau collège et lycée : traduction, nature du mot, phrase
        d'exemple et pièges à éviter.
      </p>

      <div className="mt-6 rounded-3xl border border-white/5 bg-[#18142A] p-4 sm:p-6">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-[#A7A1C8]">
            Je cherche
            <select
              value={from}
              onChange={(e) => { setFrom(e.target.value as Lang); setEntry(null); }}
              data-testid="dict-from"
              className="mt-1 block rounded-lg border border-white/10 bg-[#0D0B18] px-3 py-2 text-sm text-white"
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </label>
          <Button variant="ghost" size="sm" onClick={swap} data-testid="dict-swap" className="mb-1">
            <ArrowLeftRight />
          </Button>
          <label className="text-xs text-[#A7A1C8]">
            en
            <select
              value={to}
              onChange={(e) => { setTo(e.target.value as Lang); setEntry(null); }}
              data-testid="dict-to"
              className="mt-1 block rounded-lg border border-white/10 bg-[#0D0B18] px-3 py-2 text-sm text-white"
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </label>
          <form
            className="flex min-w-0 flex-1 gap-2"
            onSubmit={(e) => { e.preventDefault(); void search(); }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Un mot ou une expression…"
              data-testid="dict-input"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0D0B18] px-4 py-2 text-white outline-none focus:border-[#F59E0B]/60"
            />
            <Button type="submit" disabled={busy} data-testid="dict-search">
              {busy ? <Loader2 className="animate-spin" /> : <Search />} Chercher
            </Button>
          </form>
        </div>

        {near.length > 0 && (
          <p className="mt-3 text-sm text-[#FDE68A]" data-testid="dict-suggest">
            Ce mot n'est pas dans le dictionnaire — vouliez-vous dire :{" "}
            {near.map((w) => (
              <button key={w} type="button" className="underline" onClick={() => void search(w)}>{w}</button>
            )).join(" · ")}
            ?
          </p>
        )}

        {entry && (
          <article className="mt-5 rounded-2xl border border-[#8B5CF6]/25 bg-[#221B3D] p-5" data-testid="dict-entry">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-xs text-[#A7A1C8]">
                <Flag code={LANGS.find((l) => l.id === entry.from)!.flag} className="h-4 w-6" />
                {LANGS.find((l) => l.id === entry.from)!.label}
              </span>
              <h2 className="font-heading text-2xl font-bold text-white">{entry.word}</h2>
              {entry.pos && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-[#C4B5FD]">{entry.pos}</span>}
              {!entry.ai && <span className="rounded-full bg-[#F59E0B]/20 px-2 py-0.5 text-[11px] text-[#FDE68A]">lexique local</span>}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#A7A1C8]">→</span>
              <Flag code={LANGS.find((l) => l.id === entry.to)!.flag} className="h-4 w-6" />
              {entry.translations.length > 0 ? (
                entry.translations.map((t) => (
                  <span key={t} className="rounded-lg bg-[#F59E0B]/15 px-3 py-1 font-semibold text-[#FDE68A]" data-testid="dict-translation">
                    {t}
                    <button type="button" className="ml-2 align-middle text-[#C4B5FD]" onClick={() => speak(t)} aria-label={`Écouter ${t}`}>
                      <Volume2 className="inline size-4" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#FCA5A5]">Pas de traduction trouvée.</span>
              )}
            </div>
            {entry.example && (
              <p className="mt-4 text-sm text-[#EDE9FE]">
                <em>{entry.example}</em>
                {entry.exampleTranslation && <span className="block text-[#A7A1C8]">{entry.exampleTranslation}</span>}
              </p>
            )}
            {entry.note && <p className="mt-3 text-xs leading-relaxed text-[#FDE68A]">💡 {entry.note}</p>}
          </article>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="text-xs text-[#7C77A0]">Essayer :</span>
          {EXAMPLES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => void search(e.replace("faux ami : ", ""))}
              className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#C4B5FD] hover:bg-white/10"
            >
              {e}
            </button>
          ))}
        </div>
        {typed.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" data-testid="dict-history">
            <span className="text-xs text-[#7C77A0]">Mes recherches :</span>
            {typed.map((t) => (
              <button key={t} type="button" onClick={() => void search(t)} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white hover:bg-white/10">
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
