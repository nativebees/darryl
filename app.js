// ==============================================
// Darryl's Castle — main application logic
// ==============================================

let chartInstance = null;
let trendChartInstance = null;
let rentalMode = 'str'; // 'str' or 'ltr'

// ----- FORMATTERS -----
const f$ = (n) => '$' + Math.round(n).toLocaleString();
const fK = (n) => {
  const v = Math.abs(n / 1000);
  const s = n < 0 ? '-' : '';
  return `${s}$${v >= 100 ? Math.round(v) : v.toFixed(0)}K`;
};
const fPct = (n, d = 1) => (n * 100).toFixed(d) + '%';

// ----- STATE READ -----
function readState() {
  return {
    address: document.getElementById('address').value || 'Untitled property',
    listingUrl: document.getElementById('listingUrl').value || '',
    market: document.getElementById('market').value,
    price: +document.getElementById('price').value || 0,
    propTax: +document.getElementById('propTax').value || 0,
    landPct: +document.getElementById('landPct').value / 100,
    downPct: +document.getElementById('downPct').value / 100,
    mortRate: +document.getElementById('mortRate').value / 100,
    costSegPct: +document.getElementById('costSeg').value / 100,
    bonusDepRate: +document.getElementById('bonusDep').value / 100,
    csCost: +document.getElementById('csCost').value || 0,
    rental: +document.getElementById('rental').value || 0,
    vacancy: +document.getElementById('vacancy').value / 100,
    expRatio: +document.getElementById('expRatio').value / 100,
    rentGrowth: +document.getElementById('rentGrowth').value / 100,
    appRate: +document.getElementById('appRate').value / 100,
    extraOps: +document.getElementById('extraOps').value || 0,
    w2: +document.getElementById('w2').value || 0,
    ipo: +document.getElementById('ipo').value || 0,
    fedRate: +document.getElementById('fedRate').value / 100,
    caRate: +document.getElementById('caRate').value / 100,
    reps: document.getElementById('reps').value === '1',
    psStrategy: document.getElementById('psStrategy').value,
    rentalMode
  };
}

// ----- CALCULATIONS -----
function monthlyPayment(loan, annualRate, months) {
  if (!annualRate) return loan / months;
  const mr = annualRate / 12;
  return loan * (mr * Math.pow(1 + mr, months)) / (Math.pow(1 + mr, months) - 1);
}

function amortizeYear(balance, annualRate) {
  const mr = annualRate / 12;
  const pay = monthlyPayment(balance, annualRate, 360);
  let bal = balance, interest = 0, principal = 0;
  for (let i = 0; i < 12; i++) {
    const ip = bal * mr;
    const pp = pay - ip;
    interest += ip;
    principal += pp;
    bal -= pp;
  }
  return { interest, principal, endBal: bal, annualPay: pay * 12 };
}

function calculate(s) {
  const totalInc = s.w2 + s.ipo;
  const improvements = s.price * (1 - s.landPct);
  const down = s.price * s.downPct;
  const loan = s.price - down;
  const shortL = improvements * s.costSegPct;
  const longL = improvements * (1 - s.costSegPct);

  // Year 1 federal depreciation
  const bonus = shortL * s.bonusDepRate;
  const regShortFed = shortL * (1 - s.bonusDepRate) * 0.20;
  const regLong = longL / 27.5;
  const depFed = bonus + regShortFed + regLong;
  const depCA = shortL * 0.20 + regLong; // CA no bonus conformity

  // Rental
  const effRental = s.rental * (1 - s.vacancy);
  const opsFromRatio = effRental * s.expRatio;
  const ops = opsFromRatio + s.propTax + s.extraOps;
  const noi = effRental - ops;

  // Mortgage Y1
  const y1 = amortizeYear(loan, s.mortRate);

  // Tax
  const preDep = noi - y1.interest;
  const taxableFed = preDep - depFed;
  const taxableCA = preDep - depCA;
  let fedSav = 0, caSav = 0;
  if (s.reps) {
    if (taxableFed < 0) fedSav = Math.min(Math.abs(taxableFed), totalInc) * s.fedRate;
    if (taxableCA < 0) caSav = Math.min(Math.abs(taxableCA), totalInc) * s.caRate;
  }
  const totalTax = fedSav + caSav;
  const cashFlow = noi - y1.annualPay;
  const net1 = cashFlow + totalTax - s.csCost;
  const appGain = s.price * s.appRate;
  const wealth1 = cashFlow + totalTax + y1.principal + appGain;
  const cocROI = (cashFlow + totalTax) / down;
  const totalROI1 = (cashFlow + totalTax + appGain) / down;

  // Long-term projections
  const projection = projectLongTerm(s, depFed, depCA, shortL, longL, loan, totalInc);
  const y5 = projection.years.find(y => y.year === 5);
  const y10 = projection.years.find(y => y.year === 10);
  const y30 = projection.years.find(y => y.year === 30);

  // Recapture at sale (estimated at year 30 or earlier exit)
  const totalDepTaken30 = depFed + (longL / 27.5) * 29;
  const recaptureLiability = Math.min(totalDepTaken30, improvements) * 0.25;

  // Score
  const scoreData = computeScore({
    s, totalInc, totalTax, depFed, improvements, down,
    cashFlow, y10wealth: y10 ? y10.cumWealth : 0, price: s.price
  });

  return {
    improvements, down, loan, shortL, longL,
    bonus, regShortFed, regLong, depFed, depCA,
    effRental, ops, noi, y1, preDep,
    fedSav, caSav, totalTax, cashFlow, net1, appGain, wealth1,
    cocROI, totalROI1,
    projection, y5, y10, y30,
    recaptureLiability,
    score: scoreData
  };
}

