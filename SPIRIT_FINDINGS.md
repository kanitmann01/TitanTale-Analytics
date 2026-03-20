# Spirit of the Law Investigations -- T90 Titans League Season 5

Deep investigative analysis: 10 questions the standard pipeline does not cover.

---

## Summary

| Investigation | Verdict | p-value |
|---------------|---------|---------|
| Snowball Effect | CONFIRMED | 0.0000 |
| Positional Advantage | CONFIRMED | 0.0000 |
| Fatigue Factor | BUSTED | 0.9082 |
| Comfort Picks vs. Wild Cards | BUSTED | 0.8847 |
| Clutch Factor | CONFIRMED | 0.0287 |
| One-Sided Civ Matchups | BUSTED | 1.0000 |
| Map Specialists | CONFIRMED | 0.0184 |
| Upset Probability | CONFIRMED | 0.0000 |
| Tempo Control | BUSTED | 0.8551 |
| Meta Evolution | INCONCLUSIVE | N/A |

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

![Clutch Factor](assets\spirit\clutch_factor.png)

---

## 6. One-Sided Civ Matchups

**Hypothesis:** Some civ pairings have significantly imbalanced win rates

**Method:** Civ-vs-civ win rate matrix (min 3 games), binomial test per pair

**Finding:** 0 matchup(s) significantly one-sided out of 25 tested

**p-value:** 1.0000

**Verdict:** BUSTED

![One-Sided Civ Matchups](assets\spirit\civ_matchups.png)

---

## 7. Map Specialists

**Hypothesis:** Certain players have statistically significant map affinities

**Method:** Per-player per-map win rate vs. baseline, binomial test (min 3 games)

**Finding:** 1 significant map affinity pair(s) out of 196

**p-value:** 0.0184

**Verdict:** CONFIRMED

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

---
