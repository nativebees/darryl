// ==============================================
// Darryl's Castle — config & static reference data
// ==============================================

// >>> CHANGE THIS to your deployed Cloudflare Worker URL <<<
const WORKER_URL = 'https://darryls-castle-scraper.sean-gillespie-ny.workers.dev/';

// Market defaults — keyed by select dropdown value
const MARKETS = {
  'palm-springs': {
    name: 'Palm Springs',
    landPct: 22,
    propTaxRate: 0.0125,
    strYieldPct: 14,           // gross annual STR rental as % of price
    ltrYieldPct: 5.5,
    strExpRatio: 38,
    ltrExpRatio: 28,
    strVacancy: 18,
    ltrVacancy: 6,
    appRate: 4.0,
    extraOpsPerK: 11,          // extra ops $/year per $1k of value (insurance, utilities)
    flags: [
      { type: 'warn', text: 'STR permit density cap is 20% per neighborhood. El Rancho Vista Estates is over the cap — waiting list only.' },
      { type: 'info', text: 'Junior STR permit available (limited bookings/year, not subject to density cap).' },
      { type: 'info', text: '29+ day rentals do not require an STR permit.' },
      { type: 'warn', text: 'Mills Act eligibility for historic properties — meaningful property tax relief once approved.' }
    ]
  },
  'yucca-valley': {
    name: 'Yucca Valley / Joshua Tree',
    landPct: 18,
    propTaxRate: 0.0118,
    strYieldPct: 16,
    ltrYieldPct: 6.0,
    strExpRatio: 36,
    ltrExpRatio: 26,
    strVacancy: 16,
    ltrVacancy: 7,
    appRate: 4.5,
    extraOpsPerK: 10,
    flags: [
      { type: 'ok', text: 'San Bernardino County: STR permits available with no current density cap.' },
      { type: 'info', text: 'TOT (transient occupancy tax) applies — 7% of gross STR revenue.' },
      { type: 'info', text: 'Strong cost-seg advantage from low land allocation (typical 15–20%).' },
      { type: 'warn', text: 'Joshua Tree National Park proximity drives STR demand — but also draws scrutiny on noise/parking ordinances.' }
    ]
  },
  'borrego': {
    name: 'Borrego Springs',
    landPct: 15,
    propTaxRate: 0.0115,
    strYieldPct: 13,
    ltrYieldPct: 5.0,
    strExpRatio: 35,
    ltrExpRatio: 25,
    strVacancy: 22,
    ltrVacancy: 10,
    appRate: 3.5,
    extraOpsPerK: 9,
    flags: [
      { type: 'ok', text: 'San Diego County rural — minimal STR regulation currently.' },
      { type: 'info', text: 'Strong seasonal demand (Oct–Apr) — wildflower season especially.' },
      { type: 'warn', text: 'Summer demand collapses (115°F+) — model conservative occupancy.' },
      { type: 'info', text: 'Lowest land allocation in SoCal — exceptional cost-seg leverage.' }
    ]
  },
  'cathedral-city': {
    name: 'Cathedral City',
    landPct: 24,
    propTaxRate: 0.0128,
    strYieldPct: 11,
    ltrYieldPct: 5.8,
    strExpRatio: 36,
    ltrExpRatio: 27,
    strVacancy: 18,
    ltrVacancy: 7,
    appRate: 4.0,
    extraOpsPerK: 11,
    flags: [
      { type: 'info', text: 'STR permits available, lighter restrictions than Palm Springs.' },
      { type: 'info', text: 'Lower entry prices than Palm Springs proper for similar STR yields.' }
    ]
  },
  'palm-desert': {
    name: 'Palm Desert / La Quinta',
    landPct: 28,
    propTaxRate: 0.013,
    strYieldPct: 11,
    ltrYieldPct: 5.5,
    strExpRatio: 38,
    ltrExpRatio: 28,
    strVacancy: 20,
    ltrVacancy: 7,
    appRate: 3.5,
    extraOpsPerK: 12,
    flags: [
      { type: 'warn', text: 'La Quinta has tight STR enforcement — most of the city is in restricted zones.' },
      { type: 'warn', text: 'Palm Desert: STRs limited to specific zones, permit caps in residential areas.' },
      { type: 'info', text: 'HOA restrictions common in country-club communities — verify before purchase.' }
    ]
  },
  'big-bear': {
    name: 'Big Bear',
    landPct: 35,
    propTaxRate: 0.012,
    strYieldPct: 12,
    ltrYieldPct: 5.0,
    strExpRatio: 42,
    ltrExpRatio: 30,
    strVacancy: 25,
    ltrVacancy: 12,
    appRate: 3.0,
    extraOpsPerK: 14,
    flags: [
      { type: 'warn', text: 'STR permit cap reached — waiting list, transfers between properties only.' },
      { type: 'warn', text: 'High operating costs — snow removal, freeze protection, higher insurance.' },
      { type: 'warn', text: 'Higher land allocation (30–40%) reduces depreciable basis vs. desert markets.' }
    ]
  },
  'idyllwild': {
    name: 'Idyllwild',
    landPct: 38,
    propTaxRate: 0.0115,
    strYieldPct: 11,
    ltrYieldPct: 4.8,
    strExpRatio: 40,
    ltrExpRatio: 28,
    strVacancy: 26,
    ltrVacancy: 12,
    appRate: 2.5,
    extraOpsPerK: 13,
    flags: [
      { type: 'warn', text: 'Riverside County recent STR moratorium discussions — regulatory risk.' },
      { type: 'warn', text: 'Wildfire insurance is expensive and increasingly hard to obtain.' },
      { type: 'warn', text: 'Mountain land allocation (35–40%) significantly reduces cost-seg upside.' }
    ]
  },
  'other-desert': {
    name: 'Other CA desert',
    landPct: 20,
    propTaxRate: 0.012,
    strYieldPct: 12,
    ltrYieldPct: 5.5,
    strExpRatio: 36,
    ltrExpRatio: 27,
    strVacancy: 20,
    ltrVacancy: 8,
    appRate: 3.5,
    extraOpsPerK: 10,
    flags: [
      { type: 'info', text: 'Verify city-specific STR ordinances before committing.' }
    ]
  },
  'other-ca': {
    name: 'Other California',
    landPct: 35,
    propTaxRate: 0.012,
    strYieldPct: 8,
    ltrYieldPct: 4.5,
    strExpRatio: 38,
    ltrExpRatio: 28,
    strVacancy: 12,
    ltrVacancy: 5,
    appRate: 3.0,
    extraOpsPerK: 12,
    flags: [
      { type: 'warn', text: 'Coastal CA: high land allocation reduces cost-seg leverage substantially.' },
      { type: 'warn', text: 'Most CA cities now have some form of STR permit restriction — verify.' }
    ]
  }
};