function projectLongTerm(s, depFed1, depCA1, shortL, longL, loan, totalInc) {
  const years = [];
  let bal = loan;
  let cumCF = 0, cumTax = 0, cumPri = 0, cumOutOfPocket = s.price * s.downPct + s.csCost;
  const remShortBasis = shortL * (1 - s.bonusDepRate);
  const macrs5 = [0, 0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576];

  for (let y = 1; y <= 30; y++) {
    const rentalY = s.rental * Math.pow(1 + s.rentGrowth, y - 1) * (1 - s.vacancy);
    const opsY = (s.rental * Math.pow(1 + s.rentGrowth, y - 1) * (1 - s.vacancy)) * s.expRatio
                 + s.propTax * Math.pow(1.02, y - 1)
                 + s.extraOps * Math.pow(1 + s.rentGrowth, y - 1);
    const noiY = rentalY - opsY;

    const am = amortizeYear(bal, s.mortRate);

    let depFedY = 0, depCAY = 0;
    if (y === 1) {
      depFedY = depFed1;
      depCAY = depCA1;
    } else {
      if (remShortBasis > 0 && y <= 5) {
        depFedY += remShortBasis * (macrs5[y] || 0);
      }
      depCAY += shortL * (macrs5[y] || 0);
      if (y <= 27) {
        depFedY += longL / 27.5;
        depCAY += longL / 27.5;
      }
    }

    const preY = noiY - am.interest;
    let fS = 0, cS = 0;
    if (s.reps) {
      if (preY - depFedY < 0) fS = Math.min(Math.abs(preY - depFedY), totalInc) * s.fedRate;
      if (preY - depCAY < 0) cS = Math.min(Math.abs(preY - depCAY), totalInc) * s.caRate;
    }
    // Years 2+ use a lower assumed rate (post-IPO income drops)
    const adj = y === 1 ? 1 : 0.65;
    const yearTax = (fS + cS) * adj;
    const cf = noiY - am.annualPay;

    cumCF += cf;
    cumTax += yearTax;
    cumPri += am.principal;
    if (cf < 0) cumOutOfPocket += Math.abs(cf);

    const propVal = s.price * Math.pow(1 + s.appRate, y);
    const equity = propVal - am.endBal;
    const equityGain = equity - (s.price * s.downPct);
    const cumWealth = equityGain + cumCF + cumTax;

    years.push({
      year: y,
      noi: noiY,
      cashFlow: cf,
      taxSav: yearTax,
      cumCF, cumTax, cumPrincipal: cumPri,
      propValue: propVal,
      loanBal: am.endBal,
      equityGain,
      cumWealth,
      cumOutOfPocket,
      cumCost: s.price * s.downPct + s.csCost + (cumCF < 0 ? Math.abs(cumCF) : 0)
    });

    bal = am.endBal;
  }
  return { years };
}

