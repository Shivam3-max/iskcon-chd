// Hand-drawn ISKCON illustration set, in a folk line-art style
// (ink outline plus flat temple-paint fills). Every figure is drawn on a
// 200×200 canvas. Strokes use pathLength=1 so they can draw themselves in on scroll.
import type { ReactNode } from "react";
import type { Figure } from "./types";

const P = (d: string, cls = "ink", extra: Record<string, unknown> = {}) => (
  <path d={d} className={cls} pathLength={1} {...extra} />
);

// A limb drawn as an inked outline with a skin-coloured core.
const Limb = ({ d, skin = "var(--skin)" }: { d: string; skin?: string }) => (
  <g>
    <path d={d} className="limb-outer" pathLength={1} />
    <path d={d} className="limb-inner" style={{ stroke: skin }} />
  </g>
);

type Pose = "dance" | "mridanga" | "kartal" | "teach" | "flag" | "book";

interface DevoteeProps {
  x?: number;
  y?: number;
  s?: number;
  tilt?: number;
  pose: Pose;
  skin?: string;
  cloth?: string;
  halo?: boolean;
  flip?: boolean;
}

function Devotee({ x = 0, y = 0, s = 1, tilt = 0, pose, skin = "var(--skin)", cloth = "var(--cloth)", halo, flip }: DevoteeProps) {
  const arms: Record<Pose, ReactNode> = {
    dance: (
      <>
        <Limb skin={skin} d="M87 58 C80 50 74 44 73 34 C72 27 72 22 74 15" />
        <Limb skin={skin} d="M113 58 C120 50 126 44 127 34 C128 27 128 22 126 15" />
        <circle cx="74" cy="13" r="3.4" className="ink" style={{ fill: skin }} />
        <circle cx="126" cy="13" r="3.4" className="ink" style={{ fill: skin }} />
      </>
    ),
    mridanga: (
      <>
        {P("M113 56 L78 75", "ink thin")}
        <path d="M70 74 C85 68 115 68 130 74 L130 92 C115 98 85 98 70 92 Z" className="ink" style={{ fill: "var(--clay)" }} pathLength={1} />
        <ellipse cx="70" cy="83" rx="4.5" ry="9.5" className="ink" style={{ fill: "var(--ivory-deep)" }} />
        <ellipse cx="130" cy="83" rx="4.5" ry="9.5" className="ink" style={{ fill: "var(--ivory-deep)" }} />
        {P("M76 72.5 L82 94 L88 71 L94 95 L100 70.5 L106 95 L112 71 L118 94 L124 72.5", "ink hair")}
        <Limb skin={skin} d="M87 58 C80 64 74 72 72 79" />
        <Limb skin={skin} d="M113 58 C121 64 126 72 128 79" />
      </>
    ),
    kartal: (
      <>
        <Limb skin={skin} d="M87 58 C78 66 79 76 88 77" />
        <Limb skin={skin} d="M113 58 C124 55 125 45 117 39" />
        <ellipse cx="91" cy="76" rx="6" ry="2.4" className="ink" style={{ fill: "var(--gold)" }} transform="rotate(-20 91 76)" />
        <ellipse cx="114" cy="38" rx="6" ry="2.4" className="ink" style={{ fill: "var(--gold)" }} transform="rotate(30 114 38)" />
        {P("M121 30 l6 -5 M124 37 l8 -1 M120 24 l3 -7", "ink thin")}
      </>
    ),
    teach: (
      <>
        <Limb skin={skin} d="M87 58 C82 70 85 79 93 81" />
        <rect x="89" y="72" width="20" height="14" rx="1.5" className="ink" style={{ fill: "var(--maroon-soft)" }} transform="rotate(-8 99 79)" />
        {P("M99 72.5 L100 86", "ink hair")}
        <Limb skin={skin} d="M113 58 C123 53 127 44 125 33" />
        <path d="M121 33 C121 26 124 22 126 23 C128 22 130 26 129 33 Z" className="ink" style={{ fill: skin }} pathLength={1} />
      </>
    ),
    flag: (
      <>
        <Limb skin={skin} d="M87 58 C80 66 80 74 84 82" />
        <Limb skin={skin} d="M113 58 C120 52 124 44 124 36" />
        {P("M124 40 L124 -6", "ink")}
        <path d="M124 -6 L150 2 L124 10 Z" className="ink" style={{ fill: "var(--saffron)" }} pathLength={1} />
      </>
    ),
    book: (
      <>
        <Limb skin={skin} d="M87 58 C82 70 86 78 94 78" />
        <Limb skin={skin} d="M113 58 C118 70 114 78 106 78" />
        <path d="M86 70 L100 74 L114 70 L114 84 L100 88 L86 84 Z" className="ink" style={{ fill: "var(--maroon-soft)" }} pathLength={1} />
        {P("M100 74 L100 88", "ink hair")}
      </>
    ),
  };

  const t = `translate(${x} ${y}) scale(${flip ? -s : s} ${s})${flip ? " translate(-200 0)" : ""} rotate(${tilt} 100 172)`;
  return (
    <g transform={t}>
      {halo && <circle cx="100" cy="36" r="19" className="halo" />}
      {/* dhoti */}
      <path d="M91 97 C86 120 82 145 79 168 C92 173 110 173 123 168 C120 145 116 120 109 97 Q100 101 91 97 Z" className="ink" style={{ fill: cloth }} pathLength={1} />
      {P("M100 101 C97 125 99 150 101 171", "ink thin")}
      {P("M103 101 C110 118 109 131 105 143", "ink thin")}
      {/* torso */}
      <path d="M87 56 Q100 50 113 56 C115 70 112 86 109 97 Q100 101 91 97 C88 86 85 70 87 56 Z" className="ink" style={{ fill: skin }} pathLength={1} />
      {P("M88 59 L108 96", "ink sash")}
      {/* garland */}
      {P("M88 58 C89 92 111 92 112 58", "ink garland")}
      <g className="garland-dots">
        {[[89.5, 70], [92, 79], [96, 85], [100, 87], [104, 85], [108, 79], [110.5, 70]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.1" />
        ))}
      </g>
      {/* feet */}
      <ellipse cx="91" cy="173" rx="6.5" ry="2.4" className="ink" style={{ fill: skin }} />
      <ellipse cx="111" cy="173" rx="6.5" ry="2.4" className="ink" style={{ fill: skin }} />
      {/* neck + head */}
      {P("M100 46 V53", "ink")}
      <circle cx="100" cy="36" r="10.5" className="ink" style={{ fill: skin }} />
      {P("M96 26.5 C94 20 99 16.5 104 18.5", "ink")}
      {P("M98.6 29 L100 35.5 L101.4 29", "tilak")}
      {P("M94.6 37.4 q2 1.6 4 0 M101.4 37.4 q2 1.6 4 0", "ink hair")}
      {arms[pose]}
    </g>
  );
}

