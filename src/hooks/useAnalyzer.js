import { useMemo, useState, useCallback } from 'react';
import { calculate } from '../lib/calc.js';
import { tierForScore, WORKER_URL } from '../lib/config.js';
import {
  buildState, applyMarketDefaults, initialForm, savedStateToForm, guessMarket,
} from '../lib/state.js';
import {
  loadHistory, saveHistory, exportHistoryFile, mergeImported,
} from '../lib/storage.js';

export function useAnalyzer() {
  const [form, setForm] = useState(initialForm);
  const [rentalMode, setRentalModeState] = useState('str');
  const [history, setHistory] = useState(() => loadHistory());
  const [fetchStatus, setFetchStatus] = useState({
    type: 'info',
    text: 'Redfin works best · Zillow blocks scrapers · you can always enter details manually.',
  });

  // Live recalculation — recomputes only when inputs change
  const s = useMemo(() => buildState(form, rentalMode), [form, rentalMode]);
  const r = useMemo(() => calculate(s), [s]);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setMarket = useCallback((marketKey) => {
    setForm((prev) => applyMarketDefaults(prev, marketKey, rentalMode));
  }, [rentalMode]);

  const setRentalMode = useCallback((mode) => {
    setRentalModeState(mode);
    setForm((prev) => applyMarketDefaults(prev, prev.market, mode));
  }, []);

  const fetchListing = useCallback(async () => {
    const url = (form.listingUrl || '').trim();
    if (!url) {
      setFetchStatus({ type: 'warn', text: 'Paste a listing URL first.' });
      return;
    }
    if (WORKER_URL.includes('YOUR-SUBDOMAIN')) {
      setFetchStatus({ type: 'warn', text: 'Worker not configured yet — see README. Manual entry still works.' });
      return;
    }
    const base = WORKER_URL.replace(/\/$/, '');
    setFetchStatus({ type: 'info', text: "Darryl's digging…" });
    try {
      const res = await fetch(`${base}/?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!data.ok) {
        const suggestion = data.suggestion ? ` · ${data.suggestion}` : '';
        setFetchStatus({ type: 'error', text: `${data.error || "Couldn't fetch"}${suggestion}` });
        return;
      }
      const p = data.property || {};
      setForm((prev) => {
        let next = { ...prev };
        if (p.address) next.address = p.address;
        if (p.price) next.price = p.price;
        if (p.propTax) next.propTax = p.propTax;
        const mg = guessMarket(p.city);
        if (mg) next = applyMarketDefaults(next, mg, rentalMode);
        return next;
      });
      const note = data.note ? ` · ${data.note}` : '';
      setFetchStatus({ type: 'success', text: `Got it from ${data.source}. Filled what I could; verify the rest.${note}` });
    } catch (e) {
      setFetchStatus({ type: 'error', text: `Network error (${e.message}). Fill it in manually.` });
    }
  }, [form.listingUrl, rentalMode]);

  const saveCurrent = useCallback(() => {
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
        wealth30: r.y30.cumWealth,
      },
    };
    setHistory((prev) => {
      const next = [entry, ...prev];
      saveHistory(next);
      return next;
    });
  }, [s, r]);

  const deleteEntry = useCallback((id) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const loadEntry = useCallback((id) => {
    const e = history.find((p) => p.id === id);
    if (!e) return;
    setForm(savedStateToForm(e.state));
    setRentalModeState(e.state.rentalMode || 'str');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [history]);

  const exportHistory = useCallback(() => exportHistoryFile(), []);

  const importFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { merged, importedCount } = mergeImported(ev.target.result);
        setHistory(merged);
        // eslint-disable-next-line no-alert
        alert(`Imported ${importedCount} properties.`);
      } catch (err) {
        // eslint-disable-next-line no-alert
        alert('Could not import: ' + err.message);
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    form, rentalMode, s, r, history, fetchStatus,
    setField, setMarket, setRentalMode,
    fetchListing, saveCurrent, deleteEntry, loadEntry, exportHistory, importFile,
  };
}
