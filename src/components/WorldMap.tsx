import { useEffect, useMemo, useRef, useState } from "react";
import rawCountries from "@/data/countries.json";
import rawShapes from "@/data/world-shapes.json";

export type MapCountry = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

type Props = {
  countries: MapCountry[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  /** Pays marqué en vert (bonne réponse du quiz). */
  highlightId?: string | null;
  height?: number;
};

const SHAPES = rawShapes as { width: number; height: number; countries: { id: string; name: string; d: string }[] };
const W = SHAPES.width;
const H = SHAPES.height;

const LABELS = new Map((rawCountries as { id: string; name: string }[]).map((c) => [c.id, c.name]));

const REGION_COLORS: Record<string, string> = {
  Europe: "#6f8fd8",
  Afrique: "#d8a35f",
  Asie: "#c98cd0",
  "Amériques": "#6fc3a0",
  "Océanie": "#e0c56a",
  "Antarctique": "#8b9dc3",
};

export default function WorldMap({
  countries,
  selectedId = null,
  onSelect,
  onHover,
  highlightId = null,
  height = 520,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [width, setWidth] = useState(960);
  const [hover, setHover] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState({ x: 0, y: 0, w: W, h: H });

  // Couleur par continent
  const regionOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of rawCountries as { id: string; region: string | null }[]) m.set(c.id, c.region ?? "");
    return m;
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth || 960);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const svgHeight = Math.min(height, Math.round((width * H) / W));

  const setHovered = (id: string | null) => {
    if (id !== hover) {
      setHover(id);
      onHover?.(id);
    }
  };

  const handleClick = (id: string) => {
    if (onSelect) onSelect(id);
    else setHovered(id);
  };

  const zoomTo = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top) / rect.height;
    const scale = zoomed ? 1 : 3;
    const w = W / scale;
    const h = H / scale;
    setView({
      x: Math.min(Math.max(rx * W - w / 2, 0), W - w),
      y: Math.min(Math.max(ry * H - h / 2, 0), H - h),
      w,
      h,
    });
    setZoomed((z) => !z);
  };

  const focusCountry = () => {
    const c = countries.find((x) => x.id === selectedId);
    if (!c) return;
    const w = W / 3.4;
    const h = H / 3.4;
    const cx = ((c.lon + 180) / 360) * W;
    const cy = ((90 - c.lat) / 180) * H;
    setView({
      x: Math.min(Math.max(cx - w / 2, 0), W - w),
      y: Math.min(Math.max(cy - h / 2, 0), H - h),
      w,
      h,
    });
    setZoomed(true);
  };

  const reset = () => {
    setView({ x: 0, y: 0, w: W, h: H });
    setZoomed(false);
  };

  return (
    <div ref={wrapRef} className="relative overflow-hidden rounded-3xl border border-[#7C5CFF33] bg-[#0A1226]" data-testid="world-map">
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        width={width}
        height={svgHeight}
        className="block w-full select-none"
        onClick={zoomTo}
        data-testid="map-svg"
      >
        {/* Océans */}
        <rect x={0} y={0} width={W} height={H} fill="#0d1a33" />

        {/* Graticule */}
        <g stroke="#7a9bd7" strokeOpacity={0.14} strokeWidth={0.6}>
          {[-120, -60, 0, 60, 120].map((lon) => (
            <line key={lon} x1={((lon + 180) / 360) * W} y1={0} x2={((lon + 180) / 360) * W} y2={H} />
          ))}
          {[-60, -30, 0, 30, 60].map((lat) => (
            <line key={lat} x1={0} y1={((90 - lat) / 180) * H} x2={W} y2={((90 - lat) / 180) * H} />
          ))}
        </g>

        {/* Pays */}
        <g>
          {SHAPES.countries.map((c) => {
            const isSel = c.id === selectedId;
            const isHl = c.id === highlightId;
            const isHover = c.id === hover;
            const base = REGION_COLORS[regionOf.get(c.id) ?? ""] ?? "#8ea6c8";
            return (
              <path
                key={c.id}
                d={c.d}
                fill={isHl ? "#7CF5A8" : isSel ? "#FF5F8D" : isHover ? "#FFE9A8" : base}
                fillOpacity={isHl || isSel ? 0.95 : isHover ? 0.9 : 0.62}
                stroke="#0a1226"
                strokeWidth={0.4}
                className="cursor-pointer transition-[fill-opacity] duration-150"
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(c.id);
                }}
                data-testid={`map-country-${c.id}`}
              >
                <title>{LABELS.get(c.id) ?? c.name}</title>
              </path>
            );
          })}
        </g>
      </svg>

      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-[#7C5CFF33] bg-[#0E0B1Ccc] px-1 py-1 backdrop-blur">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (zoomed) reset();
            else focusCountry();
          }}
          className="rounded-full px-2 py-1 text-[11px] text-[#C9C3E6] hover:bg-white/10"
          data-testid="map-zoom-toggle"
        >
          {zoomed ? "Voir le monde" : "Zoom pays"}
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0A1226] to-transparent p-3 text-center text-xs text-[#9D95C2]">
        {hover ? (
          <span className="text-[#FDE68A]">{LABELS.get(hover) ?? hover}</span>
        ) : (
          "Clique un pays pour sa fiche · clique ailleurs pour zoomer · « Voir le monde » pour revenir"
        )}
      </div>
    </div>
  );
}