function computeScore({ s, totalInc, totalTax, depFed, improvements, down, cashFlow, y10wealth, price }) {
  // Tax-strategy weighted: 40% IPO shield + 30% dep efficiency + 20% long-term ROI + 10% cash flow

  // Component 1: IPO tax shield (40%)
  // Benchmark: tax savings as % of down payment
  // 0% = 0 pts, 30%+ = 100 pts
  const taxShieldPct = down > 0 ? totalTax / down : 0;
  const taxShieldScore = Math.min(100, (taxShieldPct / 0.30) * 100);

  // Component 2: Depreciation efficiency (30%)
  // Year 1 dep / improvements (how much of basis is being deducted)
  // 5% = 30 pts, 15% = 100 pts
  const depEffPct = improvements > 0 ? depFed / improvements : 0;
  const depEffScore = Math.min(100, (depEffPct / 0.15) * 100);

  // Component 3: 10-year ROI on down (20%)
  // 100% = 50 pts, 250%+ = 100 pts
  const roi10 = down > 0 ? y10wealth / down : 0;
  const roi10Score = Math.min(100, (roi10 / 2.5) * 100);

  // Component 4: Year 1 cash flow on down (10%)
  // -10% = 0, 0% = 50, 8%+ = 100
  const cocPct = down > 0 ? cashFlow / down : 0;
  let cfScore;
  if (cocPct >= 0.08) cfScore = 100;
  else if (cocPct >= 0) cfScore = 50 + (cocPct / 0.08) * 50;
  else cfScore = Math.max(0, 50 + (cocPct / 0.10) * 50);

  // No REPS = catastrophic penalty
  let total;
  if (!s.reps) {
    // Without REPS, tax savings are zero, so taxShieldScore = 0 already
    // But also penalize the overall score because the strategy doesn't work
    total = (taxShieldScore * 0.4 + depEffScore * 0.3 + roi10Score * 0.2 + cfScore * 0.1) * 0.5;
  } else {
    total = taxShieldScore * 0.4 + depEffScore * 0.3 + roi10Score * 0.2 + cfScore * 0.1;
  }

  total = Math.max(0, Math.min(100, Math.round(total)));

  return {
    total,
    components: [
      { label: 'IPO tax shield', weight: 40, score: Math.round(taxShieldScore), detail: `${fPct(taxShieldPct)} of down payment` },
      { label: 'Depreciation efficiency', weight: 30, score: Math.round(depEffScore), detail: `${fPct(depEffPct)} of improvements` },
      { label: '10-year wealth (ROI)', weight: 20, score: Math.round(roi10Score), detail: `${fPct(roi10)} on down payment` },
      { label: 'Year 1 cash flow', weight: 10, score: Math.round(cfScore), detail: `${fPct(cocPct)} cash-on-cash` }
    ]
  };
}

// ----- MARKET DEFAULTS APPLY -----
function applyMarketDefaults(marketKey) {
  const m = MARKETS[marketKey];
  if (!m) return;
  const price = +document.getElementById('price').value || 450000;
  document.getElementById('landPct').value = m.landPct;
  document.getElementById('propTax').value = Math.round(price * m.propTaxRate);
  document.getElementById('appRate').value = m.appRate;
  document.getElementById('extraOps').value = Math.round(price * m.extraOpsPerK / 1000);
  if (rentalMode === 'str') {
    document.getElementById('rental').value = Math.round(price * m.strYieldPct / 100);
    document.getElementById('expRatio').value = m.strExpRatio;
    document.getElementById('vacancy').value = m.strVacancy;
  } else {
    document.getElementById('rental').value = Math.round(price * m.ltrYieldPct / 100);
    document.getElementById('expRatio').value = m.ltrExpRatio;
    document.getElementById('vacancy').value = m.ltrVacancy;
  }
  refreshSliderLabels();
  recalc();
}

function setRentalMode(mode) {
  rentalMode = mode;
  document.getElementById('btnStr').classList.toggle('active', mode === 'str');
  document.getElementById('btnLtr').classList.toggle('active', mode === 'ltr');
  document.getElementById('rentHint').textContent = mode === 'str'
    ? 'STR estimate based on market & price'
    : 'LTR estimate based on market & price';
  document.getElementById('expHint').textContent = mode === 'str'
    ? 'STR: 30–40% (cleaning, platform fees, mgmt)'
    : 'LTR: 20–30% (maintenance, mgmt, turnover)';
  applyMarketDefaults(document.getElementById('market').value);
}

