import rawFlags from "@/data/flags.json";

const FLAGS = rawFlags as Record<string, string>;

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
  const svg = FLAGS[code];
  if (!svg) {
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
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
