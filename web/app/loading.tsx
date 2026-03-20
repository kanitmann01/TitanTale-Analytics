export default function Loading() {
  return (
    <main
      className="min-h-screen max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14 space-y-8 animate-pulse"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">Loading page content</p>
      <div className="h-8 w-48 bg-ttl-slate rounded" />
      <div className="h-12 w-2/3 max-w-md bg-ttl-slate rounded" />
      <div className="h-24 w-full max-w-lg bg-ttl-slate/60 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-72 bg-ttl-slate/40 rounded border border-ttl-border-subtle" />
        <div className="h-72 bg-ttl-slate/40 rounded border border-ttl-border-subtle" />
      </div>
    </main>
  );
}
