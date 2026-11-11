// Safe recursive-descent evaluator for the collège calculator: + − × ÷ ^ √ ( ) and decimals.
type Tok = { t: "num"; v: number } | { t: "op"; v: string };

function tokenize(src: string): Tok[] {
  const s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/,/g, ".");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " ") {
      i++;
    } else if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const v = Number(s.slice(i, j));
      if (Number.isNaN(v)) throw new Error("Nombre invalide");
      out.push({ t: "num", v });
      i = j;
    } else if ("+-*/^()√%".includes(c)) {
      out.push({ t: "op", v: c });
      i++;
    } else {
      throw new Error("Caractère inconnu");
    }
  }
  return out;
}

export function evaluate(src: string): number {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const eat = (v: string) => {
    const k = toks[p];
    if (k && k.t === "op" && k.v === v) {
      p++;
      return true;
    }
    return false;
  };
  const expr = (): number => {
    let v = term();
    for (;;) {
      if (eat("+")) v += term();
      else if (eat("-")) v -= term();
      else return v;
    }
  };
  const term = (): number => {
    let v = power();
    for (;;) {
      if (eat("*")) v *= power();
      else if (eat("/")) {
        const d = power();
        if (d === 0) throw new Error("Division par zéro");
        v /= d;
      } else {
        const k = peek();
        // implicit multiplication: 2(3) or 2√9
        if (k && (k.t === "num" || (k.t === "op" && (k.v === "(" || k.v === "√")))) v *= power();
        else return v;
      }
    }
  };
  const power = (): number => {
    const base = unary();
    if (eat("^")) return base ** power();
    return base;
  };
  const unary = (): number => {
    if (eat("-")) return -unary();
    if (eat("+")) return unary();
    if (eat("√")) {
      const v = unary();
      if (v < 0) throw new Error("Racine d'un négatif");
      return Math.sqrt(v);
    }
    return postfix();
  };
  const postfix = (): number => {
    let v = primary();
    while (eat("%")) v /= 100;
    return v;
  };
  const primary = (): number => {
    const k = peek();
    if (!k) throw new Error("Expression incomplète");
    if (k.t === "num") {
      p++;
      return k.v;
    }
    if (eat("(")) {
      const v = expr();
      if (!eat(")")) throw new Error("Parenthèse manquante");
      return v;
    }
    throw new Error("Expression invalide");
  };
  const v = expr();
  if (p < toks.length) throw new Error("Expression invalide");
  if (!Number.isFinite(v)) throw new Error("Résultat impossible");
  return v;
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/** Returns "a/b" when the value is (close to) a simple fraction, else null. */
export function toFraction(x: number, maxDen = 1000): string | null {
  if (Number.isInteger(x)) return null;
  for (let d = 2; d <= maxDen; d++) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < 1e-9) {
      const g = gcd(n, d);
      return `${n / g}/${d / g}`;
    }
  }
  return null;
}

export function formatNumber(x: number): string {
  return Number(x.toPrecision(12)).toLocaleString("fr-FR", { maximumFractionDigits: 10 });
}
