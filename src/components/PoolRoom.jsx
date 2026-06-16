import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';
import { Waves } from 'lucide-react';
import { Panel, PanelHeader } from './ui.jsx';
import { tierForScore, MARKETS } from '../lib/config.js';
import { f$, fK } from '../lib/calc.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const TIER_GRADIENT = {
  1: 'linear-gradient(145deg,#10B981,#059669)',
  2: 'linear-gradient(145deg,#14B8A6,#0F766E)',
  3: 'linear-gradient(145deg,#0EA5E9,#0369A1)',
  4: 'linear-gradient(145deg,#F59E0B,#D97706)',
  5: 'linear-gradient(145deg,#EF4444,#DC2626)',
};

function TrendChart({ history }) {
  const arr = history.slice().reverse(); // oldest first
  const data = {
    labels: arr.map((_, i) => 'P' + (i + 1)),
    datasets: [
      {
        label: 'Score',
        data: arr.map((e) => e.score),
        borderColor: '#0F766E',
        backgroundColor: 'rgba(15, 118, 110, 0.12)',
        borderWidth: 2, tension: 0.35, fill: true,
        pointBackgroundColor: '#0F766E', pointBorderColor: '#ffffff', pointBorderWidth: 1.5, pointRadius: 4,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, ticks: { font: { family: "'IBM Plex Mono', monospace", size: 10 }, color: '#64748B' }, grid: { color: 'rgba(148,163,184,0.22)' } },
      x: { ticks: { font: { family: "'IBM Plex Mono', monospace", size: 10 }, color: '#64748B' }, grid: { display: false } },
    },
  };
  return (
    <div className="h-[150px] mb-[18px] relative">
      <Line data={data} options={options} aria-label="Trend chart of property scores over time" role="img" />
    </div>
  );
}

export default function PoolRoom({ history, onLoad, onDelete }) {
  return (
    <Panel>
      <PanelHeader icon={Waves} title="The pool room" sub="Properties you've analysed · trends · trophies" />

      {history.length >= 2 && <TrendChart history={history} />}

      {history.length === 0 ? (
        <div className="text-center py-9 px-4 text-ink-3 italic font-serif text-base">
          "This pool room's a bit empty — save a property to start filling it up."
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {history.map((e) => {
            const tier = tierForScore(e.score);
            return (
              <div key={e.id} className="flex items-center gap-4 flex-wrap p-3.5 sm:p-4 bg-surface border border-line rounded-xl transition-all hover:border-line-strong hover:shadow-sm hover:-translate-y-px">
                <div
                  className="w-[50px] h-[50px] rounded-[13px] grid place-items-center font-bold text-[19px] text-white shrink-0 tnum shadow-xs"
                  style={{ background: TIER_GRADIENT[tier.tier] }}
                >
                  {e.score}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink m-0 mb-0.5 truncate">{e.state.address || 'Untitled'}</p>
                  <p className="text-[11px] text-ink-3 font-mono tnum m-0">
                    {MARKETS[e.state.market]?.name || e.state.market} · {f$(e.state.price)} · {f$(e.metrics.taxSav)} tax sav · {fK(e.metrics.wealth10)} (10yr)
                  </p>
                </div>
                <div className="italic font-serif text-[13px] text-ink-2 text-right max-w-[200px] hidden sm:block">"{tier.quote}"</div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onLoad(e.id)}
                    className="px-2.5 py-1.5 text-[11px] font-medium bg-surface border border-line-strong rounded-md text-ink-2 hover:bg-surfaceAlt hover:text-ink transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Remove this property?')) onDelete(e.id); }}
                    className="px-2.5 py-1.5 text-[11px] font-medium bg-surface border border-line-strong rounded-md text-ink-2 hover:bg-danger-bg hover:border-danger hover:text-danger transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