// ----- RENDERING -----
function render(s, r) {
  renderLegal(s.market);
  renderVerdict(r);
  renderMetrics(r);
  renderChart(s, r.projection);
  renderProjection(s, r);
  renderDepreciation(s, r);
}

function renderLegal(marketKey) {
  const m = MARKETS[marketKey];
  const panel = document.getElementById('legalPanel');
  if (!m || !m.flags || !m.flags.length) { panel.innerHTML = ''; return; }
  const allOk = m.flags.every(f => f.type === 'ok' || f.type === 'info');
  panel.className = allOk ? 'panel panel-flag panel-flag-ok' : 'panel panel-flag';
  const items = m.flags.map(f => {
    const tag = f.type === 'warn' ? '<strong>Heads up:</strong>'
              : f.type === 'ok' ? '<strong>Friendly:</strong>'
              : '<strong>FYI:</strong>';
    return `<li>${tag} ${f.text}</li>`;
  }).join('');
  panel.innerHTML = `
    <p class="flag-title">Local rules &amp; regulations — ${m.name}</p>
    <ul class="flag-list">${items}</ul>
  `;
}

function renderVerdict(r) {
  const t = tierForScore(r.score.total);
  const panel = document.getElementById('verdictPanel');
  const compBars = r.score.components.map(c => `
    <div class="score-bar">
      <div class="score-bar-label">${c.label} (${c.weight}%)</div>
      <div class="score-bar-track"><div class="score-bar-fill" style="width:${c.score}%"></div></div>
      <div class="score-bar-val">${c.score}/100 · ${c.detail}</div>
    </div>
  `).join('');

  panel.innerHTML = `
    <div class="verdict verdict-tier-${t.tier}">
      <div class="verdict-row">
        <div class="verdict-score-block">
          <div><span class="verdict-score">${r.score.total}</span><span class="verdict-score-max">/100</span></div>
          <div class="verdict-score-label">Castle Score</div>
        </div>
        <div class="verdict-text">
          <p class="verdict-quote">${t.quote}</p>
          <p class="verdict-headline">${t.headline}</p>
          <p class="verdict-rationale">${t.rationale}</p>
        </div>
      </div>
      <div class="score-breakdown">${compBars}</div>
    </div>
  `;
}

function renderMetrics(r) {
  const panel = document.getElementById('metricsPanel');
  panel.innerHTML = `
    <div class="metrics">
      <div class="metric">
        <p class="metric-label">Year 1 tax savings</p>
        <p class="metric-value pos">${f$(r.totalTax)}</p>
        <p class="metric-sub">Fed ${f$(r.fedSav)} + CA ${f$(r.caSav)}</p>
      </div>
      <div class="metric">
        <p class="metric-label">Year 1 cash flow</p>
        <p class="metric-value ${r.cashFlow < 0 ? 'neg' : 'pos'}">${f$(r.cashFlow)}</p>
        <p class="metric-sub">${f$(r.noi)} NOI − ${f$(r.y1.annualPay)} debt svc</p>
      </div>
      <div class="metric">
        <p class="metric-label">Net Year 1 position</p>
        <p class="metric-value ${r.net1 < 0 ? 'neg' : 'pos'}">${f$(r.net1)}</p>
        <p class="metric-sub">After cost-seg study cost</p>
      </div>
      <div class="metric">
        <p class="metric-label">Year 1 total ROI</p>
        <p class="metric-value ${r.totalROI1 > 0.1 ? 'pos' : r.totalROI1 > 0 ? 'warn' : 'neg'}">${fPct(r.totalROI1)}</p>
        <p class="metric-sub">Incl. appreciation</p>
      </div>
    </div>
  `;
}

