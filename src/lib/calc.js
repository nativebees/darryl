// ==============================================
// Darryl's Castle — calculation engine
// Ported verbatim from the vanilla build (app.js). The financial
// logic is intentionally unchanged — only DOM reads/writes were removed.
// ==============================================

// ----- FORMATTERS -----
export const f$ = (n) => '$' + Math.round(n).toLocaleString();
export const fK = (n) => {
  const v = Math.abs(n / 1000);
  const s = n < 0 ? '-' : '';
  return `${s}$${v >= 100 ? Math.round(v) : v.toFixed(0)}K`;
};
export const fPct = (n, d = 1) => (n * 100).toFixed(d) + '%';

// ----- CALCULATIONS -----
export function monthlyPayment(loan, annualRate, months) {
  if (!annualRate) return loan / months;
  const mr = annualRate / 12;
  return (loan * (mr * Math.pow(1 + mr, months))) / (Math.pow(1 + mr, months) - 1);
}

export function amortizeYear(balance, annualRate) {
  const mr = annualRate / 12;
  const pay = monthlyPayment(balance, annualRate, 360);
  let bal = balance,
    interest = 0,
    principal = 0;
  for (let i = 0; i < 12; i++) {
    const ip = bal * mr;
    const pp = pay - ip;
    interest += ip;
    principal += pp;
    bal -= pp;
  }
  return { interest, principal, endBal: bal, annualPay: pay * 12 };
}

export function calculate(s) {
  const totalInc = s.w2 + s.ipo;
  const improvements = s.price * (1 - s.landPct);
  const down = s.price * s.downPct;
  const totalInvestment = down + s.closingCosts; // Kevin uses Down + Closing as ROI denominator
  const loan = s.price - down;
  const shortL = improvements * s.costSegPct;
  const longL = improvements * (1 - s.costSegPct);

  // Year 1 federal depreciation (Aggressive: cost seg + bonus)
  const bonus = shortL * s.bonusDepRate;
  const regShortFed = shortL * (1 - s.bonusDepRate) * 0.2;
  const regLong = longL / 27.5;
  const depFed = bonus + regShortFed + regLong;
  const depCA = shortL * 0.2 + regLong;

  // Year 1 CONSERVATIVE depreciation (Kevin's view: straight-line 27.5 only)
  const depConservative = improvements / 27.5;

  // Rental
  const effRental = s.rental * (1 - s.vacancy);
  const opsFromRatio = effRental * s.expRatio;
  const ops = opsFromRatio + s.propTax + s.extraOps;
  const noi = effRental - ops;

  // Mortgage Y1
  const y1 = amortizeYear(loan, s.mortRate);

  // Tax — AGGRESSIVE (current strategy)
  const preDep = noi - y1.interest;
  const taxableFed = preDep - depFed;
  const taxableCA = preDep - depCA;
  let fedSav = 0,
    caSav = 0;
  if (s.reps) {
    if (taxableFed < 0) fedSav = Math.min(Math.abs(taxableFed), totalInc) * s.fedRate;
    if (taxableCA < 0) caSav = Math.min(Math.abs(taxableCA), totalInc) * s.caRate;
  }
  const totalTax = fedSav + caSav;

  // Tax — CONSERVATIVE (Kevin's view, straight-line only)
  const taxableConservative = preDep - depConservative;
  let totalTaxConservative = 0;
  if (s.reps && taxableConservative < 0) {
    totalTaxConservative = Math.min(Math.abs(taxableConservative), totalInc) * (s.fedRate + s.caRate);
  }

  const cashFlow = noi - y1.annualPay;
  const net1 = cashFlow + totalTax - s.csCost;
  const appGain = s.price * s.appRate;
  const wealth1 = cashFlow + totalTax + y1.principal + appGain;
  const cocROI = (cashFlow + totalTax) / down;
  const totalROI1 = (cashFlow + totalTax + appGain) / down;

  // KEVIN'S METRICS — universal real estate vocabulary
  const annualizedNOI = noi;
  const capRate = s.price > 0 ? annualizedNOI / s.price : 0;
  const dscr = y1.annualPay > 0 ? annualizedNOI / y1.annualPay : 0;

  // Long-term projections
  const projection = projectLongTerm(s, depFed, depCA, shortL, longL, loan, totalInc);
  const y5 = projection.years.find((y) => y.year === 5);
  const y10 = projection.years.find((y) => y.year === 10);
  const y30 = projection.years.find((y) => y.year === 30);

  // KEVIN'S 4-SOURCE RETURN STACK — years 1-5
  const returnStack = [];
  let prevValue = s.price;
  let prevLoanBal = loan;
  for (let y = 1; y <= 5; y++) {
    const yr = projection.years[y - 1];
    const annualPrincipal = prevLoanBal - yr.loanBal;
    const annualAppreciation = yr.propValue - prevValue;
    const cf = yr.cashFlow;
    const tx = yr.taxSav;
    const total = cf + annualPrincipal + tx + annualAppreciation;
    returnStack.push({
      year: y,
      cashFlow: cf,
      cashFlowROI: cf / totalInvestment,
      debtPaydown: annualPrincipal,
      debtPaydownROI: annualPrincipal / totalInvestment,
      taxSavings: tx,
      taxSavingsROI: tx / totalInvestment,
      appreciation: annualAppreciation,
      appreciationROI: annualAppreciation / totalInvestment,
      total,
      totalROI: total / totalInvestment,
    });
    prevValue = yr.propValue;
    prevLoanBal = yr.loanBal;
  }
  // Conservative 5-year tax savings (for comparison)
  const tax5Aggressive = returnStack.reduce((sum, y) => sum + y.taxSavings, 0);
  const tax5Conservative = totalTaxConservative * (1 + 0.65 * 4); // Y1 full + 4 years × 0.65 adj (matching projection logic)

  // Recapture at sale
  const totalDepTaken30 = depFed + (longL / 27.5) * 29;
  const recaptureLiability = Math.min(totalDepTaken30, improvements) * 0.25;

  // Score
  const scoreData = computeScore({
    s, totalInc, totalTax, depFed, improvements, down,
    cashFlow, y10wealth: y10 ? y10.cumWealth : 0, price: s.price,
  });

  return {
    improvements, down, totalInvestment, loan, shortL, longL,
    bonus, regShortFed, regLong, depFed, depCA, depConservative,
    effRental, ops, noi, y1, preDep,
    fedSav, caSav, totalTax, totalTaxConservative,
    cashFlow, net1, appGain, wealth1,
    cocROI, totalROI1,
    capRate, dscr,
    projection, y5, y10, y30,
    returnStack, tax5Aggressive, tax5Conservative,
    recaptureLiability,
    score: scoreData,
  };
}

