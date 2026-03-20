import {
  getMatches,
  getStandings,
  getPlayers,
  getPlayerStats,
  getPlayerCivs,
  getCivStats,
  getCivDrafts,
  getMapStats,
  getMapResults,
  getMapOutcomes,
  getTournamentInfo,
} from "@/lib/data";

interface AdapterResult {
  name: string;
  count: number | string;
  sample: Record<string, unknown> | null;
  error: string | null;
}

function tryAdapter(
  name: string,
  fn: () => unknown[]
): AdapterResult {
  try {
    const data = fn();
    return {
      name,
      count: data.length,
      sample: (data[0] as Record<string, unknown>) ?? null,
      error: null,
    };
  } catch (err) {
    return {
      name,
      count: 0,
      sample: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export default function TestDataPage() {
  const tournament = (() => {
    try {
      return { data: getTournamentInfo(), error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  })();

  const adapters: AdapterResult[] = [
    tryAdapter("getMatches (ttl_s5_matches.csv)", getMatches),
    tryAdapter("getStandings (matches.csv)", getStandings),
    tryAdapter("getPlayers (players.csv)", getPlayers),
    tryAdapter("getPlayerStats (player_statistics.csv)", getPlayerStats),
    tryAdapter("getPlayerCivs (player_civs.csv)", getPlayerCivs),
    tryAdapter("getCivStats (civilization_statistics.csv)", getCivStats),
    tryAdapter("getCivDrafts (civ_drafts.csv)", getCivDrafts),
    tryAdapter("getMapStats (map_statistics.csv)", getMapStats),
    tryAdapter("getMapResults (map_results.csv)", getMapResults),
    tryAdapter("getMapOutcomes (map_outcomes.csv)", getMapOutcomes),
  ];

  const allPassed = adapters.every((a) => a.error === null) && !tournament.error;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8 font-mono">
      <h1 className="text-2xl font-bold mb-6">Data Adapter Verification</h1>

      <section className="mb-8 p-4 rounded border border-gray-700 bg-gray-900">
        <h2 className="text-lg font-semibold mb-2">Tournament Info</h2>
        {tournament.error ? (
          <p className="text-red-400">Error: {tournament.error}</p>
        ) : (
          <pre className="text-sm text-gray-300 overflow-x-auto">
            {JSON.stringify(tournament.data, null, 2)}
          </pre>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">CSV Adapters</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-left">
              <th className="py-2 pr-4">Adapter</th>
              <th className="py-2 pr-4">Rows</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Sample (first row)</th>
            </tr>
          </thead>
          <tbody>
            {adapters.map((a) => (
              <tr key={a.name} className="border-b border-gray-800">
                <td className="py-2 pr-4">{a.name}</td>
                <td className="py-2 pr-4">{a.count}</td>
                <td className="py-2 pr-4">
                  {a.error ? (
                    <span className="text-red-400">FAIL</span>
                  ) : (
                    <span className="text-green-400">OK</span>
                  )}
                </td>
                <td className="py-2 text-xs text-gray-400 max-w-md truncate">
                  {a.error
                    ? a.error
                    : JSON.stringify(a.sample).slice(0, 120)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div
        className={`p-3 rounded text-center font-bold ${
          allPassed
            ? "bg-green-900/50 text-green-300"
            : "bg-red-900/50 text-red-300"
        }`}
      >
        {allPassed
          ? "All adapters passed."
          : "Some adapters failed. Check errors above."}
      </div>
    </main>
  );
}