function renderChart(s, projection) {
  const ctx = document.getElementById('breakevenChart');
  if (!ctx) return;
  if (chartInstance) chartInstance.destroy();

  const years = projection.years.map(y => y.year);
  const wealthLine = projection.years.map(y => y.cumWealth);
  const costLine = projection.years.map(y => y.cumOutOfPocket);
  const propValueLine = projection.years.map(y => y.propValue - s.price);
  const equityLine = projection.years.map(y => y.equityGain);

  // Find breakeven year (cumWealth >= 0, since we subtract initial down to compute equity gain)
  const breakeven = projection.years.find(y => y.cumWealth >= 0);

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years.map(y => 'Yr ' + y),
      datasets: [
        {
          label: 'Cumulative wealth created',
          data: wealthLine,
          borderColor: '#5C7A1E',
          backgroundColor: 'rgba(92, 122, 30, 0.10)',
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5
        },
        {
          label: 'Property value gain',
          data: propValueLine,
          borderColor: '#5A8B9E',
          borderDash: [4, 4],
          borderWidth: 1.5,
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4
        },
        {
          label: 'Cumulative out-of-pocket',
          data: costLine,
          borderColor: '#A8392B',
          borderWidth: 1.5,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: "'DM Sans', sans-serif", size: 12 },
            color: '#5C4633',
            usePointStyle: true,
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: '#2E1F12',
          titleFont: { family: "'Bree Serif', serif", size: 13 },
          bodyFont: { family: "'Space Mono', monospace", size: 11 },
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${f$(ctx.raw)}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(212, 196, 168, 0.3)' },
          ticks: {
            font: { family: "'Space Mono', monospace", size: 10 },
            color: '#8B7560',
            maxTicksLimit: 10
          }
        },
        y: {
          grid: { color: 'rgba(212, 196, 168, 0.3)' },
          ticks: {
            font: { family: "'Space Mono', monospace", size: 10 },
            color: '#8B7560',
            callback: (v) => fK(v)
          }
        }
      }
    }
  });

  // Breakeven summary
  const beSummary = document.getElementById('breakevenSummary');
  const finalY = projection.years[projection.years.length - 1];
  beSummary.innerHTML = `
    <div class="be-stat">
      <div class="be-stat-label">Wealth turns positive</div>
      <div class="be-stat-value pos">${breakeven ? 'Year ' + breakeven.year : 'Never (in 30 yrs)'}</div>
    </div>
    <div class="be-stat">
      <div class="be-stat-label">10-year wealth created</div>
      <div class="be-stat-value pos">${fK(projection.years[9].cumWealth)}</div>
    </div>
    <div class="be-stat">
      <div class="be-stat-label">30-year wealth created</div>
      <div class="be-stat-value pos">${fK(finalY.cumWealth)}</div>
    </div>
  `;
}

function renderProjection(s, r) {
  const milestones = [r.projection.years[0], r.y5, r.y10, r.y30];
  const rows = milestones.map(y => `
    <tr>
      <td>Year ${y.year}</td>
      <td>${fK(y.propValue)}</td>
      <td>${fK(y.loanBal)}</td>
      <td>${fK(y.equityGain)}</td>
      <td class="${y.cumCF < 0 ? 'tdv neg' : 'tdv pos'}">${fK(y.cumCF)}</td>
      <td class="tdv pos">${fK(y.cumTax)}</td>
      <td class="tdv pos">${fK(y.cumWealth)}</td>
    </tr>
  `).join('');

  document.getElementById('projectionPanel').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <span class="panel-num">06</span>
        <h2 class="panel-title">Long-term wealth projection</h2>
        <span class="panel-sub">${fPct(s.appRate)} appreciation · ${fPct(s.rentGrowth)} rental growth · REPS active</span>
      </div>
      <table class="proj-table">
        <thead>
          <tr>
            <th>Milestone</th><th>Property value</th><th>Loan balance</th><th>Equity gain</th>
            <th>Cum. cash flow</th><th>Cum. tax savings</th><th>Total wealth</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top: 14px; padding: 12px 14px; background: var(--warn-bg); border-left: 3px solid var(--warn); font-size: 12px; color: var(--ink-2); line-height: 1.5;">
        <strong>Recapture alert:</strong> ~${f$(r.recaptureLiability)} of accumulated depreciation will be subject to §1250 unrecaptured gain tax (25% federal) at sale. A 1031 exchange defers this indefinitely. The savings now are real — the recapture later is a planning problem, not a deal-killer.
      </div>
    </div>
  `;
}

function renderDepreciation(s, r) {
  document.getElementById('depPanel').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <span class="panel-num">07</span>
        <h2 class="panel-title">Depreciation waterfall — Year 1</h2>
        <span class="panel-sub">How the tax shield is built</span>
      </div>
      <div class="grid-2">
        <div>
          <div class="dep-row"><span class="dep-label">Improvements (depreciable basis)</span><span class="dep-value">${f$(r.improvements)}</span></div>
          <div class="dep-row"><span class="dep-label">Cost-seg short-life portion (${Math.round(s.costSegPct*100)}%)</span><span class="dep-value">${f$(r.shortL)}</span></div>
          <div class="dep-row indent"><span class="dep-label">→ Bonus dep (${Math.round(s.bonusDepRate*100)}%) — federal only</span><span class="dep-value pos">${f$(r.bonus)}</span></div>
          <div class="dep-row indent"><span class="dep-label">→ Regular MACRS yr 1 (20%)</span><span class="dep-value">${f$(r.regShortFed)}</span></div>
          <div class="dep-row"><span class="dep-label">27.5-yr straight-line (longer-life)</span><span class="dep-value">${f$(r.regLong)}</span></div>
          <div class="dep-row total"><span class="dep-label">Total federal Year 1 depreciation</span><span class="dep-value pos">${f$(r.depFed)}</span></div>
          <div class="dep-row"><span class="dep-label">CA Year 1 depreciation (no bonus conformity)</span><span class="dep-value">${f$(r.depCA)}</span></div>
        </div>
        <div>
          <div class="dep-row"><span class="dep-label">Effective rental income</span><span class="dep-value">${f$(r.effRental)}</span></div>
          <div class="dep-row"><span class="dep-label">Operating expenses + property tax</span><span class="dep-value">- ${f$(r.ops)}</span></div>
          <div class="dep-row"><span class="dep-label">Net operating income</span><span class="dep-value">${f$(r.noi)}</span></div>
          <div class="dep-row"><span class="dep-label">− Year 1 mortgage interest</span><span class="dep-value">- ${f$(r.y1.interest)}</span></div>
          <div class="dep-row"><span class="dep-label">Pre-depreciation taxable income</span><span class="dep-value">${f$(r.preDep)}</span></div>
          <div class="dep-row"><span class="dep-label">− Federal depreciation</span><span class="dep-value">- ${f$(r.depFed)}</span></div>
          <div class="dep-row total"><span class="dep-label">Federal taxable loss (offsets W2 with REPS)</span><span class="dep-value pos">${f$(Math.min(0, r.preDep - r.depFed))}</span></div>
          <div class="dep-row"><span class="dep-label">× Federal marginal rate (${fPct(s.fedRate, 0)})</span><span class="dep-value pos">${f$(r.fedSav)}</span></div>
          <div class="dep-row"><span class="dep-label">+ CA tax savings (${fPct(s.caRate, 1)})</span><span class="dep-value pos">${f$(r.caSav)}</span></div>
        </div>
      </div>
    </div>
  `;
}