function Mataji({ x = 0, y = 0, s = 1, flip }: { x?: number; y?: number; s?: number; flip?: boolean }) {
  const t = `translate(${x} ${y}) scale(${flip ? -s : s} ${s})${flip ? " translate(-200 0)" : ""}`;
  return (
    <g transform={t}>
      <path d="M88 54 C84 90 80 140 77 172 L125 172 C121 140 117 90 112 54 Z" className="ink" style={{ fill: "var(--sari)" }} pathLength={1} />
      {P("M95 140 L93 172 M101 140 L101 172 M107 140 L109 172", "ink thin")}
      {P("M78 160 C95 165 108 165 124 160", "ink sari-border")}
      <circle cx="100" cy="38" r="10.5" className="ink" style={{ fill: "var(--skin)" }} />
      <path d="M87 42 C86 22 114 22 113 42 C115 60 117 78 119 96 C108 92 100 80 92 64 Z" className="ink" style={{ fill: "var(--sari)" }} pathLength={1} />
      {P("M113 42 C114 60 116 78 119 96", "ink sari-border")}
      {P("M98.6 31 L100 36 L101.4 31", "tilak")}
      <circle cx="100" cy="29" r="1" className="bindi" />
      {P("M94.6 39.4 q2 1.6 4 0 M101.4 39.4 q2 1.6 4 0", "ink hair")}
      <Limb d="M90 62 C86 72 88 80 96 82" />
      <Limb d="M110 62 C114 72 112 80 104 82" />
      <ellipse cx="97" cy="81" rx="5.5" ry="2.2" className="ink" style={{ fill: "var(--gold)" }} transform="rotate(-25 97 81)" />
      <ellipse cx="103.5" cy="81" rx="5.5" ry="2.2" className="ink" style={{ fill: "var(--gold)" }} transform="rotate(25 103.5 81)" />
    </g>
  );
}

