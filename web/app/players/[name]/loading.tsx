export default function PlayerProfileLoading() {
  return (
    <main className="min-h-screen max-w-6xl mx-auto px-6 py-14 space-y-8 animate-pulse">
      <div className="h-4 w-24 bg-ttl-slate rounded" />
      <div className="h-10 w-64 bg-ttl-slate rounded" />
      <div className="flex flex-wrap gap-8">
        <div className="h-16 w-24 bg-ttl-slate/60 rounded" />
        <div className="h-16 w-24 bg-ttl-slate/60 rounded" />
        <div className="h-16 w-24 bg-ttl-slate/60 rounded" />
      </div>
      <div className="h-48 w-full bg-ttl-slate/40 rounded border border-ttl-border-subtle" />
      <div className="h-64 w-full bg-ttl-slate/40 rounded border border-ttl-border-subtle" />
    </main>
  );
}
