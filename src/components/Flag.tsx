import rawFlags from "@/data/flags-light.json";

type LightFlag = { vb: number[]; s: { d: string; fill: string; stroke?: string }[] };
const FLAGS = rawFlags as Record<string, LightFlag>;

/** Construit le SVG d'un drapeau à partir des formes compactes. */
function toSvg(flag: LightFlag): string {
  const [x, y, w, h] = flag.vb;
  const shapes = flag.s
    .map((s) => `<path d="${s.d}" fill="${s.fill}"${s.stroke ? ` stroke="${s.stroke}"` : ""}/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" width="100%" height="100%">${shapes}</svg>`;
}

/**
 * Drapeau d'un pays, dessiné en SVG (aucune image à télécharger).
 * `code` est l'identifiant du pays dans countries.json (FR, DE, JP…).
 */
export default function Flag({
  code,
  name,
  className = "",
  rounded = true,
}: {
  code: string;
  name?: string;
  className?: string;
  rounded?: boolean;
}) {
  const flag = FLAGS[code];
  if (!flag) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-[#241E3C] text-[10px] text-[#8B84B0] ${className}`}
        title={name ?? code}
      >
        ?
      </span>
    );
  }
  return (
    <span
      className={`inline-block overflow-hidden align-middle ring-1 ring-white/15 ${rounded ? "rounded-[3px]" : ""} ${className}`}
      title={name ?? code}
      aria-label={name ? `Drapeau : ${name}` : "Drapeau"}
      role="img"
      // Le SVG vient de nos données locales, il est purement décoratif.
      dangerouslySetInnerHTML={{ __html: toSvg(flag) }}
    />
  );
}