const Ground = ({ y = 178 }: { y?: number }) => P(`M20 ${y} C70 ${y - 3} 130 ${y - 3} 180 ${y}`, "ink thin ground");

const Petals = () => (
  <g className="petals">
    {[[30, 60, 20], [168, 48, -30], [40, 120, 60], [160, 128, 10], [56, 30, -15], [146, 92, 40]].map(([x, y, r], i) => (
      <path key={i} d="M0 0 C3 -4 7 -4 8 0 C7 4 3 4 0 0 Z" transform={`translate(${x} ${y}) rotate(${r})`} />
    ))}
  </g>
);

const Notes = () => (
  <g className="notes">
    {P("M40 50 v-14 l10 -3 v14", "ink thin")}
    <circle cx="38" cy="50" r="2.6" className="ink" style={{ fill: "currentColor" }} />
    <circle cx="48" cy="47" r="2.6" className="ink" style={{ fill: "currentColor" }} />
    {P("M160 36 v-12", "ink thin")}
    <circle cx="158" cy="36" r="2.6" className="ink" style={{ fill: "currentColor" }} />
  </g>
);

export const FIGURES: Record<Figure, () => ReactNode> = {
  "gaura-nitai": () => (
    <>
      <Petals />
      <Devotee x={-22} y={6} s={0.94} tilt={-5} pose="dance" skin="var(--gaura)" cloth="var(--saffron)" halo />
      <Devotee x={34} y={6} s={0.94} tilt={5} pose="dance" skin="var(--nitai-skin)" cloth="var(--nitai)" halo />
      <Ground />
    </>
  ),
  kirtan: () => (
    <>
      <Notes />
      <Devotee pose="mridanga" cloth="var(--ivory-deep)" />
      <Ground />
    </>
  ),
  kartal: () => (
    <>
      <Notes />
      <Mataji x={-34} y={8} s={0.86} />
      <Devotee x={30} pose="kartal" tilt={4} cloth="var(--saffron)" />
      <Ground />
    </>
  ),
  preacher: () => (
    <>
      {P("M140 40 C150 34 162 36 166 44 M144 52 C154 48 164 50 168 56", "ink thin")}
      <Devotee pose="teach" cloth="var(--saffron)" />
      <Ground />
    </>
  ),
  children: () => (
    <>
      <Devotee x={8} y={62} s={0.64} pose="book" cloth="var(--ivory-deep)" />
      <Devotee x={66} y={62} s={0.64} pose="flag" cloth="var(--saffron)" tilt={3} />
      <Ground />
    </>
  ),
  books: () => (
    <>
      <path d="M46 150 L150 150 L150 170 L46 170 Z" className="ink" style={{ fill: "var(--maroon-soft)" }} pathLength={1} />
      {P("M56 150 V170 M140 150 V170", "ink thin")}
      <path d="M52 130 L146 130 L146 150 L52 150 Z" className="ink" style={{ fill: "var(--peacock)" }} pathLength={1} />
      {P("M62 136 H100 M62 143 H90", "ink thin gilt")}
      <path d="M58 110 L140 110 L140 130 L58 130 Z" className="ink" style={{ fill: "var(--saffron)" }} pathLength={1} />
      {P("M68 116 H110 M68 123 H96", "ink thin gilt")}
      {/* open Gita on top */}
      <path d="M100 104 C86 96 66 94 50 98 L50 60 C66 56 86 58 100 66 Z" className="ink" style={{ fill: "var(--ivory)" }} pathLength={1} />
      <path d="M100 104 C114 96 134 94 150 98 L150 60 C134 56 114 58 100 66 Z" className="ink" style={{ fill: "var(--ivory)" }} pathLength={1} />
      {P("M100 66 V104", "ink")}
      {P("M58 70 C70 67 80 68 92 72 M58 78 C70 75 80 76 92 80 M58 86 C68 83 78 84 88 87", "ink hair")}
      {P("M108 72 C120 68 130 67 142 70 M108 80 C120 76 130 75 142 78 M112 87 C122 84 132 83 142 86", "ink hair")}
      {P("M100 60 C99 50 104 42 112 38", "ink thin")}
      <path d="M112 38 C118 30 128 30 132 34 C126 38 120 40 112 38 Z" className="ink" style={{ fill: "var(--tulasi)" }} pathLength={1} />
    </>
  ),
  prasadam: () => (
    <>
      {P("M80 60 C76 52 84 48 80 40 M100 56 C96 46 104 42 100 32 M120 60 C116 52 124 48 120 40", "ink thin steam")}
      <path d="M22 120 C60 100 140 100 178 120 C150 150 50 150 22 120 Z" className="ink" style={{ fill: "var(--tulasi)" }} pathLength={1} />
      {P("M30 120 C80 112 120 112 170 120", "ink thin")}
      {P("M60 116 L56 128 M90 113 L88 130 M120 113 L122 130 M148 116 L152 128", "ink hair")}
      <path d="M50 116 C50 96 92 96 92 116 Z" className="ink" style={{ fill: "var(--ivory)" }} pathLength={1} />
      <path d="M98 116 C98 104 120 100 128 108 C132 112 132 116 132 116 Z" className="ink" style={{ fill: "var(--saffron)" }} pathLength={1} />
      <ellipse cx="148" cy="112" rx="11" ry="6" className="ink" style={{ fill: "var(--clay)" }} />
      <circle cx="138" cy="100" r="5" className="ink" style={{ fill: "var(--gold)" }} />
      <circle cx="150" cy="98" r="5" className="ink" style={{ fill: "var(--gold)" }} />
      <path d="M100 82 L108 92 L92 92 Z" className="tulasi-leaf" />
    </>
  ),
  ratha: () => (
    <>
      {/* canopy */}
      <path d="M100 10 L132 52 L68 52 Z" className="ink" style={{ fill: "var(--maroon)" }} pathLength={1} />
      {P("M100 10 L100 52 M84 31 L116 31 M76 42 L124 42", "ink thin gilt")}
      {P("M100 10 V0", "ink")}
      <path d="M100 0 L116 4 L100 8 Z" className="ink" style={{ fill: "var(--saffron)" }} pathLength={1} />
      <path d="M62 52 L138 52 L134 60 L66 60 Z" className="ink" style={{ fill: "var(--gold)" }} pathLength={1} />
      {/* pillars + Jagannatha */}
      {P("M70 60 V110 M130 60 V110", "ink")}
      <rect x="84" y="66" width="32" height="40" rx="10" className="ink" style={{ fill: "var(--jagannatha)" }} />
      <circle cx="93" cy="81" r="6" className="ink" style={{ fill: "var(--ivory)" }} />
      <circle cx="107" cy="81" r="6" className="ink" style={{ fill: "var(--ivory)" }} />
      <circle cx="93" cy="81" r="2.6" style={{ fill: "currentColor" }} />
      <circle cx="107" cy="81" r="2.6" style={{ fill: "currentColor" }} />
      <path d="M90 95 Q100 103 110 95" className="ink" style={{ fill: "var(--maroon)" }} pathLength={1} />
      {P("M100 66 L100 71", "tilak")}
      {/* platform */}
      <path d="M52 110 L148 110 L144 126 L56 126 Z" className="ink" style={{ fill: "var(--clay)" }} pathLength={1} />
      {/* wheels */}
      {[64, 100, 136].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="148" r="20" className="ink" style={{ fill: "var(--ivory-deep)" }} />
          {P(`M${cx - 20} 148 H${cx + 20} M${cx} 128 V168 M${cx - 14} 134 L${cx + 14} 162 M${cx + 14} 134 L${cx - 14} 162`, "ink thin")}
          <circle cx={cx} cy="148" r="4" className="ink" style={{ fill: "var(--gold)" }} />
        </g>
      ))}
      {P("M52 118 C36 120 22 126 6 124 M52 122 C36 126 22 134 6 134", "ink thin rope")}
    </>
  ),
  cow: () => (
    <>
      <path d="M44 86 C46 70 64 64 84 66 L130 66 C142 66 150 72 152 82 L156 96 C158 108 150 116 140 116 L136 116 L136 160 L128 160 L126 122 L76 122 L74 160 L66 160 L64 118 C52 114 44 104 44 86 Z" className="ink" style={{ fill: "var(--ivory)" }} pathLength={1} />
      {P("M84 66 C86 58 94 56 100 64", "ink")}
      <path d="M150 74 C158 66 170 66 176 72 L182 92 C182 100 174 104 168 100 L156 92 Z" className="ink" style={{ fill: "var(--ivory)" }} pathLength={1} />
      {P("M162 68 C160 60 162 54 168 52 M172 68 C176 62 180 60 186 62", "ink")}
      {P("M156 78 C150 76 146 80 146 84", "ink thin")}
      <circle cx="170" cy="80" r="1.8" style={{ fill: "currentColor" }} />
      {P("M44 86 C34 92 30 110 34 130", "ink")}
      <path d="M30 128 C32 136 38 138 40 132 Z" className="ink" style={{ fill: "currentColor" }} pathLength={1} />
      {P("M152 100 C150 108 146 112 140 114", "ink thin")}
      <circle cx="148" cy="114" r="4" className="ink" style={{ fill: "var(--gold)" }} />
      <path d="M92 76 C100 72 112 74 114 84 C108 92 96 92 92 76 Z" className="patch" />
      <path d="M58 90 C62 84 70 86 70 94 C66 100 60 98 58 90 Z" className="patch" />
      {P("M100 122 C100 132 104 136 110 134", "ink thin")}
      <Ground y={164} />
      {P("M150 150 C152 140 156 136 160 134 M156 150 C158 144 162 140 168 140", "ink thin tulasi-stroke")}
    </>
  ),
  tulasi: () => (
    <>
      {P("M100 96 C99 74 100 54 100 30", "ink")}
      {P("M100 70 C88 62 80 54 76 44 M100 60 C112 52 120 44 124 34 M100 84 C90 80 84 76 80 70 M100 80 C110 78 118 72 122 64", "ink thin")}
      {[[76, 44, -30], [124, 34, 30], [80, 70, -20], [122, 64, 25], [100, 30, 0], [88, 56, -45], [112, 48, 45], [92, 78, -60], [110, 76, 60]].map(([x, y, r], i) => (
        <path key={i} d="M0 0 C-6 -4 -6 -12 0 -16 C6 -12 6 -4 0 0 Z" transform={`translate(${x} ${y}) rotate(${r})`} className="ink" style={{ fill: "var(--tulasi)" }} />
      ))}
      {P("M100 30 V20 M76 44 L72 36 M124 34 L128 26", "ink thin manjari")}
      <path d="M66 96 L134 96 L130 106 L70 106 Z" className="ink" style={{ fill: "var(--gold)" }} pathLength={1} />
      <path d="M70 106 L130 106 L126 170 L74 170 Z" className="ink" style={{ fill: "var(--clay)" }} pathLength={1} />
      <path d="M88 170 L88 136 C88 124 112 124 112 136 L112 170 Z" className="ink" style={{ fill: "var(--maroon)" }} pathLength={1} />
      <path d="M100 128 L104 136 L100 144 L96 136 Z" className="ink" style={{ fill: "var(--gold)" }} />
      {P("M74 118 H126 M74 160 H126", "ink thin gilt")}
      <Ground y={174} />
    </>
  ),
  lotus: () => (
    <>
      <path d="M100 150 C82 128 82 92 100 64 C118 92 118 128 100 150 Z" className="ink" style={{ fill: "var(--lotus)" }} pathLength={1} />
      <path d="M100 150 C76 140 58 116 56 88 C78 94 94 116 100 150 Z" className="ink" style={{ fill: "var(--lotus)" }} pathLength={1} />
      <path d="M100 150 C124 140 142 116 144 88 C122 94 106 116 100 150 Z" className="ink" style={{ fill: "var(--lotus)" }} pathLength={1} />
      <path d="M100 150 C70 150 40 136 28 116 C56 112 82 128 100 150 Z" className="ink" style={{ fill: "var(--lotus-deep)" }} pathLength={1} />
      <path d="M100 150 C130 150 160 136 172 116 C144 112 118 128 100 150 Z" className="ink" style={{ fill: "var(--lotus-deep)" }} pathLength={1} />
      {P("M100 140 V82 M86 140 C80 120 76 108 70 100 M114 140 C120 120 124 108 130 100", "ink hair")}
      {P("M40 164 C70 156 130 156 160 164 M60 172 C80 168 120 168 140 172", "ink thin water")}
    </>
  ),
  diya: () => (
    <>
      <path d="M100 40 C88 62 88 80 100 88 C112 80 112 62 100 40 Z" className="flame" />
      <path d="M100 58 C95 68 95 78 100 82 C105 78 105 68 100 58 Z" className="flame-core" />
      {P("M100 88 V98", "ink")}
      <path d="M40 104 C60 98 140 98 166 100 C162 108 156 112 150 114 C150 140 128 152 100 152 C72 152 52 140 50 114 C46 112 42 108 40 104 Z" className="ink" style={{ fill: "var(--clay)" }} pathLength={1} />
      {P("M54 116 C80 122 120 122 148 116", "ink thin")}
      {P("M70 132 C80 136 92 138 100 138 C108 138 120 136 130 132", "ink thin gilt")}
      {P("M60 40 l-6 -6 M140 40 l6 -6 M48 76 h-10 M152 76 h10 M66 20 l-3 -8 M134 20 l3 -8", "ink thin rays")}
    </>
  ),
  conch: () => (
    <>
      <path d="M50 120 C40 96 56 62 92 50 C122 40 152 52 160 78 C166 98 156 116 140 124 L120 132 C112 150 92 160 74 156 C64 150 60 140 62 132 C54 130 52 126 50 120 Z" className="ink" style={{ fill: "var(--ivory)" }} pathLength={1} />
      {P("M92 50 C100 70 104 96 100 124 M120 46 C124 70 124 98 120 132 M144 58 C146 78 144 100 140 124", "ink thin")}
      {P("M62 132 C76 124 94 122 110 128", "ink thin")}
      <path d="M160 78 C172 74 182 80 180 90 C178 98 168 100 158 96" className="ink" style={{ fill: "var(--gold)" }} pathLength={1} />
      {P("M60 168 C80 162 120 162 140 168", "ink thin ground")}
      {P("M84 82 C90 78 96 82 94 88 C92 94 84 92 84 86", "ink hair")}
    </>
  ),
  flute: () => (
    <>
      {/* peacock feather */}
      {P("M140 170 C136 120 128 80 112 40", "ink")}
      <path d="M112 40 C96 26 100 4 118 8 C134 12 138 34 124 48 Z" className="ink" style={{ fill: "var(--peacock)" }} pathLength={1} />
      <ellipse cx="117" cy="26" rx="8" ry="11" className="ink" style={{ fill: "var(--tulasi)" }} transform="rotate(-20 117 26)" />
      <ellipse cx="117" cy="27" rx="4" ry="5.5" className="ink" style={{ fill: "var(--nitai)" }} transform="rotate(-20 117 27)" />
      {P("M112 46 C100 56 98 72 104 88 M118 50 C122 66 124 84 122 100 M126 56 C136 70 138 86 136 104", "ink hair")}
      {/* flute */}
      <path d="M20 150 L176 104 L179 112 L23 158 Z" className="ink" style={{ fill: "var(--clay)" }} pathLength={1} />
      {[60, 76, 92, 108, 124].map((x, i) => (
        <circle key={i} cx={x} cy={146 - (x - 20) * 0.295} r="2.2" style={{ fill: "currentColor" }} />
      ))}
      {P("M40 148 L44 160 M150 116 L154 128", "ink thin gilt")}
      <path d="M44 156 C40 170 48 182 54 176 C50 170 50 162 52 156" className="ink" style={{ fill: "var(--saffron)" }} pathLength={1} />
    </>
  ),
  temple: () => (
    <>
      {P("M100 4 V20", "ink")}
      <path d="M100 4 L120 9 L100 14 Z" className="ink" style={{ fill: "var(--saffron)" }} pathLength={1} />
      <path d="M100 22 C112 40 122 60 124 90 L76 90 C78 60 88 40 100 22 Z" className="ink" style={{ fill: "var(--ivory)" }} pathLength={1} />
      <circle cx="100" cy="22" r="4" className="ink" style={{ fill: "var(--gold)" }} />
      {P("M86 50 H114 M80 66 H120 M77 80 H123", "ink thin")}
      <path d="M48 96 C54 84 62 80 68 90 L68 100 L48 100 Z" className="ink" style={{ fill: "var(--ivory)" }} pathLength={1} />
      <path d="M152 96 C146 84 138 80 132 90 L132 100 L152 100 Z" className="ink" style={{ fill: "var(--ivory)" }} pathLength={1} />
      <path d="M36 100 L164 100 L164 170 L36 170 Z" className="ink" style={{ fill: "var(--ivory-deep)" }} pathLength={1} />
      <path d="M30 90 L170 90 L164 100 L36 100 Z" className="ink" style={{ fill: "var(--maroon)" }} pathLength={1} />
      <path d="M86 170 L86 134 C86 118 114 118 114 134 L114 170 Z" className="ink" style={{ fill: "var(--maroon)" }} pathLength={1} />
      {[48, 64, 136, 152].map((x) => (
        <path key={x} d={`M${x - 5} 170 L${x - 5} 128 C${x - 5} 120 ${x + 5} 120 ${x + 5} 128 L${x + 5} 170`} className="ink thin" pathLength={1} />
      ))}
      {P("M24 176 H176", "ink")}
    </>
  ),
  kalash: () => (
    <>
      {[-50, -25, 0, 25, 50].map((r, i) => (
        <path key={i} d="M0 0 C-8 -14 -6 -34 0 -46 C6 -34 8 -14 0 0 Z" transform={`translate(100 66) rotate(${r})`} className="ink" style={{ fill: "var(--tulasi)" }} />
      ))}
      <ellipse cx="100" cy="52" rx="14" ry="17" className="ink" style={{ fill: "var(--clay)" }} />
      {P("M92 40 C96 36 104 36 108 40", "ink hair")}
      <path d="M78 70 L122 70 L116 80 L84 80 Z" className="ink" style={{ fill: "var(--gold)" }} pathLength={1} />
      <path d="M84 80 C56 92 52 140 72 158 L128 158 C148 140 144 92 116 80 Z" className="ink" style={{ fill: "var(--gold)" }} pathLength={1} />
      {P("M64 112 H136 M62 124 H138", "ink thin")}
      <path d="M92 98 L100 104 L108 98 L100 92 Z" className="ink" style={{ fill: "var(--maroon)" }} />
      {P("M100 104 V114", "tilak")}
      <path d="M72 158 L128 158 L132 168 L68 168 Z" className="ink" style={{ fill: "var(--clay)" }} pathLength={1} />
    </>
  ),
  peacock: () => (
    <>
      {P("M100 180 C100 140 98 100 100 40", "ink")}
      <path d="M100 40 C76 30 72 0 100 -4 C128 0 124 30 100 40 Z" className="ink" style={{ fill: "var(--peacock)" }} pathLength={1} transform="translate(0 20)" />
      <ellipse cx="100" cy="36" rx="11" ry="14" className="ink" style={{ fill: "var(--tulasi)" }} />
      <ellipse cx="100" cy="37" rx="5" ry="7" className="ink" style={{ fill: "var(--nitai)" }} />
      {Array.from({ length: 9 }).map((_, i) => <g key={i}>{P(`M100 ${70 + i * 12} C${86 - i} ${62 + i * 12} ${76 - i} ${64 + i * 12} ${70 - i} ${70 + i * 12} M100 ${70 + i * 12} C${114 + i} ${62 + i * 12} ${124 + i} ${64 + i * 12} ${130 + i} ${70 + i * 12}`, "ink hair")}</g>)}
    </>
  ),
  chamara: () => (
    <>
      {P("M100 180 V110", "ink")}
      <path d="M94 110 L106 110 L104 96 L96 96 Z" className="ink" style={{ fill: "var(--gold)" }} pathLength={1} />
      <path d="M96 96 C70 70 74 30 100 10 C126 30 130 70 104 96 Z" className="ink" style={{ fill: "var(--ivory)" }} pathLength={1} />
      {P("M100 92 C92 70 90 40 98 16 M100 92 C108 70 110 40 102 16 M98 90 C84 72 80 50 86 30 M102 90 C116 72 120 50 114 30", "ink hair")}
    </>
  ),
};