// Castle quotes by score tier (drives verdict text + history badge)
const TIERS = [
  { min: 90, tier: 1, quote: "Straight to the pool room",
    headline: "Clear winner — deploy capital immediately",
    rationale: "Tax shield, depreciation efficiency, and long-term wealth all firing. This is exactly what 2027 was supposed to look like." },
  { min: 80, tier: 2, quote: "How's the serenity?",
    headline: "Excellent buy — strong on every axis",
    rationale: "Tax-strategy fit is high and the long-term economics support the price. Not perfect, but very close." },
  { min: 70, tier: 2, quote: "It's the vibe of the thing — and the vibe's good",
    headline: "Solid buy — make an offer",
    rationale: "Returns are above benchmark when tax savings are included. Negotiate hard on price for upside." },
  { min: 60, tier: 3, quote: "What do you call this, Dale? An opportunity.",
    headline: "Reasonable — proceed with eyes open",
    rationale: "The numbers work but margin is thinner than ideal. Stress-test the rental assumptions before closing." },
  { min: 50, tier: 3, quote: "What's the going rate?",
    headline: "Marginal — needs renegotiation",
    rationale: "On the edge. Either price comes down 8–12%, or rental income needs to come in higher than projected." },
  { min: 40, tier: 4, quote: "Tell 'em they're dreamin'",
    headline: "Overpriced — pass unless seller motivated",
    rationale: "The asking price doesn't justify the financial profile. Walk unless you can take 15%+ off." },
  { min: 25, tier: 4, quote: "I'm not paying that. It's not the Taj Mahal.",
    headline: "Bad deal — economics are wrong",
    rationale: "Even with maximum tax leverage, this property doesn't generate enough wealth over 10 years to justify the capital." },
  { min: 0, tier: 5, quote: "Suffer in your jocks",
    headline: "Hard pass",
    rationale: "Wrong property, wrong market, or wrong price. Don't tie up capital here when better deals exist." }
];

function tierForScore(score) {
  return TIERS.find(t => score >= t.min) || TIERS[TIERS.length - 1];
}