// ----- URL FETCH (Cloudflare Worker) -----
async function fetchListing() {
  const url = document.getElementById('listingUrl').value.trim();
  const status = document.getElementById('fetchStatus');
  if (!url) {
    status.className = 'fetch-status warn';
    status.textContent = 'Paste a listing URL first.';
    return;
  }
  if (WORKER_URL.includes('YOUR-SUBDOMAIN')) {
    status.className = 'fetch-status warn';
    status.textContent = 'Worker not configured yet — see README for deployment. Manual entry still works.';
    return;
  }
  // Strip trailing slash to avoid double-slash in fetch
  const base = WORKER_URL.replace(/\/$/, '');
  status.className = 'fetch-status';
  status.textContent = "Darryl's digging...";
  try {
    const r = await fetch(`${base}/?url=${encodeURIComponent(url)}`);
    const data = await r.json();
    if (!data.ok) {
      // Show error + suggestion if worker provided one
      const suggestion = data.suggestion ? ` · ${data.suggestion}` : '';
      status.className = 'fetch-status error';
      status.textContent = `${data.error || 'Couldn\'t fetch'}${suggestion}`;
      return;
    }
    applyScrapedData(data.property);
    status.className = 'fetch-status success';
    const note = data.note ? ` · ${data.note}` : '';
    status.textContent = `Got it from ${data.source}. Filled what I could; verify the rest.${note}`;
  } catch (e) {
    status.className = 'fetch-status error';
    status.textContent = `Network error (${e.message}). Fill it in manually.`;
  }
}