export function projectLongTerm(s, depFed1, depCA1, shortL, longL, loan, totalInc) {
  const years = [];
  let bal = loan;
  let cumCF = 0,
    cumTax = 0,
    cumPri = 0,
    cumOutOfPocket = s.price * s.downPct + s.csCost;
  const remShortBasis = shortL * (1 - s.bonusDepRate);
  const macrs5 = [0, 0.2, 0.32, 0.192, 0.1152, 0.1152, 0.0576];

  for (let y = 1; y <= 30; y++) {
    const rentalY = s.rental * Math.pow(1 + s.rentGrowth, y - 1) * (1 - s.vacancy);
    const opsY =
      s.rental * Math.pow(1 + s.rentGrowth, y - 1) * (1 - s.vacancy) * s.expRatio +
      s.propTax * Math.pow(1.02, y - 1) +
      s.extraOps * Math.pow(1 + s.rentGrowth, y - 1);
    const noiY = rentalY - opsY;

    const am = amortizeYear(bal, s.mortRate);

    let depFedY = 0,
      depCAY = 0;
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
    let fS = 0,
      cS = 0;
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
    const equityGain = equity - s.price * s.downPct;
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
      cumCost: s.price * s.downPct + s.csCost + (cumCF < 0 ? Math.abs(cumCF) : 0),
    });

    bal = am.endBal;
  }
  return { years };
}

export function computeScore({ s, totalInc, totalTax, depFed, improvements, down, cashFlow, y10wealth, price }) {
  // Tax-strategy weighted: 40% IPO shield + 30% dep efficiency + 20% long-term ROI + 10% cash flow

  // Component 1: IPO tax shield (40%)
  const taxShieldPct = down > 0 ? totalTax / down : 0;
  const taxShieldScore = Math.min(100, (taxShieldPct / 0.3) * 100);

  // Component 2: Depreciation efficiency (30%)
  const depEffPct = improvements > 0 ? depFed / improvements : 0;
  const depEffScore = Math.min(100, (depEffPct / 0.15) * 100);

  // Component 3: 10-year ROI on down (20%)
  const roi10 = down > 0 ? y10wealth / down : 0;
  const roi10Score = Math.min(100, (roi10 / 2.5) * 100);

  // Component 4: Year 1 cash flow on down (10%)
  const cocPct = down > 0 ? cashFlow / down : 0;
  let cfScore;
  if (cocPct >= 0.08) cfScore = 100;
  else if (cocPct >= 0) cfScore = 50 + (cocPct / 0.08) * 50;
  else cfScore = Math.max(0, 50 + (cocPct / 0.1) * 50);

  // No REPS = catastrophic penalty
  let total;
  if (!s.reps) {
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
      { label: 'Year 1 cash flow', weight: 10, score: Math.round(cfScore), detail: `${fPct(cocPct)} cash-on-cash` },
    ],
  };
}
