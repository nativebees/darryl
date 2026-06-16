import { Search } from 'lucide-react';

const statusColor = {
  info: 'text-ink-3',
  success: 'text-success',
  warn: 'text-warn',
  error: 'text-danger',
};

export default function Hero({ listingUrl, onListingUrlChange, onFetch, fetchStatus }) {
  return (
    <section className="relative px-4 sm:px-7 pt-11 pb-7 text-center">
      <div className="max-w-[760px] mx-auto">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-primary-strong bg-primary-soft px-3 py-1.5 rounded-full mb-[18px]">
          <span className="w-[7px] h-[7px] rounded-full bg-primary shadow-[0_0_0_3px_rgba(15,118,110,0.18)]" />
          2027 IPO year · tax-strategy weighted
        </span>

        <h1 className="font-semibold leading-[1.04] tracking-[-0.028em] text-ink m-0 mb-3.5 text-[clamp(34px,6vw,52px)]">
          Know if it's{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">worth buying</span>
          <br />
          before you make the offer.
        </h1>

        <p className="font-serif italic text-ink-2 mx-auto mb-2 max-w-[600px] leading-snug text-[clamp(16px,2.4vw,19px)]">
          "A man's home is his castle. And if it's the right one, it's his tax shelter too."
        </p>
        <p className="text-[13px] text-ink-3 m-0">
          Paste any listing — we model depreciation, cash flow, and 30-year wealth, then score it out of 100.
        </p>

        <div className="max-w-[660px] mx-auto mt-6">
          <div className="flex gap-2.5 p-[7px] bg-surface border border-line-strong rounded-2xl shadow-md transition-shadow focus-within:border-primary focus-within:shadow-[0_4px_16px_-2px_rgba(15,23,42,0.08),0_0_0_3px_rgba(15,118,110,0.22)]">
            <input
              type="url"
              aria-label="Listing URL"
              value={listingUrl}
              onChange={(e) => onListingUrlChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); onFetch(); }
              }}
              placeholder="Paste a Redfin, Zillow or Realtor.com listing URL…"
              className="flex-1 min-w-0 font-mono text-[13.5px] px-3.5 py-2.5 bg-transparent border-none rounded-lg text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button
              onClick={onFetch}
              className="inline-flex items-center gap-2 shrink-0 font-semibold text-sm rounded-lg bg-primary text-white px-5 py-2.5 shadow-sm transition-all hover:bg-primary-strong active:translate-y-px focus-visible:outline-none focus-visible:shadow-ring"
            >
              <Search size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Fetch listing</span>
            </button>
          </div>
          <div className={`text-[12.5px] mt-3 font-mono min-h-4 ${statusColor[fetchStatus.type] || 'text-ink-3'}`}>
            {fetchStatus.text}
          </div>
        </div>
      </div>
    </section>
  );
}
