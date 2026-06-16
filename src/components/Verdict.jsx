import { tierForScore } from '../lib/config.js';

const TIER_STYLE = {
  1: { color: '#059669', soft: '#D1FAE5' },
  2: { color: '#0F766E', soft: '#CCFBF1' },
  3: { color: '#0369A1', soft: '#E0F2FE' },
  4: { color: '#D97706', soft: '#FEF3C7' },
  5: { color: '#DC2626', soft: '#FEE2E2' },
};

function badgeLabel(total) {
  if (total >= 90) return 'Clear winner';
  if (total >= 80) return 'Excellent buy';
  if (total >= 70) return 'Solid buy';
  if (total >= 60) return 'Reasonable';
  if (total >= 50) return 'Marginal';
  if (total >= 40) return 'Overpriced';
  if (total >= 25) return 'Bad deal';
  return 'Hard pass';
}

const RADIUS = 58;
const CIRC = 2 * Math.PI * RADIUS;

export default function Verdict({ r }) {
  const total = r.score.total;
  const t = tierForScore(total);
  const ts = TIER_STYLE[t.tier] || TIER_STYLE[2];
  const dashoffset = CIRC * (1 - Math.max(0, Math.min(100, total)) / 100);

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-surface shadow-md p-6 sm:p-7 animate-fade-up"
      style={{
        borderTop: `5px solid ${ts.color}`,
        border: `1px solid ${ts.color}4D`,
        borderTopWidth: '5px',
        background: `linear-gradient(180deg, ${ts.soft} 0%, transparent 130px), #fff`,
      }}
    >
      <div className="flex items-center gap-6 flex-wrap">
        {/* Gauge */}
        <div className="shrink-0 text-center">
          <div className="score-gauge relative w-[132px] h-[132px]">
            <svg viewBox="0 0 132 132" className="w-[132px] h-[132px]" aria-hidden="true">
              <circle cx="66" cy="66" r={RADIUS} fill="none" strokeWidth="11" stroke="#EDF2F7" />
              <circle
                className="gauge-fill"
                cx="66" cy="66" r={RADIUS} fill="none" strokeWidth="11"
                stroke={ts.color}
                strokeDasharray={CIRC.toFixed(2)}
                strokeDashoffset={dashoffset.toFixed(2)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="leading-none">
                <span className="font-bold text-[44px] text-ink tnum tracking-tight">{total}</span>
                <span className="text-[15px] text-ink-faint font-mono">/100</span>
              </div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-3 mt-1">Castle Score</div>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-[240px]">
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full mb-2.5"
            style={{ color: ts.color, background: ts.soft }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ts.color }} />
            {badgeLabel(total)}
          </span>
          <p className="font-serif italic text-ink leading-tight m-0 mb-2 text-[clamp(20px,3vw,26px)]">“{t.quote}”</p>
          <p className="text-sm text-ink font-semibold m-0 mb-1.5">{t.headline}</p>
          <p className="text-[13px] text-ink-2 m-0 leading-relaxed">{t.rationale}</p>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="mt-5 pt-5 border-t border-line grid grid-cols-2 lg:grid-cols-4 gap-3">
        {r.score.components.map((c) => (
          <div key={c.label} className="bg-surfaceAlt border border-line rounded-lg px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wide text-ink-3 mb-2 font-medium">
              {c.label} ({c.weight}%)
            </div>
            <div className="h-1.5 bg-deep rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-700"
                style={{ width: `${c.score}%` }}
              />
            </div>
            <div className="font-mono text-[11.5px] text-ink-2 font-medium tnum">
              {c.score}/100 · {c.detail}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
