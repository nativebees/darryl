import { useRef } from 'react';
import { Castle, Save, Download, Upload } from 'lucide-react';
import { Button } from './ui.jsx';

export default function AppBar({ onSave, onExport, onImport }) {
  const fileRef = useRef(null);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-7 py-3 bg-white/80 backdrop-blur-md backdrop-saturate-150 border-b border-line">
      <div className="flex items-center gap-3 min-w-0">
        <span className="grid place-items-center w-[38px] h-[38px] rounded-[10px] text-white shrink-0 shadow-sm bg-gradient-to-br from-primary to-primary-strong">
          <Castle size={21} strokeWidth={2} />
        </span>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-semibold text-[15.5px] tracking-tight text-ink">Darryl's Castle</span>
          <span className="font-mono text-[10.5px] tracking-wider text-ink-3 uppercase truncate">
            Property Investment Analyzer
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="primary" icon={Save} onClick={onSave} title="Save this analysis to your history" className="!px-3.5 !py-2">
          <span className="hidden md:inline">Save analysis</span>
        </Button>
        <Button variant="ghost" icon={Download} onClick={onExport} title="Export history as JSON" className="!px-3.5 !py-2">
          <span className="hidden md:inline">Export</span>
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files[0]) onImport(e.target.files[0]);
            e.target.value = '';
          }}
        />
        <Button variant="ghost" icon={Upload} onClick={() => fileRef.current?.click()} title="Import history from JSON" className="!px-3.5 !py-2">
          <span className="hidden md:inline">Import</span>
        </Button>
      </div>
    </header>
  );
}
