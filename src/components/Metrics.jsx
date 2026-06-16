import { ShieldCheck, Banknote, Scale, TrendingUp, Percent, Gauge, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { f$, fPct } from '../lib/calc.js';

const COLOR = { pos: 'text-success', neg: 'text-danger', warn: 'text-warn' };

function Trend({ cls }) {
  const Icon = cls === 'pos' ? ArrowUp : cls === 'neg' ? ArrowDown : Minus;
  return <Icon size={15} strokeWidth={2.4} className="inline-block align-[-2px] mr-1" aria-hidden="true" />;
}

export default function Metrics({ r }) {
  const dscrOk = r.dscr >= 1.25;
  const dscrClass = r.dscr >= 1.25 ? 'pos' : r.dscr >= 1.0 ? 'warn' : 'neg';
  const capClass = r.capRate >= 0.07 ? 'pos' : r.capRate >= 0.04 ? 'warn' : 'neg';

  const cards = [
    { label: 'Year 1 tax savings', cls: 'pos', value: f$(r.totalTax), sub: `Fed ${f$(r.fedSav)} + CA ${f$(r.caSav)}`, Icon: ShieldCheck },
    { label: 'Year 1 cash flow', cls: r.cashFlow < 0 ? 'neg' : 'pos', value: f$(r.cashFlow), sub: `${f$(r.noi)} NOI − ${f$(r.y1.annualPay)} debt svc`, Icon: Banknote },
    { label: 'Net Year 1 position', cls: r.net1 < 0 ? 'neg' : 'pos', value: f$(r.net1), sub: 'After cost-seg study cost', Icon: Scale },
    { label: 'Year 1 total ROI', cls: r.totalROI1 > 0.1 ? 'pos' : r.totalROI1 > 0 ? 'warn' : 'neg', value: fPct(r.totalROI1), sub: 'Incl. appreciation', Icon: TrendingUp },
    { label: 'Cap Rate', hint: "Kevin's view", cls: capClass, value: fPct(r.capRate, 2), sub: 'NOI ÷ price · 7%+ strong, 4%+ ok', Icon: Percent },
    { label: 'DSCR', hint: 'Loan test', cls: dscrClass, value: `${r.dscr.toFixed(2)}x`, sub: dscrOk ? '✓ Qualifies for commercial loan' : '✗ Below 1.25 lender threshold', Icon: Gauge },
  ];

  return (
    <div className="grid grid-cols-1 min-[460px]:grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="relative bg-surface border border-line rounded-xl p-4 pr-10 shadow-xs transition-all hover:shadow-sm hover:border-line-strong hover:-translate-y-px">
          <c.Icon size={18} strokeWidth={2} className="absolute top-3.5 right-3.5 text-ink-faint" aria-hidden="true" />
          <p className="flex items-center gap-1.5 text-[11px] text-ink-3 uppercase tracking-wide m-0 mb-2 font-medium">
            {c.label}
            {c.hint && (
              <span className="text-[10px] normal-case tracking-normal text-accent-strong bg-accent-soft px-1.5 py-0.5 rounded font-semibold">
                {c.hint}
              </span>
            )}
          </p>
          <p className={`font-bold text-[25px] leading-none m-0 tnum tracking-tight ${COLOR[c.cls] || 'text-ink'}`}>
            <Trend cls={c.cls} />{c.value}
          </p>
          <p className="text-[11px] text-ink-3 m-0 mt-1.5 font-mono tnum">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
