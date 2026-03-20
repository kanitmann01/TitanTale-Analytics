import type { ResearchFinding } from "@/components/research/ResearchFindingsExplorer";

/**
 * Full research cards when findings.json is absent (legacy seasons).
 * Editorial fields (confidence, interpretation, mechanisms, etc.) merge with
 * machine output from Spirit when findings.json exists.
 */
export const RESEARCH_FINDINGS_FALLBACK: ResearchFinding[] = [
  {
    id: 1,
    title: "Snowball Effect",
    hypothesis:
      "Game-1 winners take the series at a rate significantly above 50%.",
    method:
      "Conditional probability P(series win | game 1 win), Fisher's exact test (one-sided).",
    finding:
      "121 of 136 series (89.0%) where Game 1 was won by a player resulted in that same player winning the full series.",
    effectSize: "89.0% series rate after Game 1 win",
    statisticalWeight: "p < 0.0001",
    verdict: "CONFIRMED",
    confidence: 98,
    evidenceLevel: "High",
    practicalImpact: "High",
    interpretation:
      "Winning Game 1 confers roughly a 3.89x multiplier on series victory probability versus a 50% baseline (largest single-mechanism effect in the dataset). Early-game strategy and opener preparation are disproportionately valuable.",
    action:
      "Weight game-1 prep and opening-map comfort heavily in match plans and series strategy.",
    visualization: "assets/spirit/snowball_effect.png",
    caveat:
      "Strong within this season; re-check on future tournaments before treating as universal.",
    mechanisms: [
      "Best-of series reward whoever converts the opener; later games do not reset the series state.",
      "Stronger players may both win game 1 more often and close series more often; correlation is not proof that game 1 causes the series win in isolation.",
      "Map order and visible draft patterns can stack leverage after an early lead.",
    ],
  },
  {
    id: 2,
    title: "Positional Advantage",
    hypothesis:
      "The first-listed player (Player 1) wins at a rate significantly different from 50%.",
    method: "Binomial test of Player-1 win rate vs 50%, with per-map breakdown.",
    finding:
      "Player-1 (first-listed in the match pairing) wins 74.2% of games (405/546). This is not civ draft order; it is the structural Player-1 slot in the pairing.",
    effectSize: "74.2% Player-1 win rate",
    statisticalWeight: "p < 0.0001",
    verdict: "CONFIRMED",
    confidence: 92,
    evidenceLevel: "High",
    practicalImpact: "High",
    interpretation:
      "About 24.2 percentage points above 50% is a large structural asymmetry, orthogonal to civ and map in the tested framing. The brief notes possible mechanisms (listing order, seed correlation, pairing structure) and distinguishes this from small, non-significant first-pick civ advantage (~52.3% vs ~51.8%).",
    action:
      "Flag Player-1 listing in scouting; tournament organizers should audit whether listing or seed rules create unintended asymmetry.",
    visualization: "assets/spirit/draft_order.png",
    caveat:
      "The effect is real in the data; causality may be metadata or seeding rather than an in-game positional advantage. Do not treat as proof of a fair or unfair in-game spawn effect without external validation.",
  },
  {
    id: 3,
    title: "Fatigue Factor",
    hypothesis:
      "Higher-ELO player win rate declines in later games of a series.",
    method: "Stratified win rates by game position (1/2/3+), chi-square test.",
    finding:
      "Higher-ELO player win rate by game position: Game 1: 39.7%, Game 2: 41.2%, Game 3+: 42.0%. No declining trend.",
    effectSize: "No decline in later games",
    statisticalWeight: "p = 0.908",
    verdict: "BUSTED",
    confidence: 88,
    evidenceLevel: "High",
    practicalImpact: "Medium",
    interpretation:
      "Chi-square does not reject equal win rates across positions; the spread across positions is within sampling noise for this sample.",
    action:
      "Do not plan series strategy around late-game fatigue or tilt for the higher-rated player based on this dataset alone.",
    visualization: "assets/spirit/fatigue_factor.png",
    mythHeadline: "The higher-rated player fades in later series games",
    mechanisms: [
      "A true fatigue slope would usually show lower later-game win share for the favorite; here positions are flat within noise.",
      "Rest, prep between games, and series length in this format may blunt endurance narratives.",
    ],
  },
  {
    id: 4,
    title: "Comfort Picks vs. Wild Cards",
    hypothesis:
      "Comfort picks (top-3 most-played civs) outperform one-off picks.",
    method: "Per-player paired win rates, Wilcoxon signed-rank test (one-sided).",
    finding:
      "Per player, win rate on top-3 most-played civilizations (comfort) is 46.8%; one-off picks (wild cards) win 50.9%.",
    effectSize: "Wild cards outperform comfort picks",
    statisticalWeight: "p = 0.885",
    verdict: "BUSTED",
    confidence: 84,
    evidenceLevel: "Medium",
    practicalImpact: "Medium",
    interpretation:
      "No evidence comfort picks beat wild cards; direction runs the other way. Opponent prep on common picks and small-sample noise on one-offs are plausible explanations.",
    action:
      "Keep draft flexibility; do not assume familiarity alone wins games in this event.",
    visualization: "assets/spirit/comfort_picks.png",
    mythHeadline: "Comfort civs beat surprise picks",
    mechanisms: [
      "Opponents can prep known lines against heavily scouted comfort picks; rare picks may dodge that prep surface.",
      "Comfort vs wild-card buckets differ in sample size and opponent quality; small gaps are easy to over-read.",
    ],
  },
  {
    id: 5,
    title: "Clutch Factor",
    hypothesis:
      "Some players significantly over/underperform in deciding games.",
    method:
      "Per-player binomial test comparing clutch game win rate to overall baseline.",
    finding:
      "Exactly one player shows statistically significant deviation between clutch-game win rate and overall baseline (per-test p = 0.0287).",
    effectSize: "1 player with significant deviation",
    statisticalWeight: "p = 0.029",
    verdict: "CONFIRMED",
    confidence: 68,
    evidenceLevel: "Medium",
    practicalImpact: "Medium",
    interpretation:
      "Deciding games add pressure not present in ladder play; a measurable deviation for one player can inform roster or order choices, but field-wide claims need more data.",
    action:
      "Use clutch deltas as a secondary scouting signal with strict replication rules, not as a hard rule for every player.",
    visualization: "assets/spirit/clutch_factor.png",
    caveat:
      "With ~20 players and many implicit tests, Bonferroni-style correction (example threshold 0.0025) would weaken claims. Treat as suggestive until replicated on larger samples.",
    mechanisms: [
      "Deciding games concentrate pressure; tiny true edges could appear for individuals even when the field is flat.",
      "Many implicit player-level tests inflate false-positive risk; one significant cell is weak evidence for a universal clutch trait.",
    ],
  },
  {
    id: 6,
    title: "One-Sided Civ Matchups",
    hypothesis: "Some civ pairings have significantly imbalanced win rates.",
    method: "Civ-vs-civ win rate matrix (min 3 games), binomial test per pair.",
    finding:
      "Of 25 civilization pairings with at least 3 games each, none show statistically significant win-rate imbalance vs 50%.",
    effectSize: "0/25 pairs imbalanced",
    statisticalWeight: "p = 1.000",
    verdict: "BUSTED",
    confidence: 78,
    evidenceLevel: "Low",
    practicalImpact: "Medium",
    interpretation:
      "Null here can mean meta avoidance of bad mus, or low power with small n per pair. Absence of significant imbalance is not proof that no matchup imbalance exists.",
    action:
      "Avoid definitive civ-counter narratives from this tournament alone; combine with larger samples or patches.",
    visualization: "assets/spirit/civ_matchups.png",
    caveat:
      "Power is limited for rare pairs (often n < 10). Phrase as no detected imbalance under these tests, not as proof of perfect balance.",
    mythHeadline: "Some civ pairings are free wins at TTL",
    mechanisms: [
      "Each pair often has few games; tests are under-powered to detect real but small MU edges.",
      "Drafting avoids hard counters, so observed pairs may under-represent the worst theoretical mus.",
    ],
  },
  {
    id: 7,
    title: "Map Specialists",
    hypothesis:
      "Certain players have statistically significant map affinities.",
    method:
      "Per-player per-map win rate vs baseline, binomial test (min 3 games).",
    finding:
      "Out of 196 player-map combinations with sufficient data, 1 shows significant deviation from that player's baseline at p < 0.05.",
    effectSize: "1/196 player-map combos",
    statisticalWeight: "p = 0.0184",
    verdict: "CONFIRMED",
    confidence: 70,
    evidenceLevel: "Medium",
    practicalImpact: "High",
    interpretation:
      "Under independence, about 196 x 0.05 ~ 10 significant results would appear by chance; observing 1 is below that, so map-specific dominance is rare, not a default opponent weakness.",
    action:
      "Prefer universal fundamentals over assuming large map-specific holes, unless backed by high n and replication.",
    visualization: "assets/spirit/map_specialists.png",
    caveat:
      "The single significant cell should be interpreted with multiple-comparison caution; strict correction weakens single-cell claims.",
    mechanisms: [
      "Across ~196 tests at alpha 0.05, several false positives are expected by chance alone; one hit is not a specialist epidemic.",
      "High leverage on a map still needs replication and larger map_n before scouting bans entire strategies around it.",
    ],
  },
  {
    id: 8,
    title: "Upset Probability",
    hypothesis: "Tournament upsets exceed the logistic ELO model expectation.",
    method:
      "Bin by ELO difference, compare actual upset rate to E(win) = 1/(1+10^(-d/400)), binomial test.",
    finding:
      "Actual upset rate exceeds the logistic ELO prediction by a factor of 1.62; upsets occur about 62% more often than the model predicts.",
    effectSize: "1.62x volatility vs ELO model",
    statisticalWeight: "p < 0.0001",
    verdict: "CONFIRMED",
    confidence: 95,
    evidenceLevel: "High",
    practicalImpact: "High",
    interpretation:
      "Ranked-style ELO understates tournament variance (stakes, format, mental game). Pre-tournament ELO alone was a weak single predictor of outcomes in the broader tournament stats (low R^2).",
    action:
      "Inflate upset probability in scouting and models by roughly 1.6x versus naive ELO for this event class.",
    visualization: "assets/spirit/upset_probability.png",
    mechanisms: [
      "Tournament prep, map pools, and stakes differ from ladder environments where logistic ELO is a rough guide.",
      "Short series inflate variance versus very long rating histories; favorites look safer on paper than in a single week.",
    ],
  },
  {
    id: 9,
    title: "Tempo Control",
    hypothesis:
      "Players with low duration variance (consistent tempo) win more.",
    method:
      "K-means clustering (k=3) on duration distributions, Spearman correlation (CV vs win rate).",
    finding:
      "Spearman correlation between game-duration coefficient of variation and win rate is rho = 0.0436 (p = 0.855).",
    effectSize: "No correlation (rho = 0.044)",
    statisticalWeight: "p = 0.855",
    verdict: "BUSTED",
    confidence: 82,
    evidenceLevel: "Medium",
    practicalImpact: "Low",
    interpretation:
      "High- and low-variance players both succeed and fail at similar rates in this sample.",
    action:
      "Do not evaluate or train players primarily on duration variance as a success metric.",
    visualization: "assets/spirit/tempo_control.png",
    mythHeadline: "Players who keep game length steady win more",
    mechanisms: [
      "Duration is driven by map, matchup, and game state more than a stable personal pacing fingerprint.",
      "Coefficient of variation on length is a weak proxy for how a player actually controls tempo in-game.",
    ],
  },
  {
    id: 10,
    title: "Meta Evolution",
    hypothesis: "Civ pick distributions change across tournament stages.",
    method: "Per-civ pick rate by stage, chi-square test.",
    finding:
      "Tournament data contain only a single stage; pick-rate evolution across stages cannot be measured.",
    effectSize: "Single-stage data",
    statisticalWeight: "N/A",
    verdict: "INCONCLUSIVE",
    confidence: 25,
    evidenceLevel: "Low",
    practicalImpact: "Low",
    interpretation:
      "The hypothesis is structurally untestable without multi-stage labels (groups vs playoffs vs finals).",
    action:
      "Record picks by stage in future events to enable this analysis.",
    mythHeadline: "The meta shifts sharply between Swiss and playoffs",
    mechanisms: [
      "The available extract does not separate stages cleanly; the hypothesis is structurally untestable here.",
      "Future labeled stages (groups vs playoffs vs finals) would unlock pick-rate evolution tests.",
    ],
  },
];
