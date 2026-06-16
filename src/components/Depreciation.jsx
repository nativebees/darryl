import { Receipt } from 'lucide-react';
import { Panel, PanelHeader } from './ui.jsx';
import { f$, fPct } from '../lib/calc.js';

function Row({ label, value, indent, total, pos }) {
  const base = total
    ? 'border-t-2 border-line-strong font-bold mt-1.5 pt-2.5 text-sm'
    : 'border-b border-line py-2 text-[13px]';
  return (
    <div className={`flex justify-between gap-3 ${base} ${indent ? 'pl-[18px] !text-xs text-ink-3' : ''}`}>
      <span className="text-ink-2">{label}</span>
      <span className={`font-mono tnum ${pos ? 'text-success' : 'text-ink'}`}>{value}</span>
    </div>
  );
}

export default function Depreciation({ s, r }) {
  return (
    <Panel>
      <PanelHeader icon={Receipt} title="Depreciation waterfall — Year 1" sub="How the tax shield is built" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Row label="Improvements (depreciable basis)" value={f$(r.improvements)} />
          <Row label={`Cost-seg short-life portion (${Math.round(s.costSegPct * 100)}%)`} value={f$(r.shortL)} />
          <Row indent label={`→ Bonus dep (${Math.round(s.bonusDepRate * 100)}%) — federal only`} value={f$(r.bonus)} pos />
          <Row indent label="→ Regular MACRS yr 1 (20%)" value={f$(r.regShortFed)} />
          <Row label="27.5-yr straight-line (longer-life)" value={f$(r.regLong)} />
          <Row total label="Total federal Year 1 depreciation" value={f$(r.depFed)} pos />
          <Row label="CA Year 1 depreciation (no bonus conformity)" value={f$(r.depCA)} />
        </div>
        <div>
          <Row label="Effective rental income" value={f$(r.effRental)} />
          <Row label="Operating expenses + property tax" value={`- ${f$(r.ops)}`} />
          <Row label="Net operating income" value={f$(r.noi)} />
          <Row label="− Year 1 mortgage interest" value={`- ${f$(r.y1.interest)}`} />
          <Row label="Pre-depreciation taxable income" value={f$(r.preDep)} />
          <Row label="− Federal depreciation" value={`- ${f$(r.depFed)}`} />
          <Row total label="Federal taxable loss (offsets W2 with REPS)" value={f$(Math.min(0, r.preDep - r.depFed))} pos />
          <Row label={`× Federal marginal rate (${fPct(s.fedRate, 0)})`} value={f$(r.fedSav)} pos />
          <Row label={`+ CA tax savings (${fPct(s.caRate, 1)})`} value={f$(r.caSav)} pos />
        </div>
      </div>
    </Panel>
  );
}