function applyScrapedData(p) {
  if (p.address) document.getElementById('address').value = p.address;
  if (p.price) document.getElementById('price').value = p.price;
  if (p.propTax) document.getElementById('propTax').value = p.propTax;
  // Try to map a city/zip to one of our markets
  if (p.city || p.zip) {
    const cityLower = (p.city || '').toLowerCase();
    let marketGuess = null;
    if (cityLower.includes('palm springs')) marketGuess = 'palm-springs';
    else if (cityLower.includes('yucca') || cityLower.includes('joshua')) marketGuess = 'yucca-valley';
    else if (cityLower.includes('borrego')) marketGuess = 'borrego';
    else if (cityLower.includes('cathedral')) marketGuess = 'cathedral-city';
    else if (cityLower.includes('palm desert') || cityLower.includes('la quinta')) marketGuess = 'palm-desert';
    else if (cityLower.includes('big bear')) marketGuess = 'big-bear';
    else if (cityLower.includes('idyllwild')) marketGuess = 'idyllwild';
    if (marketGuess) {
      document.getElementById('market').value = marketGuess;
      applyMarketDefaults(marketGuess);
    }
  }
  refreshSliderLabels();
  recalc();
}

// ----- HISTORY (localStorage) -----
const HISTORY_KEY = 'darryls-castle-history-v1';

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch (e) { return []; }
}

function saveHistory(arr) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
}

function saveCurrentProperty() {
  const s = readState();
  const r = calculate(s);
  const arr = loadHistory();
  const entry = {
    id: 'p_' + Date.now(),
    saved: new Date().toISOString(),
    state: s,
    score: r.score.total,
    quote: tierForScore(r.score.total).quote,
    metrics: {
      taxSav: r.totalTax,
      cashFlow: r.cashFlow,
      net1: r.net1,
      wealth10: r.y10.cumWealth,
      wealth30: r.y30.cumWealth
    }
  };
  arr.unshift(entry);
  saveHistory(arr);
  renderHistory();
}

function deleteProperty(id) {
  saveHistory(loadHistory().filter(e => e.id !== id));
  renderHistory();
}

