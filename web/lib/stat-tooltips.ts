/**
 * Single source of help copy for stats and metrics. Align with DATA_SCHEMA.md
 * and Spirit / ANALYTICAL_BRIEF caveats where applicable.
 */
export const STAT_HELP = {
  gamesInMatchLog:
    "Count of games in the season match log (one row per game, not per series).",
  avgDuration:
    "Mean game length in minutes across all logged games in this season.",
  topWinRate:
    "Highest player win rate in the season field (wins divided by total games).",
  winRate:
    "Wins divided by total games for the player or entity in scope (0-100%).",
  winLossRecord: "Wins and losses in the season match log.",
  elo:
    "Tournament ELO from match data (Liquipedia extract). Not the same as ladder rating.",
  uniqueCivs:
    "Number of distinct civilizations this player used in logged games.",
  clutchDelta:
    "Win rate in deciding games minus overall win rate. Negative means underperforming when the series is on the line.",
  vsEloExpected:
    "Positive = actual results better than ELO-implied expectation for this field; negative = below expectation. Not ladder rating.",
  civDiversity:
    "Breadth of civilization usage relative to the field (advanced metric). Higher = more varied civ pool.",
  wlColumn: "Win-loss record for the season.",
  gamesColumn: "Total games played in the season match log.",
  eloColumn: "ELO rating from tournament data.",
  civsColumn: "Count of distinct civilizations played.",
  avgDurColumn:
    "Mean game duration in minutes (player_statistics.avg_game_duration).",
  teamColumn: "Team label from roster when available.",
  rankColumn: "Sortable ranking by the selected column.",
  sectionCivPerformance:
    "Win rate with each civilization (minimum sample may apply in source data).",
  sectionMapAffinities:
    "Per-map win rate versus a player baseline; identifies maps where results diverge from average.",
  bestMapsLabel:
    "Maps where this player's win rate on the map exceeds their overall baseline.",
  weakMapsLabel:
    "Maps where this player's win rate on the map is below baseline (filtered to meaningful deltas).",
  sectionH2HRecords:
    "Series records against other players; game counts are within logged head-to-head.",
  sectionRecentMatches:
    "Per-game rows from the match log. Same series id = games in one series.",
  thSeries: "Match group id in the tournament extract.",
  thResult: "Win or loss for this player in this game.",
  thOpponent: "Opponent player name for this game.",
  thCiv: "Civilization played by this player.",
  thVsCiv: "Opponent's civilization.",
  thMap: "Map name for this game.",
  thDuration: "Game length in minutes.",
  pickRate:
    "Share of games in which this civilization was picked (games played / all games).",
  fieldAvgWinRate:
    "Mean civilization win rate across the full civ list (unweighted by games).",
  mostPickedCiv: "Civilization with the highest pick rate this season.",
  highestWinRateCiv:
    "Civilization with the highest win rate (watch low sample sizes on rare civs).",
  pickVsWinScatter:
    "Each point is one civilization: X = pick share, Y = win rate. Bubble size ~ games. Civs with very few games may be excluded.",
  mostPickedTop15: "Civilizations ranked by pick share (top 15).",
  highestWinRateTop15: "Civilizations ranked by win rate (top 15).",
  allCivsGrid:
    "Games (g), win rate (WR), and pick rate for every civilization in the season.",
  mapGames: "Games played on this map in the season log.",
  mapAvgDur: "Average game length on this map in minutes.",
  mapTopCiv: "Most frequently played civilization on this map in the log.",
  mapBalanceStd:
    "Standard deviation of per-player win rates on this map. Lower = wins spread more evenly across players (fairer map in aggregate).",
  playerH2HHeatmap:
    "Cell shows row player's game wins versus column player. Green = row won a larger share of games. Hover a cell for the record.",
  playerMapAffinityHeatmap:
    "Win-rate delta versus player baseline: green = above baseline on that map, red = below. Diagonal hatch = low sample (under 5 games in cell). Use the filter to hide very low-n cells.",
  civMatchupSection:
    "Pairing-level stats from civilization matchup extract: sample sizes are often small; treat as descriptive.",
  civMatchupCivA: "First civilization in the pair (order from source data).",
  civMatchupCivB: "Second civilization in the pair.",
  civMatchupGames: "Games where this civ pairing occurred.",
  civMatchupAWinRate: "Share of games won by Civ A in this pairing.",
  civMatchupBalance:
    "How lopsided the pairing is (distance from 50/50). Low sample: Spirit tests often did not reach significance.",
  civMatchupAvgDur: "Average game length for games in this pairing.",
  compareWinRate:
    "Wins divided by total games for the player or entity in scope (0-100%).",
  compareGames:
    "Total games played in the season match log.",
  compareCivDiversity:
    "Breadth of civilization usage relative to the field (advanced metric). Higher = more varied civ pool.",
  compareVsElo:
    "Positive = actual results better than ELO-implied expectation for this field; negative = below expectation. Not ladder rating.",
  compareClutch:
    "Win rate in deciding games minus overall win rate. Negative means underperforming when the series is on the line.",
  sectionCompareH2H:
    "Game wins in the series between these two players (from head-to-head extract).",
  sectionMapWinRatesShared:
    "Radar of win rates on maps both players have played (shared map set).",
  sectionSharedMapsBar:
    "Side-by-side win rate percent on each shared map.",
  sectionCivPools:
    "Civilizations each player used in the season; overlap vs unique picks.",
  scoutingReport:
    "Heuristic map strengths and upset estimate from scouting data; see Spirit caveats on small samples.",
  scoutingBestMaps: "Maps flagged as strong for this player in the scouting extract.",
  scoutingWeakMaps: "Maps flagged as weak for this player in the scouting extract.",
  scoutingContestedMaps: "Maps where both players are rated as competitive.",
  eloEdge: "ELO difference implied edge between the two players in this pairing context.",
  upsetProbability:
    "Model-based chance of an upset; tournament volatility often exceeds naive ELO (see ANALYTICAL_BRIEF 12.8).",
  analysisAvgWinRateField:
    "Unweighted mean of player win rates (summary of the field, not a single player).",
  analysisAvgGameLength:
    "Mean duration across all games in the analysis slice.",
  analysisSnowball:
    "Share of series where the game-1 winner also won the series. See Spirit snowball findings.",
  analysisPlayer1WinRate:
    "Share of games won by the player listed as player1 in the log. Structural listing effect possible; see ANALYTICAL_BRIEF 12.2.",
  analysisPerformanceVsElo:
    "Residual: actual win rate minus ELO-implied expectation. Tier colors = classifier from advanced metrics.",
  analysisDurationDistribution:
    "Histogram of games by duration bucket (10-minute bins).",
  analysisTopCivMatchups:
    "Observed outcomes for civ pairs; Spirit notes limited power for significance at small n.",
  analysisCiv1WR:
    "Win rate for the first civ listed in the matchup row.",
  analysisMatchupBalance:
    "Skew from 50/50 (see balance mini-bar). Not proof of balance at low sample.",
  analysisUpsetByEloBin:
    "Actual upset rate vs ELO-model rate by rating-gap bin (~1.62x tournament factor in Spirit work).",
  analysisClutchSection:
    "Deciding-game win rate minus overall win rate. * = p < 0.05 for that player; many tests imply multiple-comparison caution.",
  analysisMapBalanceChart:
    "balance_std from map statistics: spread of player win rates on the map. Lower = more even.",
  analysisPlayersByLeague:
    "Player count per league tier from standings snapshot.",
  analysisUniqueCivsByLeague:
    "Distinct civilizations seen in each league (from player_civs slice).",
  analysisDraftPosition:
    "Pick order summary from draft file; map names may include sessions outside the main pool (see caveat text).",
  draftTotalPicks: "Count of civilization picks at this draft slot.",
  draftUniqueCivs: "Distinct civilizations chosen at this draft position.",
  researchEffect:
    "Direction and size of the measured effect for this investigation.",
  researchStatisticalWeight:
    "How strong the statistical evidence is (for example p-values or test wording).",
  researchConfidence:
    "Analyst-assigned confidence score for the finding (not a frequentist interval).",
  researchEvidence:
    "Rated strength of underlying data or tests (High / Medium / Low).",
  researchImpact:
    "Practical usefulness for prep or interpretation (High / Medium / Low).",
  researchStrongFilter:
    "When on, hides findings below 75% confidence or with low practical impact.",
  researchExplorerIntro:
    "Search and filter investigations. Verdicts summarize each formal hypothesis test.",
  researchWilsonCi:
    "Approximate 95% Wilson score interval for a binomial proportion computed in the Spirit pipeline (when shown). This is a frequentist uncertainty band for that proportion, not the analyst confidence score.",
  researchTestFamily:
    "Named statistical procedure for the primary test (see Method for full detail).",
  researchMostActionable:
    "High-confidence confirmed findings surfaced for quick scanning; see full cards for methods and caveats.",
  upsetBinExplorer:
    "Step through rating-gap buckets. Compares how often the underdog actually won to what a simple ELO curve expected for this season only.",
  hypothesisDocket:
    "Falsifiable checks to run when new seasons land. These are not predictions of individual match outcomes.",
  researchLedgerTeaser:
    "Formal hypothesis tests with verdicts. Written summaries match the research run; upset figures update with the season you select.",
  topPlayersHome:
    "Mini summary: win rate, W-L, and games for leaderboard players in this season.",
  civilizationMetaHome:
    "Pick share and win rate for popular civilizations (snapshot).",
  mapPoolHome:
    "Games played on map, average duration, and most common civ in the log.",
  latestMatchLog:
    "Most recent row in the game-level match log.",
  mapsKpiMostPlayed:
    "Map with the most games in the season match log.",
  mapsKpiLopsided:
    "Map with the highest balance_std: player win rates vary most on this map.",
  mapsKpiBalanced:
    "Map with the lowest balance_std: player win rates are most evenly spread.",
  mapsKpiLongestAvg:
    "Map with the longest average game duration in the log.",
  mapsGamesPerMap:
    "Bar chart of game counts per map (match log).",
  mapsGamesByLeague:
    "Appearance-weighted game counts by league from map outcomes (scope may differ from raw match row count; see callout).",
  mapsAvgDurationByMap:
    "Mean duration per map, sorted for comparison across the pool.",
  mapsMapDetails:
    "Per-map games, duration, top civ, and balance metric from map_statistics.",
  playersEloVsWinScatter:
    "Each point is one player: ELO vs win rate; size scales with games. Hover for details.",
  playersWinRateTop12: "Players ranked by win rate (top 12 in the bar chart).",
  playersFullRankings:
    "Sortable table of all players; click headers to change sort. Sticky columns on small screens.",
} as const;

export type StatHelpKey = keyof typeof STAT_HELP;

/** Compare page stat row label -> help text */
export const COMPARE_STAT_HELP: Record<string, string> = {
  "Win Rate": STAT_HELP.compareWinRate,
  Games: STAT_HELP.compareGames,
  "Civ Diversity": STAT_HELP.compareCivDiversity,
  "vs. ELO expected": STAT_HELP.compareVsElo,
  "Clutch Delta": STAT_HELP.compareClutch,
};

export function helpAria(label: string): string {
  return `Help: ${label}`;
}
