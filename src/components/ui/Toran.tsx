// A festive toran: swags of marigold with mango leaves, hung across the top of a band.
// One 240px swag is drawn and tiled with an SVG pattern so it spans any width.
export default function Toran({ className = "" }: { className?: string }) {
  const flowers = [24, 52, 84, 120, 156, 188, 216];
  const sag = (x: number) => 8 + Math.sin((x / 240) * Math.PI) * 26;
  return (
    <svg className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-[64px] w-full ${className}`} aria-hidden>
      <defs>
        <pattern id="toran-swag" width="240" height="64" patternUnits="userSpaceOnUse">
          <path d="M0 8 Q120 60 240 8" fill="none" stroke="#7a4a1c" strokeWidth="1.2" />
          {flowers.map((x, i) => {
            const y = sag(x);
            const big = i % 2 === 0;
            return (
              <g key={x} transform={`translate(${x} ${y})`}>
                {i % 3 === 1 && (
                  <path d="M0 2 C-5 10 -4 20 0 26 C4 20 5 10 0 2 Z" fill="#5f8a4e" stroke="#3c5f35" strokeWidth=".6" />
                )}
                <circle r={big ? 7.5 : 6} fill={big ? "#f08a1c" : "#f6b52e"} />
                <circle r={big ? 7.5 : 6} fill="none" stroke="#c45f10" strokeWidth=".8" strokeDasharray="2 1.6" />
                <circle r={big ? 2.6 : 2} fill="#b8500e" />
              </g>
            );
          })}
          <circle cx="0" cy="8" r="4" fill="#c99a3a" />
          <circle cx="240" cy="8" r="4" fill="#c99a3a" />
        </pattern>
      </defs>
      <line x1="0" y1="7" x2="100%" y2="7" stroke="#7a4a1c" strokeWidth="1.4" />
      <rect width="100%" height="64" fill="url(#toran-swag)" />
    </svg>
  );
}
