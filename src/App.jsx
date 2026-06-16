import { useAnalyzer } from './hooks/useAnalyzer.js';
import AppBar from './components/AppBar.jsx';
import Hero from './components/Hero.jsx';
import InputRail from './components/InputRail.jsx';
import Verdict from './components/Verdict.jsx';
import Metrics from './components/Metrics.jsx';
import LegalFlags from './components/LegalFlags.jsx';
import BreakevenChart from './components/BreakevenChart.jsx';
import Projection from './components/Projection.jsx';
import ReturnStack from './components/ReturnStack.jsx';
import Depreciation from './components/Depreciation.jsx';
import PoolRoom from './components/PoolRoom.jsx';

export default function App() {
  const a = useAnalyzer();

  return (
    <>
      <AppBar onSave={a.saveCurrent} onExport={a.exportHistory} onImport={a.importFile} />

      <Hero
        listingUrl={a.form.listingUrl}
        onListingUrlChange={(v) => a.setField('listingUrl', v)}
        onFetch={a.fetchListing}
        fetchStatus={a.fetchStatus}
      />

      <main>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-12 grid grid-cols-1 lg:grid-cols-[minmax(360px,430px)_1fr] gap-6 items-start">
          <InputRail
            form={a.form}
            rentalMode={a.rentalMode}
            setField={a.setField}
            setMarket={a.setMarket}
            setRentalMode={a.setRentalMode}
          />

          <div className="flex flex-col gap-[18px] min-w-0">
            <Verdict r={a.r} />
            <Metrics r={a.r} />
            <LegalFlags marketKey={a.form.market} />
            <BreakevenChart s={a.s} r={a.r} />
            <Projection s={a.s} r={a.r} />
            <ReturnStack s={a.s} r={a.r} />
            <Depreciation s={a.s} r={a.r} />
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pb-2">
          <PoolRoom history={a.history} onLoad={a.loadEntry} onDelete={a.deleteEntry} />
        </div>
      </main>

      <footer className="mt-2 py-8 px-7 text-center border-t border-line">
        <p className="font-serif italic text-base text-ink-2 m-0 mb-2">"Tell him he's dreamin'."</p>
        <p className="text-[11px] text-ink-3 font-mono m-0 tracking-wide">Built for Sean &amp; Jessi · IPO 2027 · A Stella production</p>
      </footer>
    </>
  );
}
