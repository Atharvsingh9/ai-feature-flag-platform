export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 text-ink-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-100 border-t-primary" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
