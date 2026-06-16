import { Layers } from 'lucide-react';
import { Panel, PanelHeader } from './ui.jsx';
import { f$, fK } from '../lib/calc.js';

export default function ReturnStack({ s, r }) {
  const tot = r.returnStack.reduce(
    (acc, y) => ({
      cf: acc.cf + y.cashFlow,
      debt: acc.debt + y.debtPaydown,
      tax: acc.tax + y.taxSavings,
      app: acc.app + y.appreciation,
      total: acc.total + y.total,
    }),
    { cf: 0, debt: 0, tax: 0, app: 0, total: 0 }
  );

  const totalAbs = Math.abs(tot.cf) + tot.debt + tot.tax + tot.app;
  const pctOf = (v) => (totalAbs > 0 ? (v / totalAbs) * 100 : 0);
  const cfShare = totalAbs > 0 ? (Math.max(tot.cf, 0) / totalAbs) * 100 : 0;
  const shares = [
    { name: 'tax savings', pct: +pctOf(tot.tax).toFixed(0) },
    { name: 'appreciation', pct: +pctOf(tot.app).toFixed(0) },
    { name: 'debt paydown', pct: +pctOf(tot.debt).toFixed(0) },
    { name: 'cash flow', pct: +cfShare.toFixed(0) },
  ].sort((a, b) => b.pct - a.pct);

  const dominant = shares[0];
  const dominantNote =
    dominant.pct >= 50 ? (
      <>
        <strong>{dominant.pct}% of your 5-year return comes from {dominant.name}</strong> — this is a{' '}
        {dominant.name === 'tax savings' ? 'tax play' : dominant.name === 'appreciation' ? 'speculative bet on price growth' : dominant.name === 'cash flow' ? 'pure income property' : 'leverage play'}.
      </>
    ) : (
      <>
        Return is balanced across sources — {dominant.name} leads at {dominant.pct}%, then {shares[1].name} at {shares[1].pct}%.
        This is the profile Kevin would call sturdy.
      </>
    );

  const taxDelta = r.tax5Aggressive - r.tax5Conservative;
  const cogSeg =
    taxDelta > 0 ? (
      <><strong>{f$(taxDelta)}</strong> over 5 years — that's the dollar value of the cost-seg study.</>
    ) : (
      <>roughly the same — cost-seg isn't doing much extra work here.</>
    );

  const pct = (v) => (v * 100).toFixed(1) + '%';

  return (
    <Panel>
      <PanelHeader icon={Layers} title="Kevin's view — 5-year return stack" sub="How your accountant breaks down real estate ROI" />

      <div className="bg-primary-tint border border-primary-soft rounded-xl px-[18px] py-4 mb-[18px]">
        <p className="font-serif italic text-[17px] text-primary-strong m-0 mb-1.5">"Real estate makes money four ways. Most folks only see one."</p>
        <p className="text-[12.5px] text-ink-2 m-0 leading-relaxed">
          All percentages below are <strong className="text-ink">annual ROI</strong> on your total investment of{' '}
          <strong className="text-ink">{f$(r.totalInvestment)}</strong> (down payment {f$(r.down)} + closing costs {f$(s.closingCosts)}).
        </p>
      </div>

      <div className="table-scroll">
        <table className="dtable">
          <thead>
            <tr>
              <th>Year</th><th>Cash flow</th><th>Debt paydown</th><th>Tax savings</th><th>Appreciation</th><th>Total ROI</th>
            </tr>
          </thead>
          <tbody>
            {r.returnStack.map((y) => (
              <tr key={y.year}>
                <td>Year {y.year}</td>
                <td className={y.cashFlow < 0 ? 'neg' : ''}>{fK(y.cashFlow)} <span className="pct-inline">{pct(y.cashFlowROI)}</span></td>
                <td>{fK(y.debtPaydown)} <span className="pct-inline">{pct(y.debtPaydownROI)}</span></td>
                <td className="pos">{fK(y.taxSavings)} <span className="pct-inline">{pct(y.taxSavingsROI)}</span></td>
                <td>{fK(y.appreciation)} <span className="pct-inline">{pct(y.appreciationROI)}</span></td>
                <td className="pos"><strong>{fK(y.total)}</strong> <span className="pct-inline pct-strong">{pct(y.totalROI)}</span></td>
              </tr>
            ))}
            <tr className="totals-row">
              <td><strong>5-yr total</strong></td>
              <td className={tot.cf < 0 ? 'neg' : 'pos'}><strong>{fK(tot.cf)}</strong></td>
              <td className="pos"><strong>{fK(tot.debt)}</strong></td>
              <td className="pos"><strong>{fK(tot.tax)}</strong></td>
              <td className="pos"><strong>{fK(tot.app)}</strong></td>
              <td className="pos"><strong>{fK(tot.total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 px-4 py-3.5 bg-surfaceAlt border-l-[3px] border-primary rounded-r-lg">
        <p className="m-0 text-[13px] text-ink-2 leading-relaxed">{dominantNote}</p>
      </div>

      <div className="mt-5">
        <p className="font-semibold text-sm text-ink m-0 mb-3">Sound vs. Sassy — what's the cost-seg + bonus dep strategy worth?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl px-[18px] py-4 border border-line bg-surfaceAlt">
            <p className="font-semibold text-[13px] text-ink m-0">Sound (Kevin's default)</p>
            <p className="text-[11px] text-ink-3 m-0 mb-2.5 font-mono">Straight-line 27.5-year only</p>
            <p className="font-bold text-[26px] text-ink m-0 tnum tracking-tight">{f$(r.tax5Conservative)}</p>
            <p className="text-[11px] text-ink-3 m-0 mt-0.5 uppercase tracking-wide">5-year tax savings</p>
          </div>
          <div className="rounded-xl px-[18px] py-4 border border-primary-soft bg-primary-tint">
            <p className="font-semibold text-[13px] text-ink m-0">Sassy (your current setup)</p>
            <p className="text-[11px] text-ink-3 m-0 mb-2.5 font-mono">{Math.round(s.costSegPct * 100)}% cost seg + {Math.round(s.bonusDepRate * 100)}% bonus dep</p>
            <p className="font-bold text-[26px] text-primary-strong m-0 tnum tracking-tight">{f$(r.tax5Aggressive)}</p>
            <p className="text-[11px] text-ink-3 m-0 mt-0.5 uppercase tracking-wide">5-year tax savings</p>
          </div>
        </div>
        <p className="mt-3.5 text-[13px] text-ink-2 leading-relaxed">The aggressive strategy unlocks {cogSeg}</p>
      </div>
    </Panel>
  );
}
