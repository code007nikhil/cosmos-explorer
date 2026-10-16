import type { Planet } from "@/types";
/** Lightweight CSS planet illustration (original artwork, not to scale). */
export function PlanetOrb({ planet, size = 96 }: { planet: Planet; size?: number }) {
  const [a, b] = planet.colors;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden>
      {planet.rings && <div className="absolute left-1/2 top-1/2 rounded-full border-[3px] border-amber-200/60" style={{ width: size * 1.7, height: size * 0.5, transform: "translate(-50%,-50%) rotate(-18deg)" }} />}
      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 32% 30%, ${a}, ${b} 70%, #000 130%)`, boxShadow: `0 0 ${size / 3}px ${b}55` }} />
    </div>
  );
}
