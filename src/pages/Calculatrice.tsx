import { useState } from "react";
import { Delete } from "lucide-react";
import { evaluate, formatNumber, toFraction } from "@/lib/calc";

const KEYS: { label: string; insert?: string; action?: "clear" | "back" | "eq"; tone?: "op" | "fn" | "eq" }[] = [
  { label: "C", action: "clear", tone: "fn" }, { label: "(", tone: "fn" }, { label: ")", tone: "fn" }, { label: "÷", tone: "op" },
  { label: "√", tone: "fn" }, { label: "x²", insert: "^2", tone: "fn" }, { label: "^", tone: "fn" }, { label: "×", tone: "op" },
  { label: "7" }, { label: "8" }, { label: "9" }, { label: "−", tone: "op" },
  { label: "4" }, { label: "5" }, { label: "6" }, { label: "+", tone: "op" },
  { label: "1" }, { label: "2" }, { label: "3" }, { label: "%", tone: "fn" },
  { label: "0" }, { label: "," }, { label: "⌫", action: "back", tone: "fn" }, { label: "=", action: "eq", tone: "eq" },
];

export default function Calculatrice() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{ e: string; r: string }[]>([]);

  const compute = () => {
    if (!expr.trim()) return;
    try {
      const r = evaluate(expr);
      setResult(r);
      setError("");
      setHistory((h) => [{ e: expr, r: formatNumber(r) }, ...h].slice(0, 8));
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Erreur");
    }
  };

  const press = (k: (typeof KEYS)[number]) => {
    if (k.action === "clear") {
      setExpr("");
      setResult(null);
      setError("");
    } else if (k.action === "back") setExpr(expr.slice(0, -1));
    else if (k.action === "eq") compute();
    else setExpr(expr + (k.insert ?? k.label));
  };

  const frac = result !== null ? toFraction(result) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
      <div className="rounded-3xl border border-[#F59E0B]/30 bg-gradient-to-b from-[#221B3D] to-[#18142A] p-5 shadow-[0_0_40px_rgba(139,92,246,0.2)]">
        <h1 className="mb-4 font-heading text-3xl font-bold text-white">Calculatrice du collège</h1>
        <div className="rounded-2xl bg-[#0D0B18] p-4">
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && compute()}
            placeholder="Ex : 3/4 + 1/6"
            className="w-full bg-transparent text-right font-mono text-xl text-[#C4B5FD] outline-none placeholder:text-white/20"
            data-testid="calc-expression-input"
          />
          <p className="mt-2 min-h-10 text-right font-mono text-3xl text-white" data-testid="calc-result">
            {error ? <span className="text-lg text-[#FCA5A5]">{error}</span> : result !== null ? formatNumber(result) : "0"}
          </p>
          {frac && (
            <p className="text-right font-mono text-sm text-[#FDE68A]" data-testid="calc-fraction">
              = {frac} en fraction
            </p>
          )}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {KEYS.map((k) => (
            <button
              key={k.label}
              type="button"
              onClick={() => press(k)}
              data-testid={`calc-key-${k.label}`}
              className={`flex h-14 items-center justify-center rounded-xl font-mono text-lg transition-[background-color,transform] duration-100 active:scale-95 ${
                k.tone === "eq"
                  ? "bg-[#F59E0B] text-[#1A1202] hover:bg-[#FBBF24]"
                  : k.tone === "op"
                    ? "bg-[#8B5CF6]/30 text-white hover:bg-[#8B5CF6]/45"
                    : k.tone === "fn"
                      ? "bg-white/10 text-[#DDD6FE] hover:bg-white/15"
                      : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {k.label === "⌫" ? <Delete className="size-5" /> : k.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-3xl border border-[#8B5CF6]/20 bg-[#18142A] p-5">
          <h2 className="font-heading text-xl font-bold text-white">Historique</h2>
          <ul className="mt-3 space-y-2 font-mono text-sm" data-testid="calc-history">
            {history.map((h, i) => (
              <li key={i}>
                <button type="button" onClick={() => setExpr(h.e)} className="flex w-full justify-between rounded-lg px-2 py-1 text-left hover:bg-white/5">
                  <span className="text-[#A7A1C8]">{h.e}</span>
                  <span className="text-white">= {h.r}</span>
                </button>
              </li>
            ))}
            {history.length === 0 && <li className="text-[#9D95C2]">Aucun calcul pour l'instant.</li>}
          </ul>
        </div>
        <div className="rounded-3xl border border-[#06B6D4]/25 bg-[#06B6D4]/5 p-5 text-sm text-[#BAE6FD]">
          <p className="font-semibold text-white">Astuces</p>
          <ul className="mt-2 space-y-1">
            <li>· Fractions : tape 3/4 + 1/6 → le résultat s'affiche aussi en fraction</li>
            <li>· Puissances : 2^5 ou le bouton x²</li>
            <li>· Racines : √16 ou √(9+16)</li>
            <li>· Pourcentages : 20% × 150</li>
            <li>· Priorités : la calculatrice respecte l'ordre des opérations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