function loadProperty(id) {
  const e = loadHistory().find(p => p.id === id);
  if (!e) return;
  const s = e.state;
  Object.keys(s).forEach(k => {
    const el = document.getElementById(k === 'rental' ? 'rental' : k);
    if (!el) return;
    if (k === 'reps') el.value = s.reps ? '1' : '0';
    else if (k === 'rentalMode') { /* handled below */ }
    else if (typeof s[k] === 'number' && (k.endsWith('Pct') || k.endsWith('Rate') || k === 'vacancy' || k === 'expRatio' || k === 'rentGrowth' || k === 'appRate' || k === 'landPct' || k === 'downPct' || k === 'costSegPct' || k === 'bonusDepRate' || k === 'mortRate' || k === 'fedRate' || k === 'caRate')) {
      el.value = Math.round(s[k] * 1000) / 10;
    } else {
      el.value = s[k];
    }
  });
  // Specific overrides for rate fields shown as %
  document.getElementById('mortRate').value = (s.mortRate * 100).toFixed(1);
  document.getElementById('fedRate').value = (s.fedRate * 100).toFixed(1);
  document.getElementById('caRate').value = (s.caRate * 100).toFixed(1);
  document.getElementById('landPct').value = Math.round(s.landPct * 100);
  document.getElementById('downPct').value = Math.round(s.downPct * 100);
  document.getElementById('costSeg').value = Math.round(s.costSegPct * 100);
  document.getElementById('bonusDep').value = Math.round(s.bonusDepRate * 100);
  document.getElementById('vacancy').value = Math.round(s.vacancy * 100);
  document.getElementById('expRatio').value = Math.round(s.expRatio * 100);
  document.getElementById('rentGrowth').value = (s.rentGrowth * 100).toFixed(1);
  document.getElementById('appRate').value = (s.appRate * 100).toFixed(1);
  setRentalMode(s.rentalMode || 'str');
  refreshSliderLabels();
  recalc();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHistory() {
  const arr = loadHistory();
  const list = document.getElementById('historyList');
  if (!arr.length) {
    list.innerHTML = '<div class="history-empty">"This pool room\'s a bit empty — save a property to start filling it up."</div>';
    document.getElementById('historyTrend').innerHTML = '';
    return;
  }
  list.innerHTML = arr.map(e => {
    const tier = tierForScore(e.score);
    return `
      <div class="history-item">
        <div class="history-score-circle tier-${tier.tier}">${e.score}</div>
        <div class="history-info">
          <p class="history-name">${escapeHtml(e.state.address || 'Untitled')}</p>
          <p class="history-meta">${MARKETS[e.state.market]?.name || e.state.market} · ${f$(e.state.price)} · ${f$(e.metrics.taxSav)} tax sav · ${fK(e.metrics.wealth10)} (10yr)</p>
        </div>
        <div class="history-quote">"${tier.quote}"</div>
        <div class="history-actions">
          <button class="history-btn" onclick="loadProperty('${e.id}')">Load</button>
          <button class="history-btn del" onclick="if(confirm('Remove this property?')) deleteProperty('${e.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');

  // Render trend chart
  if (arr.length >= 2) {
    renderTrendChart(arr.slice().reverse());
  } else {
    document.getElementById('historyTrend').innerHTML = '';
  }
}

function renderTrendChart(arr) {
  const wrap = document.getElementById('historyTrend');
  wrap.innerHTML = '<canvas id="trendCanvas" role="img" aria-label="Trend chart of property scores over time"></canvas>';
  const ctx = document.getElementById('trendCanvas');
  if (trendChartInstance) trendChartInstance.destroy();
  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: arr.map((e, i) => 'P' + (i + 1)),
      datasets: [{
        label: 'Score',
        data: arr.map(e => e.score),
        borderColor: '#B85C3A',
        backgroundColor: 'rgba(184, 92, 58, 0.15)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#B85C3A',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, ticks: { font: { family: "'Space Mono', monospace", size: 10 }, color: '#8B7560' }, grid: { color: 'rgba(212,196,168,0.3)' } },
        x: { ticks: { font: { family: "'Space Mono', monospace", size: 10 }, color: '#8B7560' }, grid: { display: false } }
      }
    }
  });
}

function exportHistory() {
  const data = loadHistory();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `darryls-castle-history-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importHistory(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Invalid format');
      const existing = loadHistory();
      const merged = [...data, ...existing];
      const seen = new Set();
      const dedup = merged.filter(e => seen.has(e.id) ? false : (seen.add(e.id), true));
      saveHistory(dedup);
      renderHistory();
      alert(`Imported ${data.length} properties.`);
    } catch (err) {
      alert('Could not import: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ----- UTILITIES -----
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

function refreshSliderLabels() {
  document.getElementById('landVal').textContent = document.getElementById('landPct').value + '%';
  document.getElementById('downVal').textContent = document.getElementById('downPct').value + '%';
  document.getElementById('csVal').textContent = document.getElementById('costSeg').value + '%';
  document.getElementById('bdVal').textContent = document.getElementById('bonusDep').value + '%';
  document.getElementById('vacVal').textContent = document.getElementById('vacancy').value + '%';
  document.getElementById('expVal').textContent = document.getElementById('expRatio').value + '%';
  document.getElementById('rgVal').textContent = document.getElementById('rentGrowth').value + '%';
  document.getElementById('apVal').textContent = document.getElementById('appRate').value + '%';
}

// ----- MAIN RECALC -----
function recalc() {
  const s = readState();
  const r = calculate(s);
  render(s, r);
}

// ----- EVENT WIRING -----
function init() {
  // All inputs trigger recalc
  ['address','listingUrl','price','propTax','mortRate','csCost','rental','extraOps','w2','ipo','fedRate','caRate'].forEach(id => {
    document.getElementById(id).addEventListener('input', recalc);
  });
  ['reps','psStrategy'].forEach(id => {
    document.getElementById(id).addEventListener('change', recalc);
  });
  // Sliders update label + recalc
  ['landPct','downPct','costSeg','bonusDep','vacancy','expRatio','rentGrowth','appRate'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      refreshSliderLabels();
      recalc();
    });
  });
  // Market change applies defaults
  document.getElementById('market').addEventListener('change', e => applyMarketDefaults(e.target.value));
  // Rental mode toggle
  document.getElementById('btnStr').addEventListener('click', () => setRentalMode('str'));
  document.getElementById('btnLtr').addEventListener('click', () => setRentalMode('ltr'));
  // URL fetch
  document.getElementById('fetchBtn').addEventListener('click', fetchListing);
  document.getElementById('listingUrl').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); fetchListing(); } });
  // Save / export / import
  document.getElementById('saveBtn').addEventListener('click', saveCurrentProperty);
  document.getElementById('exportBtn').addEventListener('click', exportHistory);
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importInput').click());
  document.getElementById('importInput').addEventListener('change', e => {
    if (e.target.files[0]) importHistory(e.target.files[0]);
  });

  refreshSliderLabels();
  applyMarketDefaults(document.getElementById('market').value);
  renderHistory();
  recalc();
}

document.addEventListener('DOMContentLoaded', init);
