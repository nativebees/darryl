# Darryl's Castle 🏠

> *"A man's home is his castle. And if it's the right one, it's his tax shelter too."*

A property investment calculator built for the 2027 IPO year — tax-strategy weighted scoring, REPS-aware depreciation modeling, cost segregation analysis, and real estate listing auto-population via Cloudflare Worker.

Built with **React + Vite + Tailwind CSS**. (The original zero-build vanilla version is preserved in [`legacy/`](legacy/) for reference.)

---

## What it does

- **Paste a Zillow / Redfin / Realtor.com URL** → auto-populates price, address, property tax (via Cloudflare Worker)
- **Picks smart defaults by market** — Palm Springs, Yucca Valley, Borrego Springs, Big Bear, etc. — including land allocation, rental yields, vacancy rates, and STR permit risk
- **Toggles STR vs. LTR** with appropriate expense ratios and yields
- **Models the OBBBA-restored 100% bonus depreciation** + cost segregation for 2027 purchases
- **Shows the 30-year breakeven chart** (cost vs. cumulative wealth) with breakeven year highlighted
- **Scores each property out of 100** weighted as: 40% IPO tax shield + 30% depreciation efficiency + 20% 10-year ROI + 10% cash flow
- **Saves history to localStorage** with a trend chart of all properties analyzed (the "pool room")
- **Exports / imports JSON** so the history is portable and backable-up

---

## Deployment

### Step 1: Deploy the Cloudflare Worker (5 min)

The Worker handles the listing scraping. Free tier is 100k requests/day — way more than you'll ever use.

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com/)
2. Sidebar → **Workers & Pages** → **Create** → **Create Worker**
3. Name it: `darryls-castle-scraper`
4. Click **Deploy** (with the default hello-world code, just to create it)
5. Click **Edit Code** on the deployed worker
6. Delete the default code, paste the entire contents of `worker.js`
7. Click **Save and Deploy**
8. Copy the worker URL (looks like `https://darryls-castle-scraper.YOUR-SUBDOMAIN.workers.dev`)

### Step 2: Configure the frontend

1. Open `src/lib/config.js`
2. Change the `WORKER_URL` near the top:
   ```js
   export const WORKER_URL = 'https://darryls-castle-scraper.YOUR-SUBDOMAIN.workers.dev';
   ```
   Paste your actual worker URL there.

### Step 3: Lock down CORS (recommended after testing)

Once you've deployed the GitHub Pages site (Step 4), edit `worker.js` and replace the `ALLOWED_ORIGINS` array:

```js
const ALLOWED_ORIGINS = [
  'https://YOUR-USERNAME.github.io'  // your GitHub Pages URL
];
```

Then redeploy the Worker. This stops random sites from using your scraper.

### Step 4: Build & deploy

This is now a Vite app, so there's a build step. `vite.config.js` sets `base: './'` so the built site works from any path (GitHub Pages project pages, Netlify, S3 subfolders, etc.).

```bash
npm install
npm run build      # outputs static files to dist/
```

Then deploy the contents of **`dist/`** to any static host:

- **GitHub Pages:** push `dist/` to a `gh-pages` branch (e.g. via `npx gh-pages -d dist`) or a GitHub Action, then set **Settings → Pages** to that branch. (You can no longer just upload the source files — they need building first.)
- **Netlify / Vercel / Cloudflare Pages:** set build command `npm run build` and publish directory `dist/`.

### Local development

```bash
npm install
npm run dev        # http://localhost:5173 with hot reload
```

---

## File structure

```
darryls-castle/
├── index.html              # Vite entry (mounts #root)
├── package.json            # deps + scripts (dev / build / preview)
├── vite.config.js          # base: './' for portable static hosting
├── tailwind.config.js      # design tokens (teal/slate palette, fonts)
├── src/
│   ├── main.jsx            # React entry
│   ├── App.jsx             # layout: app bar / hero / two-pane / pool room
│   ├── index.css           # Tailwind + slider/gauge/table styles
│   ├── lib/
│   │   ├── config.js       # WORKER_URL, market defaults, scoring tiers, quotes
│   │   ├── calc.js         # all financial calculations (ported verbatim)
│   │   ├── state.js        # form <-> calc-input mapping, market defaults
│   │   └── storage.js      # localStorage history + export/import
│   ├── hooks/
│   │   └── useAnalyzer.js   # state + live recalculation + actions
│   └── components/         # AppBar, Hero, InputRail, Verdict, Metrics,
│                           # LegalFlags, BreakevenChart, Projection,
│                           # ReturnStack, Depreciation, PoolRoom, ui
├── worker.js               # Cloudflare Worker for listing scraping (deploy separately)
├── legacy/                 # original zero-build vanilla version (reference)
└── README.md               # this file
```

The Worker is deployed separately from the static site — they communicate via fetch.

---

## Scoring algorithm

Every property gets a **Castle Score** out of 100:

| Component | Weight | What it measures |
|---|---|---|
| **IPO tax shield** | 40% | Year-1 tax savings as % of down payment. Hits 100 at 30%+ |
| **Depreciation efficiency** | 30% | Year-1 depreciation as % of improvements basis. Hits 100 at 15%+ |
| **10-year wealth ROI** | 20% | 10-year cumulative wealth / down payment. Hits 100 at 250%+ |
| **Year-1 cash flow** | 10% | Cash-on-cash return. 0% = 50 pts, 8%+ = 100 pts |

Without REPS active, the entire score gets halved — passive losses suspend above $150K MAGI, breaking the strategy.

| Score | Verdict | Quote |
|---|---|---|
| 90–100 | Clear winner | *"Straight to the pool room"* |
| 80–89 | Excellent | *"How's the serenity?"* |
| 70–79 | Solid buy | *"It's the vibe of the thing"* |
| 60–69 | Reasonable | *"What do you call this, Dale?"* |
| 50–59 | Marginal | *"What's the going rate?"* |
| 40–49 | Overpriced | *"Tell 'em they're dreamin'"* |
| 25–39 | Bad deal | *"It's not the Taj Mahal"* |
| 0–24 | Hard pass | *"Suffer in your jocks"* |

---

## Realistic limitations

- **Scraping is brittle.** Zillow's anti-bot detection blocks Worker IPs sometimes — the site degrades to manual entry gracefully when this happens. Realtor.com and Redfin tend to be more reliable.
- **localStorage only.** Property history lives in your browser. Use the export button regularly if you want a backup. It does not sync between devices.
- **Tax calculations are projections.** Final numbers depend on Kevin's actual filing decisions. This is a directional decision tool, not tax advice.
- **California non-conformity.** CA doesn't recognize OBBBA bonus depreciation — the calculator shows separate federal and CA depreciation lines so you understand the timing difference. Federal tax savings dominate; CA is a smaller secondary benefit.

---

## Updating the markets list

To add a new market (e.g., a new town you're scouting), edit `config.js`:

```js
const MARKETS = {
  // ... existing markets ...
  'twentynine-palms': {
    name: '29 Palms',
    landPct: 17,
    propTaxRate: 0.0118,
    strYieldPct: 14,
    ltrYieldPct: 5.8,
    strExpRatio: 36,
    ltrExpRatio: 26,
    strVacancy: 18,
    ltrVacancy: 8,
    appRate: 4.0,
    extraOpsPerK: 10,
    flags: [
      { type: 'ok', text: 'San Bernardino County — STR-friendly.' },
      { type: 'info', text: 'Marine Corps base proximity = stable rental floor.' }
    ]
  }
};
```

Then add the matching `<option>` in `index.html`.

---

Built for Sean & Jessi. IPO 2027. *Tell 'em they're dreamin'.*
