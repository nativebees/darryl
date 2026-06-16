import { ChevronDown } from 'lucide-react';

// ---- Panel + header ----
export function Panel({ children, className = '' }) {
  return (
    <section className={`bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function PanelHeader({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pb-3.5 mb-4 border-b border-line">
      {Icon && (
        <span className="grid place-items-center w-[30px] h-[30px] rounded-lg bg-deep text-primary shrink-0">
          <Icon size={17} strokeWidth={2} />
        </span>
      )}
      <h2 className="font-semibold text-[17px] tracking-tight text-ink m-0 whitespace-nowrap">{title}</h2>
      {sub && <span className="basis-full sm:basis-auto sm:ml-auto sm:text-right text-xs text-ink-3 pl-[42px] sm:pl-0">{sub}</span>}
    </div>
  );
}

// ---- Hint chip ----
export function Hint({ children }) {
  return (
    <span className="inline-block text-[10px] text-accent-strong bg-accent-soft px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
      {children}
    </span>
  );
}

// ---- Field wrapper (label + control + optional helper) ----
export function Field({ label, hint, suffix, htmlFor, children, helper }) {
  return (
    <div className="mt-4 first:mt-0">
      <label htmlFor={htmlFor} className="flex items-center flex-wrap gap-1.5 text-[12.5px] text-ink-2 font-medium mb-1.5">
        <span>{label}</span>
        {hint && <Hint>{hint}</Hint>}
        {suffix}
      </label>
      {children}
      {helper && <p className="text-[11px] text-ink-3 mt-1.5 leading-snug">{helper}</p>}
    </div>
  );
}

const inputBase =
  'w-full text-sm px-3 py-2.5 border border-line-strong rounded-lg bg-surface text-ink tnum ' +
  'transition-colors placeholder:text-ink-faint hover:border-[#AEBACA] ' +
  'focus:outline-none focus:border-primary focus:shadow-ring';

export function TextInput({ id, value, onChange, placeholder }) {
  return (
    <input
      id={id}
      type="text"
      className={inputBase}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function NumberInput({ id, value, onChange, step }) {
  return (
    <input
      id={id}
      type="number"
      step={step}
      inputMode="decimal"
      className={`${inputBase} font-mono`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SelectInput({ id, value, onChange, children }) {
  return (
    <div className="relative">
      <select
        id={id}
        className={`${inputBase} appearance-none pr-9 cursor-pointer`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3" />
    </div>
  );
}

// ---- Slider with filled track + value chip ----
export function Slider({ id, label, value, min, max, step, format, onChange, helper }) {
  const pct = max > min ? ((Number(value) - min) / (max - min)) * 100 : 0;
  const display = format ? format(value) : `${value}%`;
  return (
    <Field
      label={label}
      htmlFor={id}
      suffix={
        <span className="ml-auto font-mono text-xs text-primary-strong font-semibold bg-primary-soft px-2 py-0.5 rounded-md tnum">
          {display}
        </span>
      }
      helper={helper}
    >
      <input
        id={id}
        type="range"
        className="rng mt-3 mb-1"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--pct': `${pct.toFixed(1)}%` }}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

// ---- Segmented toggle ----
export function Toggle({ options, value, onChange, ariaLabel }) {
  return (
    <div className="inline-flex gap-1 border border-line rounded-lg p-1 bg-deep mb-4" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              'px-4 py-2 text-[13px] rounded-md transition-colors ' +
              (active
                ? 'bg-surface text-primary-strong font-semibold shadow-xs'
                : 'text-ink-2 hover:text-ink font-medium')
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ---- Button ----
export function Button({ variant = 'ghost', icon: Icon, children, className = '', ...props }) {
  const base =
    'inline-flex items-center gap-2 font-semibold text-sm rounded-lg transition-all active:translate-y-px ' +
    'focus-visible:outline-none focus-visible:shadow-ring whitespace-nowrap';
  const variants = {
    primary: 'bg-primary text-white px-5 py-2.5 shadow-sm hover:bg-primary-strong hover:shadow-md',
    ghost: 'bg-surface border border-line-strong text-ink-2 px-5 py-2.5 hover:bg-surfaceAlt hover:text-ink hover:border-[#AEBACA]',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon size={16} strokeWidth={2} />}
      {children}
    </button>
  );
}
