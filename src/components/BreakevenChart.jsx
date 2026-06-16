import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend,
} from 'chart.js';
import { LineChart } from 'lucide-react';
import { Panel, PanelHeader } from './ui.jsx';
import { f$, fK } from '../lib/calc.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function BreakevenChart({ s, r }) {
  const projection = r.projection;
  const { data, options } = useMemo(() => {
    const years = projection.years.map((y) => 'Yr ' + y.year);
    return {
      data: {
        labels: years,
        datasets: [
          {
            label: 'Cumulative wealth created',
            data: projection.years.map((y) => y.cumWealth),
            borderColor: '#0F766E',
            backgroundColor: 'rgba(15, 118, 110, 0.10)',
            fill: true, tension: 0.3, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5,
          },
          {
            label: 'Property value gain',
            data: projection.years.map((y) => y.propValue - s.price),
            borderColor: '#0369A1', borderDash: [4, 4], borderWidth: 1.5,
            fill: false, tension: 0.3, pointRadius: 0, pointHoverRadius: 4,
          },
          {
            label: 'Cumulative out-of-pocket',
            data: projection.years.map((y) => y.cumOutOfPocket),
            borderColor: '#DC2626', borderWidth: 1.5, fill: false, tension: 0.1, pointRadius: 0, pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { family: "'IBM Plex Sans', sans-serif", size: 12 }, color: '#475569', usePointStyle: true, pointStyle: 'circle', padding: 16 },
          },
          tooltip: {
            backgroundColor: '#0F172A', padding: 12, cornerRadius: 8,
            titleFont: { family: "'IBM Plex Sans', sans-serif", size: 13, weight: '600' },
            bodyFont: { family: "'IBM Plex Mono', monospace", size: 11 },
            callbacks: { label: (ctx) => `${ctx.dataset.label}: ${f$(ctx.raw)}` },
          },
        },
        scales: {
          x: { grid: { color: 'rgba(148, 163, 184, 0.22)' }, ticks: { font: { family: "'IBM Plex Mono', monospace", size: 10 }, color: '#64748B', maxTicksLimit: 10 } },
          y: { grid: { color: 'rgba(148, 163, 184, 0.22)' }, ticks: { font: { family: "'IBM Plex Mono', monospace", size: 10 }, color: '#64748B', callback: (v) => fK(v) } },
        },
      },
    };
  }, [projection, s.price]);

  const breakeven = projection.years.find((y) => y.cumWealth >= 0);
  const finalY = projection.years[projection.years.length - 1];

  const stats = [
    { label: 'Wealth turns positive', value: breakeven ? 'Year ' + breakeven.year : 'Never (in 30 yrs)', pos: !!breakeven },
    { label: '10-year wealth created', value: fK(projection.years[9].cumWealth), pos: true },
    { label: '30-year wealth created', value: fK(finalY.cumWealth), pos: true },
  ];

  return (
    <Panel>
      <PanelHeader icon={LineChart} title="Cost vs. wealth — 30-year breakeven" sub="When does this property pay for itself?" />
      <div className="relative h-[360px] my-2.5">
        <Line data={data} options={options} aria-label="Breakeven chart: cumulative cost vs cumulative wealth over 30 years" role="img" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-[18px] pt-[18px] border-t border-line">
        {stats.map((st) => (
          <div key={st.label} className="text-center bg-surfaceAlt border border-line rounded-lg py-3.5 px-2.5">
            <div className="text-[10.5px] text-ink-3 uppercase tracking-wide mb-1.5 font-medium">{st.label}</div>
            <div className={`font-bold text-[21px] tnum ${st.pos ? 'text-success' : 'text-danger'}`}>{st.value}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
