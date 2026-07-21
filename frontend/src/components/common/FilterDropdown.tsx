import { ChevronDown } from "lucide-react";

interface FilterDropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  className?: string;
  label?: string;
}

export function FilterDropdown({ value, options, onChange, className, label }: FilterDropdownProps) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {label && <label className="sr-only">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring appearance-none rounded-xl2 border border-ink-300/50 bg-white py-2.5 pl-3 pr-9 text-sm text-ink-900"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
    </div>
  );
}
