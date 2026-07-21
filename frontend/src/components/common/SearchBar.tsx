import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search...", className, label }: SearchBarProps) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full rounded-xl2 border border-ink-300/50 bg-white py-2.5 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-500"
        aria-label={label || placeholder}
      />
    </div>
  );
}
