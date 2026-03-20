# Spirit of the Law Investigations -- T90 Titans League Season 5

Deep investigative analysis: 10 questions the standard pipeline does not cover.

Narrative alignment: full prose, effect sizes, and integrated story match
[ANALYTICAL_BRIEF.md](ANALYTICAL_BRIEF.md) sections 11-13 (web app integration,
Spirit matrix, per-investigation sections, integrated narrative).

**Operator note:** Re-running `spirit_of_the_law_analysis.py` writes machine summaries to
`data/seasons/{season}/spirit/SPIRIT_FINDINGS_auto.md` and `findings.json` only.
This file stays curated; use `--write-root-spirit-findings` only if you intend to replace it.

---

## Evidence framing

- **Multiple testing:** Many player-map and per-player tests were run. A single
  p &lt; 0.05 cell is suggestive; strict Bonferroni correction weakens
  one-off claims (e.g. clutch, map specialist).
- **Low power:** Civ-vs-civ cells are sparse (25 tested pairs with min 3 games).
  **No significant imbalance detected** is not the same as **proof of perfect
  balance** (absence of evidence).
- **Structural effects:** Player-1 win rate is extreme in the data; treat as a
  real listing/structural signal while remaining open to seeding or metadata
  explanations rather than only in-game position.

---

## Investigative summary matrix (aligned with brief section 12)

| Investigation | Verdict | Effect size | Statistical weight |
|----------------|---------|-------------|-------------------|
| Snowball Effect | CONFIRMED | 89.0% series rate after Game 1 win | p &lt; 0.0001 |
| Positional Advantage | CONFIRMED | 74.2% Player-1 win rate | p &lt; 0.0001 |
| Fatigue Factor | BUSTED | No decline in later games | p = 0.908 |
| Comfort Picks vs. Wild Cards | BUSTED | Wild cards outperform | p = 0.885 |
| Clutch Factor | CONFIRMED | 1 player with significant deviation | p = 0.029 |
| One-Sided Civ Matchups | BUSTED | 0/25 pairs imbalanced | p = 1.000 |
| Map Specialists | CONFIRMED | 1/196 player-map combos | p = 0.0184 |
| Upset Probability | CONFIRMED | 1.62x volatility vs. ELO model | p &lt; 0.0001 |
| Tempo Control | BUSTED | No correlation (rho = 0.044) | p = 0.855 |
| Meta Evolution | INCONCLUSIVE | Single-stage data | N/A |

**Counts:** five confirmed, four busted, one inconclusive (per scripted Spirit verdicts).

---

## 1. Snowball Effect

**Hypothesis:** Game-1 winners take the series at a rate significantly above 50%

**Method:** Conditional probability P(series win | game 1 win), Fisher's exact test (one-sided)

**Finding:** Game-1 winners took the series 89.0% of the time (121/136)

**p-value:** 0.0000

**Verdict:** CONFIRMED

![Snowball Effect](assets\spirit\snowball_effect.png)

---

## 2. Positional Advantage

**Hypothesis:** The first-listed player (Player 1) wins at a rate significantly different from 50%

**Method:** Binomial test of Player-1 win rate vs 50%, with per-map breakdown

**Finding:** Player-1 win rate: 74.2% (405/546), p = 0.0000

**p-value:** 0.0000

**Verdict:** CONFIRMED

**Caveat (brief 12.2):** The effect is large and orthogonal to civ/map in the
tested framing; interpret alongside possible seeding, listing order, or
pairing structure. Distinct from small, non-significant first-pick civ
advantage (~52.3% vs ~51.8% in the brief).

![Positional Advantage](assets\spirit\draft_order.png)

---

## 3. Fatigue Factor

**Hypothesis:** Higher-ELO player win rate declines in later games of a series

**Method:** Stratified win rates by game position (1 / 2 / 3+), chi-square test

**Finding:** Game 1: 39.7%, Game 2: 41.2%, Game 3+: 42.0%

**p-value:** 0.9082

**Verdict:** BUSTED

![Fatigue Factor](assets\spirit\fatigue_factor.png)

---

## 4. Comfort Picks vs. Wild Cards

**Hypothesis:** Comfort picks (top-3 most-played civs) outperform one-off picks

