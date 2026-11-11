import { useMemo } from "react";

export default function Stardust({ count = 40 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37.7) % 100,
        top: (i * 53.3) % 100,
        size: 1 + ((i * 7) % 3),
        delay: (i % 10) * 0.35,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute animate-twinkle rounded-full bg-[#FDE68A]"
          style={{
            left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size,
            animationDelay: `${s.delay}s`, boxShadow: "0 0 6px #FDE68A",
          }}
        />
      ))}
    </div>
  );
}
