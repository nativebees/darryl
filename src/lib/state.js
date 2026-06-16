// ==============================================
// Form state <-> calc-input ("s") mapping.
// Mirrors the vanilla readState / applyMarketDefaults / loadProperty logic
// exactly so results are identical to the original build.
// ==============================================
import { MARKETS } from './config.js';

// Raw UI defaults (as displayed in the controls, before market defaults applied)
export const BASE_DEFAULTS = {
  address: '',
  listingUrl: '',
  market: 'yucca-valley',
  price: 450000,
  propTax: 5400,
  landPct: 20,
  downPct: 25,
  mortRate: 7.0,
  costSeg: 25,
  bonusDep: 100,
  csCost: 5000,
  closingCosts: 9000,
  rental: 65000,
  vacancy: 15,
  expRatio: 35,
  rentGrowth: 3,
  appRate: 4,
  extraOps: 4800,
  w2: 250000,
  ipo: 500000,
  fedRate: 37,
  caRate: 13.3,
  reps: '1',
  psStrategy: 'rotate',
};

// Convert UI form values into the unit-normalised "s" object calculate() expects.
export function buildState(form, rentalMode) {
  return {
    address: form.address || 'Untitled property',
    listingUrl: form.listingUrl || '',
    market: form.market,
    price: +form.price || 0,
    propTax: +form.propTax || 0,
    landPct: +form.landPct / 100,
    downPct: +form.downPct / 100,
    mortRate: +form.mortRate / 100,
    costSegPct: +form.costSeg / 100,
    bonusDepRate: +form.bonusDep / 100,
    csCost: +form.csCost || 0,
    closingCosts: +form.closingCosts || 0,
    rental: +form.rental || 0,
    vacancy: +form.vacancy / 100,
    expRatio: +form.expRatio / 100,
    rentGrowth: +form.rentGrowth / 100,
    appRate: +form.appRate / 100,
    extraOps: +form.extraOps || 0,
    w2: +form.w2 || 0,
    ipo: +form.ipo || 0,
    fedRate: +form.fedRate / 100,
    caRate: +form.caRate / 100,
    reps: form.reps === '1',
    psStrategy: form.psStrategy,
    rentalMode,
  };
}

// Apply a market's smart defaults to the form (price-aware), for the given mode.
export function applyMarketDefaults(form, marketKey, mode) {
  const m = MARKETS[marketKey];
  if (!m) return form;
  const price = +form.price || 450000;
  const next = { ...form, market: marketKey };
  next.landPct = m.landPct;
  next.propTax = Math.round(price * m.propTaxRate);
  next.appRate = m.appRate;
  next.extraOps = Math.round((price * m.extraOpsPerK) / 1000);
  if (mode === 'str') {
    next.rental = Math.round((price * m.strYieldPct) / 100);
    next.expRatio = m.strExpRatio;
    next.vacancy = m.strVacancy;
  } else {
    next.rental = Math.round((price * m.ltrYieldPct) / 100);
    next.expRatio = m.ltrExpRatio;
    next.vacancy = m.ltrVacancy;
  }
  return next;
}

// Build the initial form: base defaults with the default market applied (matches vanilla init).
export function initialForm() {
  return applyMarketDefaults({ ...BASE_DEFAULTS }, BASE_DEFAULTS.market, 'str');
}

// Restore a saved "s" object back into UI form values (inverse of buildState).
export function savedStateToForm(s) {
  return {
    address: s.address || '',
    listingUrl: s.listingUrl || '',
    market: s.market,
    price: s.price,
    propTax: s.propTax,
    landPct: Math.round(s.landPct * 100),
    downPct: Math.round(s.downPct * 100),
    mortRate: +(s.mortRate * 100).toFixed(1),
    costSeg: Math.round(s.costSegPct * 100),
    bonusDep: Math.round(s.bonusDepRate * 100),
    csCost: s.csCost,
    closingCosts: s.closingCosts,
    rental: s.rental,
    vacancy: Math.round(s.vacancy * 100),
    expRatio: Math.round(s.expRatio * 100),
    rentGrowth: +(s.rentGrowth * 100).toFixed(1),
    appRate: +(s.appRate * 100).toFixed(1),
    extraOps: s.extraOps,
    w2: s.w2,
    ipo: s.ipo,
    fedRate: +(s.fedRate * 100).toFixed(1),
    caRate: +(s.caRate * 100).toFixed(1),
    reps: s.reps ? '1' : '0',
    psStrategy: s.psStrategy,
  };
}

// Map a scraped listing payload onto a market key (mirrors vanilla applyScrapedData)
export function guessMarket(city) {
  const cityLower = (city || '').toLowerCase();
  if (cityLower.includes('palm springs')) return 'palm-springs';
  if (cityLower.includes('yucca') || cityLower.includes('joshua')) return 'yucca-valley';
  if (cityLower.includes('borrego')) return 'borrego';
  if (cityLower.includes('cathedral')) return 'cathedral-city';
  if (cityLower.includes('palm desert') || cityLower.includes('la quinta')) return 'palm-desert';
  if (cityLower.includes('big bear')) return 'big-bear';
  if (cityLower.includes('idyllwild')) return 'idyllwild';
  return null;
}