**Method:** Per-player paired win rates, Wilcoxon signed-rank test (one-sided)

**Finding:** Comfort: 46.8%, Wild Cards: 50.9% (p = 0.8847)

**p-value:** 0.8847

**Verdict:** BUSTED

![Comfort Picks vs. Wild Cards](assets\spirit\comfort_picks.png)

---

## 5. Clutch Factor

**Hypothesis:** Some players significantly over/underperform in deciding games

**Method:** Per-player binomial test comparing clutch win rate to overall baseline

**Finding:** 1 player(s) with statistically significant clutch deviation (p < 0.05)

**p-value:** 0.0287

**Verdict:** CONFIRMED

**Caveat (brief 12.5):** With ~20 players and multiple tests, Bonferroni-style
correction (e.g. threshold 0.0025) would attenuate per-test significance.
Interpret as suggestive without replication on a larger dataset.

![Clutch Factor](assets\spirit\clutch_factor.png)

---

## 6. One-Sided Civ Matchups

**Hypothesis:** Some civ pairings have significantly imbalanced win rates

**Method:** Civ-vs-civ win rate matrix (min 3 games), binomial test per pair

**Finding:** 0 matchup(s) significantly one-sided out of 25 tested

**p-value:** 1.0000

**Verdict:** BUSTED

**Caveat (brief 12.6):** Null may reflect meta avoidance of bad mus, or
insufficient n per pair to detect real imbalance. Absence of evidence is not
evidence of absence.

![One-Sided Civ Matchups](assets\spirit\civ_matchups.png)

---

## 7. Map Specialists

**Hypothesis:** Certain players have statistically significant map affinities

**Method:** Per-player per-map win rate vs. baseline, binomial test (min 3 games)

**Finding:** 1 significant map affinity pair(s) out of 196

**p-value:** 0.0184

**Verdict:** CONFIRMED

**Caveat (brief 12.7):** Under no true effect, about 196 x 0.05 ~ 10 cells
could hit p &lt; 0.05 by chance; one observed is below that. The single cell is
real in the test but not evidence that map specialization is common. Apply
multiple-comparison caution.

![Map Specialists](assets\spirit\map_specialists.png)

---

## 8. Upset Probability

**Hypothesis:** Tournament upsets exceed the logistic ELO model expectation

**Method:** Bin by ELO difference, compare actual upset rate to E(win) = 1/(1+10^(-d/400)), binomial test

**Finding:** Tournament volatility factor: 1.62x (p = 0.0000)

**p-value:** 0.0000

**Verdict:** CONFIRMED

![Upset Probability](assets\spirit\upset_probability.png)

---

## 9. Tempo Control

**Hypothesis:** Players with low duration variance (consistent tempo) win more

**Method:** K-means clustering (k=3) on duration distributions, Spearman correlation (CV vs win rate)

**Finding:** Spearman rho = 0.0436 (p = 0.8551)

**p-value:** 0.8551

**Verdict:** BUSTED

![Tempo Control](assets\spirit\tempo_control.png)

---

## 10. Meta Evolution

**Hypothesis:** Civ pick distributions change across tournament stages

**Method:** Per-civ pick rate by stage, chi-square test

**Finding:** Only one stage in data -- cannot measure evolution

**Verdict:** INCONCLUSIVE

**Note (brief 12.10):** Hypothesis is structurally untestable without
multi-stage pick data (groups vs playoffs vs finals).

---

## Integrated narrative (brief section 13)

- Tournament success is multi-dimensional and only partly explained by
  pre-tournament ELO (weak R^2 in standard pipeline).
- Snowball (~89% series conversion after Game 1 win) makes opener prep high
  leverage (~3.89x vs 50% baseline).
- Player-1 listing shows a large asymmetry (~74.2% win rate); treat as
  structural/listing signal pending organizer validation.
- Fatigue-by-game-index, comfort-pick superiority, and tempo-consistency
  advantages are not supported here; tournament upset rate exceeds naive ELO
  by ~1.62x.
- Civ matchup tests found no significant one-sided pairs among 25 tested (min 3
  games); combine with low-power caveat. Standard pipeline also reported no
  civ-map synergy; meta conclusions remain contextual.

---
