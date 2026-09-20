// Compact flat-vector hazard illustrations for the Control Room hazard
// cards. Deliberately illustrative (not photographic) so it reads as a
// government system icon set rather than a stock-photo banner.
const SCENES = {
  Cyclone: (
    <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice">
      <rect fill="#0b2f52" height="120" width="320" />
      <rect fill="#123f6b" height="46" width="320" y="74" />
      <g fill="none" stroke="#8fc3ea" strokeLinecap="round" strokeWidth="4" opacity="0.75">
        <path d="M60 40c14-14 34-14 46 0" />
        <path d="M50 54c20-20 48-20 66 0" />
        <path d="M40 68c26-26 62-26 86 0" />
      </g>
      <circle cx="72" cy="52" fill="#dff0ff" opacity="0.9" r="5" />
      <g fill="#1c517f" opacity="0.9">
        <path d="M0 96l30-6 32 8 34-7 30 6 40-8 34 7 40-6 40 6v26H0z" />
      </g>
    </svg>
  ),
  Flood: (
    <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice">
      <rect fill="#0e3350" height="120" width="320" />
      <path d="M0 62l20-6 20 6 20-6 20 6 20-6 20 6 20-6 20 6 20-6 20 6 20-6 20 6 20-6 20 6v58H0z" fill="#1a4a73" />
      <path d="M0 78l20-5 20 5 20-5 20 5 20-5 20 5 20-5 20 5 20-5 20 5 20-5 20 5 20-5 20 5v40H0z" fill="#2c6a9c" />
      <path d="M0 94l16-4 16 4 16-4 16 4 16-4 16 4 16-4 16 4 16-4 16 4 16-4 16 4 16-4 16 4 16-4 16 4v22H0z" fill="#3f83b8" />
      <rect fill="#274a63" height="14" opacity="0.8" width="16" x="230" y="70" />
      <rect fill="#1e3c52" height="8" opacity="0.85" width="10" x="255" y="78" />
    </svg>
  ),
  Landslide: (
    <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice">
      <rect fill="#0c2d3f" height="120" width="320" />
      <path d="M0 100L70 30l50 30 40-20 60 40 100-30v70H0z" fill="#3a4f42" />
      <path d="M60 100l60-46 46 24 24-14 60 32 70-24v28H60z" fill="#5c4632" opacity="0.92" />
      <g fill="#2c2015" opacity="0.85">
        <circle cx="150" cy="92" r="5" />
        <circle cx="170" cy="98" r="4" />
        <circle cx="190" cy="90" r="6" />
        <circle cx="210" cy="100" r="4" />
      </g>
    </svg>
  ),
  Heatwave: (
    <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice">
      <rect fill="#3a1f0e" height="120" width="320" />
      <rect fill="#5c2c10" height="120" width="320" opacity="0.7" />
      <circle cx="256" cy="34" fill="#ffb648" opacity="0.95" r="20" />
      <g stroke="#ffb648" strokeLinecap="round" strokeWidth="3" opacity="0.8">
        <path d="M256 4v-8" />
        <path d="M284 12l6-6" />
        <path d="M228 12l-6-6" />
      </g>
      <g fill="#1c1108" opacity="0.9">
        <rect height="42" width="18" x="30" y="66" />
        <rect height="58" width="18" x="54" y="50" />
        <rect height="36" width="18" x="78" y="72" />
      </g>
      <g fill="none" stroke="#ffd28a" strokeLinecap="round" strokeWidth="3" opacity="0.55">
        <path d="M120 108c6-10 -6-14 0-24" />
        <path d="M150 108c6-10 -6-14 0-24" />
        <path d="M180 108c6-10 -6-14 0-24" />
      </g>
    </svg>
  ),
  Earthquake: (
    <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice">
      <rect fill="#241a2e" height="120" width="320" />
      <g fill="#3a2c46">
        <rect height="50" width="26" x="40" y="50" />
        <rect height="70" width="30" x="76" y="30" />
        <rect height="40" width="24" x="116" y="60" />
        <rect height="60" width="28" x="150" y="40" />
        <rect height="34" width="22" x="188" y="66" />
      </g>
      <g fill="#c94b4b" opacity="0.9">
        <rect height="6" width="10" x="84" y="46" />
        <rect height="6" width="10" x="156" y="58" />
      </g>
      <path d="M0 100l24-6 14 10 20-14 18 12 20-10 20 8 20-10 20 8 20-10 20 8 20-10 20 8 24-6v14H0z" fill="#4a3a5c" opacity="0.9" />
      <path d="M0 108 L40 100 L60 112 L90 98 L120 112 L150 100 L180 112 L210 100 L240 112 L270 100 L320 108" fill="none" stroke="#e07b4f" strokeWidth="2.5" opacity="0.8" />
    </svg>
  ),
};

export default function HazardVisual({ hazardType, className = '' }) {
  const scene = SCENES[hazardType] ?? SCENES.Cyclone;
  return (
    <div className={`hazard-visual ${className}`} role="img" aria-label={`${hazardType} illustration`}>
      {scene}
      <div className="hazard-visual__overlay" />
    </div>
  );
}
