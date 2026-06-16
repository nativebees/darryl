import { TrendingUp } from 'lucide-react';
import { Panel, PanelHeader } from './ui.jsx';
import { f$, fK, fPct } from '../lib/calc.js';

export default function Projection({ s, r }) {
  const milestones = [r.projection.years[0], r.y5, r.y10, r.y30];

  return (
    <Panel>
      <PanelHeader
        icon={TrendingUp}
        title="Long-term wealth projection"
        sub={`${fPct(s.appRate)} appreciation · ${fPct(s.rentGrowth)} rental growth · REPS active`}
      />
      <div className="table-scroll">
        <table className="dtable">
          <thead>
            <tr>
              <th>Milestone</th><th>Property value</th><th>Loan balance</th><th>Equity gain</th>
              <th>Cum. cash flow</th><th>Cum. tax savings</th><th>Total wealth</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((y) => (
              <tr key={y.year}>
                <td>Year {y.year}</td>
                <td>{fK(y.propValue)}</td>
                <td>{fK(y.loanBal)}</td>
                <td>{fK(y.equityGain)}</td>
                <td className={y.cumCF < 0 ? 'neg' : 'pos'}>{fK(y.cumCF)}</td>
                <td className="pos">{fK(y.cumTax)}</td>
                <td className="pos">{fK(y.cumWealth)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3.5 px-3.5 py-3 rounded-lg bg-warn-bg border-l-[3px] border-warn text-xs text-ink-2 leading-relaxed">
        <strong className="text-ink">Recapture alert:</strong> ~{f$(r.recaptureLiability)} of accumulated depreciation will be
        subject to §1250 unrecaptured gain tax (25% federal) at sale. A 1031 exchange defers this indefinitely. The savings now
        are real — the recapture later is a planning problem, not a deal-killer.
      </div>
    </Panel>
  );
}
