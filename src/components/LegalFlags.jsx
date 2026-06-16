import { TriangleAlert, ShieldCheck } from 'lucide-react';
import { MARKETS } from '../lib/config.js';

const TAG = { warn: 'Heads up:', ok: 'Friendly:', info: 'FYI:' };

export default function LegalFlags({ marketKey }) {
  const m = MARKETS[marketKey];
  if (!m || !m.flags || !m.flags.length) return null;
  const allOk = m.flags.every((f) => f.type === 'ok' || f.type === 'info');

  const wrap = allOk
    ? 'border-success/40 border-l-4 border-l-success bg-gradient-to-b from-success-bg to-surface'
    : 'border-warn/40 border-l-4 border-l-warn bg-gradient-to-b from-warn-bg to-surface';
  const Icon = allOk ? ShieldCheck : TriangleAlert;
  const iconColor = allOk ? 'text-success' : 'text-warn';

  return (
    <section className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${wrap}`}>
      <p className="flex items-center gap-2 font-semibold text-[15px] text-ink m-0 mb-2.5">
        <Icon size={16} strokeWidth={2} className={iconColor} />
        Local rules &amp; regulations — {m.name}
      </p>
      <ul className="m-0 pl-5 list-disc">
        {m.flags.map((f, i) => (
          <li key={i} className="text-[13px] text-ink-2 mb-1.5 leading-snug">
            <strong className="text-ink">{TAG[f.type] || 'FYI:'}</strong> {f.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
