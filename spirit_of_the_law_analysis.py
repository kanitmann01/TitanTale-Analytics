"""
T90 Titans League Season 5 -- Spirit of the Law Investigations
Deep investigative analysis: 10 questions the standard pipeline does not cover.
"""

from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from scipy import stats
from scipy.stats import (
    binomtest,
    chi2_contingency,
    fisher_exact,
    wilcoxon,
)
import warnings

warnings.filterwarnings("ignore")

plt.style.use("seaborn-v0_8-darkgrid")
sns.set_palette("husl")
sns.set_context("paper", font_scale=1.2)

ASSETS_DIR = Path("assets/spirit")
DATA_DIR = Path("data/spirit")


def _ensure_dirs() -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================================
# DATA LOADING
# ============================================================================


def load_data() -> pd.DataFrame:
    """Load match data."""
    df = pd.read_csv("data/ttl_s5_matches.csv")
    print(f"Loaded {len(df)} games across {df['match_id'].nunique()} matches")
    return df


# ============================================================================
# INVESTIGATION 1: SNOWBALL EFFECT
# ============================================================================


def investigate_snowball_effect(df: pd.DataFrame) -> dict[str, Any]:
    """Does winning game 1 predict winning the series?"""
    print("\n" + "=" * 70)
    print("INVESTIGATION 1: Snowball Effect")
    print("Question: Does winning game 1 predict winning the series?")
    print("=" * 70)

    game1 = df[df["game_number"] == 1][["match_id", "winner"]].rename(
        columns={"winner": "game1_winner"}
    )

    match_wins: dict[tuple[int, str], int] = {}
    for _, row in df.iterrows():
        key = (row["match_id"], row["winner"])
        match_wins[key] = match_wins.get(key, 0) + 1

    series_winners = {}
    for (mid, player), wins in match_wins.items():
        if mid not in series_winners or wins > match_wins.get(
            (mid, series_winners[mid]), 0
        ):
            series_winners[mid] = player

    game1["series_winner"] = game1["match_id"].map(series_winners)
    game1["g1_won_series"] = game1["game1_winner"] == game1["series_winner"]

    n_total = len(game1)
    n_g1_won = game1["g1_won_series"].sum()
    pct = n_g1_won / n_total if n_total > 0 else 0

    table = np.array([[n_g1_won, n_total - n_g1_won],
                      [n_total - n_g1_won, n_g1_won]])
    _, p_value = fisher_exact(table, alternative="greater")

    print(f"\n  Matches analyzed: {n_total}")
    print(f"  Game-1 winner took the series: {n_g1_won}/{n_total} ({pct:.1%})")
    print(f"  Fisher's exact test (one-sided): p = {p_value:.4f}")
    verdict = "CONFIRMED" if p_value < 0.05 else ("INCONCLUSIVE" if p_value < 0.10 else "BUSTED")
    print(f"  Verdict: {verdict}")

    fig, ax = plt.subplots(figsize=(6, 4))
    labels = ["Won Series", "Lost Series"]
    sizes = [n_g1_won, n_total - n_g1_won]
    colors = ["#2ecc71", "#e74c3c"]
    ax.bar(labels, sizes, color=colors, edgecolor="white", linewidth=1.2)
    ax.set_title("Game-1 Winner: Did They Win the Series?")
    ax.set_ylabel("Number of Matches")
    for i, v in enumerate(sizes):
        ax.text(i, v + 0.3, str(v), ha="center", fontweight="bold")
    fig.tight_layout()
    viz_path = str(ASSETS_DIR / "snowball_effect.png")
    fig.savefig(viz_path, dpi=150)
    plt.close(fig)

    return {
        "title": "Snowball Effect",
        "hypothesis": "Game-1 winners take the series at a rate significantly above 50%",
        "method": "Conditional probability P(series win | game 1 win), Fisher's exact test (one-sided)",
        "finding": f"Game-1 winners took the series {pct:.1%} of the time ({n_g1_won}/{n_total})",
        "p_value": p_value,
        "verdict": verdict,
        "viz_path": viz_path,
    }


# ============================================================================
# INVESTIGATION 2: DRAFT ORDER ADVANTAGE
# ============================================================================


def investigate_draft_order(df: pd.DataFrame) -> dict[str, Any]:
    """Does the first-listed player (player 1) have a positional advantage?

    The civ_drafts data has both players drafting at the same round number,
    so individual pick order is not isolated. Instead, this investigation tests
    whether the player-1 position (first-listed, typically higher seed) carries
    a measurable win-rate advantage.
    """
    print("\n" + "=" * 70)
    print("INVESTIGATION 2: Positional Advantage (Player 1 vs Player 2)")
    print("Question: Does the first-listed player have a measurable edge?")
    print("=" * 70)
    p1_wins = (df["winner"] == df["player1"]).sum()
    n_total = len(df)
    p1_wr = p1_wins / n_total

    result = binomtest(p1_wins, n_total, 0.5, alternative="two-sided")
    p_value = result.pvalue

    print(f"\n  Total games: {n_total}")
    print(f"  Player-1 wins: {p1_wins} ({p1_wr:.1%})")
    print(f"  Player-2 wins: {n_total - p1_wins} ({1 - p1_wr:.1%})")
    print(f"  Binomial test (vs 50%): p = {p_value:.4f}")

    by_map = []
    for map_name in sorted(df["map"].unique()):
        subset = df[df["map"] == map_name]
        if len(subset) < 5:
            continue
        mw = (subset["winner"] == subset["player1"]).sum()
        by_map.append({"map": map_name, "p1_wins": mw, "total": len(subset), "p1_wr": mw / len(subset)})
    map_df = pd.DataFrame(by_map).sort_values("p1_wr", ascending=False)

    if len(map_df) > 0:
        print("\n  Player-1 win rate by map (n >= 5):")
        for _, row in map_df.iterrows():
            print(f"    {row['map']:<18} | P1 WR: {row['p1_wr']:.1%} ({row['p1_wins']:.0f}/{row['total']:.0f})")

    verdict = "CONFIRMED" if p_value < 0.05 else ("INCONCLUSIVE" if p_value < 0.10 else "BUSTED")
    print(f"\n  Verdict: {verdict}")

    fig, ax = plt.subplots(figsize=(7, 4))
    ax.bar(["Player 1", "Player 2"], [p1_wins, n_total - p1_wins], color=["#3498db", "#e67e22"], edgecolor="white")
    ax.axhline(y=n_total / 2, color="red", linestyle="--", alpha=0.7, label="Expected (50%)")
    ax.set_ylabel("Wins")
    ax.set_title("Player 1 vs Player 2 Win Count")
    ax.legend()
    fig.tight_layout()
    viz_path = str(ASSETS_DIR / "draft_order.png")
    fig.savefig(viz_path, dpi=150)
    plt.close(fig)

    return {
        "title": "Positional Advantage",
        "hypothesis": "The first-listed player (Player 1) wins at a rate significantly different from 50%",
        "method": "Binomial test of Player-1 win rate vs 50%, with per-map breakdown",
        "finding": f"Player-1 win rate: {p1_wr:.1%} ({p1_wins}/{n_total}), p = {p_value:.4f}",
        "p_value": p_value,
        "verdict": verdict,
        "viz_path": viz_path,
    }


# ============================================================================
# INVESTIGATION 3: FATIGUE FACTOR
# ============================================================================


def investigate_fatigue_factor(df: pd.DataFrame) -> dict[str, Any]:
    """Does performance decay across a series?"""
    print("\n" + "=" * 70)
    print("INVESTIGATION 3: Fatigue Factor")
    print("Question: Does performance decay across a series?")
    print("=" * 70)

    df_copy = df.copy()
    df_copy["game_bucket"] = df_copy["game_number"].apply(
        lambda g: "Game 1" if g == 1 else ("Game 2" if g == 2 else "Game 3+")
    )

    df_copy["higher_elo_player"] = np.where(
        df_copy["player1_elo"] >= df_copy["player2_elo"],
        df_copy["player1"],
        df_copy["player2"],
    )
    df_copy["higher_elo_won"] = df_copy["winner"] == df_copy["higher_elo_player"]

    bucket_stats = []
    for bucket in ["Game 1", "Game 2", "Game 3+"]:
        subset = df_copy[df_copy["game_bucket"] == bucket]
        n = len(subset)
        higher_wins = subset["higher_elo_won"].sum()
        wr = higher_wins / n if n > 0 else 0
        bucket_stats.append({"bucket": bucket, "n": n, "higher_elo_wins": higher_wins, "win_rate": wr})

    bucket_df = pd.DataFrame(bucket_stats)
    print("\n  Higher-ELO player win rate by game position:")
    for _, row in bucket_df.iterrows():
        print(f"    {row['bucket']}: {row['win_rate']:.1%} ({row['higher_elo_wins']}/{row['n']})")

    contingency = np.array([
        [row["higher_elo_wins"], row["n"] - row["higher_elo_wins"]]
        for _, row in bucket_df.iterrows()
    ])
    if contingency.shape[0] >= 2 and contingency.min() > 0:
        chi2, p_value, _, _ = chi2_contingency(contingency)
        print(f"\n  Chi-square test for trend: chi2 = {chi2:.4f}, p = {p_value:.4f}")
    else:
        chi2, p_value = 0.0, 1.0

    verdict = "CONFIRMED" if p_value < 0.05 else ("INCONCLUSIVE" if p_value < 0.10 else "BUSTED")
    print(f"  Verdict: {verdict}")

    fig, ax = plt.subplots(figsize=(7, 4))
    ax.bar(bucket_df["bucket"], bucket_df["win_rate"], color=["#1abc9c", "#f39c12", "#e74c3c"], edgecolor="white")
    ax.axhline(y=0.5, color="gray", linestyle="--", alpha=0.7)
    ax.set_ylabel("Higher-ELO Player Win Rate")
    ax.set_title("Does the Favorite Fade as the Series Goes On?")
    ax.set_ylim(0, 1)
    fig.tight_layout()
    viz_path = str(ASSETS_DIR / "fatigue_factor.png")
    fig.savefig(viz_path, dpi=150)
    plt.close(fig)

    return {
        "title": "Fatigue Factor",
        "hypothesis": "Higher-ELO player win rate declines in later games of a series",
        "method": "Stratified win rates by game position (1 / 2 / 3+), chi-square test",
        "finding": (
            f"Game 1: {bucket_df.iloc[0]['win_rate']:.1%}, "
            f"Game 2: {bucket_df.iloc[1]['win_rate']:.1%}, "
            f"Game 3+: {bucket_df.iloc[2]['win_rate']:.1%}"
        ),
        "p_value": p_value,
        "verdict": verdict,
        "viz_path": viz_path,
    }


# ============================================================================
# INVESTIGATION 4: COMFORT PICKS VS. WILD CARDS
# ============================================================================


def investigate_comfort_picks(df: pd.DataFrame) -> dict[str, Any]:
    """Do players win more on their most-played civs?"""
    print("\n" + "=" * 70)
    print("INVESTIGATION 4: Comfort Picks vs. Wild Cards")
    print("Question: Do players win more on their most-played civs?")
    print("=" * 70)

    player_civ_games: dict[str, dict[str, list[bool]]] = {}
    for _, row in df.iterrows():
        for p_col, c_col in [("player1", "player1_civ"), ("player2", "player2_civ")]:
            player = row[p_col]
            civ = row[c_col]
            won = row["winner"] == player
            player_civ_games.setdefault(player, {}).setdefault(civ, []).append(won)

    comfort_wrs = []
    wildcard_wrs = []

    for player, civs in player_civ_games.items():
        sorted_civs = sorted(civs.items(), key=lambda x: len(x[1]), reverse=True)
        top3_civs = {c for c, _ in sorted_civs[:3]}

        comfort_wins = sum(w for c, games in civs.items() if c in top3_civs for w in games)
        comfort_total = sum(len(games) for c, games in civs.items() if c in top3_civs)

        wild_wins = sum(w for c, games in civs.items() if c not in top3_civs for w in games)
        wild_total = sum(len(games) for c, games in civs.items() if c not in top3_civs)

        if comfort_total >= 3 and wild_total >= 3:
            comfort_wrs.append(comfort_wins / comfort_total)
            wildcard_wrs.append(wild_wins / wild_total)

    if len(comfort_wrs) < 5:
        print("  Too few players with sufficient data in both categories.")
        return {
            "title": "Comfort Picks vs. Wild Cards",
            "hypothesis": "Comfort picks outperform wild card picks",
            "method": "Paired comparison of per-player win rates",
            "finding": "Insufficient data",
            "p_value": None,
            "verdict": "INCONCLUSIVE",
            "viz_path": None,
        }

    comfort_arr = np.array(comfort_wrs)
    wild_arr = np.array(wildcard_wrs)
    mean_comfort = comfort_arr.mean()
    mean_wild = wild_arr.mean()

    try:
        stat, p_value = wilcoxon(comfort_arr, wild_arr, alternative="greater")
    except ValueError:
        stat, p_value = 0.0, 1.0

    print(f"\n  Players analyzed: {len(comfort_wrs)}")
    print(f"  Mean comfort pick win rate: {mean_comfort:.1%}")
    print(f"  Mean wild card win rate:    {mean_wild:.1%}")
    print(f"  Wilcoxon signed-rank (one-sided): W = {stat:.1f}, p = {p_value:.4f}")

    verdict = "CONFIRMED" if p_value < 0.05 else ("INCONCLUSIVE" if p_value < 0.10 else "BUSTED")
    print(f"  Verdict: {verdict}")

    fig, ax = plt.subplots(figsize=(6, 5))
    ax.boxplot([comfort_arr, wild_arr], labels=["Comfort Picks", "Wild Cards"])
    ax.set_ylabel("Win Rate")
    ax.set_title("Comfort Picks vs. Wild Card Win Rates")
    fig.tight_layout()
    viz_path = str(ASSETS_DIR / "comfort_picks.png")
    fig.savefig(viz_path, dpi=150)
    plt.close(fig)

    return {
        "title": "Comfort Picks vs. Wild Cards",
        "hypothesis": "Comfort picks (top-3 most-played civs) outperform one-off picks",
        "method": "Per-player paired win rates, Wilcoxon signed-rank test (one-sided)",
        "finding": f"Comfort: {mean_comfort:.1%}, Wild Cards: {mean_wild:.1%} (p = {p_value:.4f})",
        "p_value": p_value,
        "verdict": verdict,
        "viz_path": viz_path,
    }


# ============================================================================
# INVESTIGATION 5: CLUTCH FACTOR
# ============================================================================


def investigate_clutch_factor(df: pd.DataFrame) -> dict[str, Any]:
    """Who over/underperforms in deciding games?"""
    print("\n" + "=" * 70)
    print("INVESTIGATION 5: Clutch Factor")
    print("Question: Who over/underperforms in deciding games?")
    print("=" * 70)

    max_game = df.groupby("match_id")["game_number"].transform("max")
    deciding = df[df["game_number"] == max_game].copy()
    deciding = deciding[deciding["game_number"] > 1]

    all_players = pd.concat([df["player1"], df["player2"]]).unique()
    results = []

    for player in all_players:
        overall_games = df[(df["player1"] == player) | (df["player2"] == player)]
        overall_wins = (overall_games["winner"] == player).sum()
        overall_n = len(overall_games)
        if overall_n < 10:
            continue
        overall_wr = overall_wins / overall_n

        clutch_games = deciding[(deciding["player1"] == player) | (deciding["player2"] == player)]
        clutch_wins = (clutch_games["winner"] == player).sum()
        clutch_n = len(clutch_games)
        if clutch_n < 3:
            continue
        clutch_wr = clutch_wins / clutch_n

        result = binomtest(clutch_wins, clutch_n, overall_wr, alternative="two-sided")

        results.append({
            "player": player,
            "overall_wr": overall_wr,
            "clutch_wr": clutch_wr,
            "clutch_n": clutch_n,
            "delta": clutch_wr - overall_wr,
            "p_value": result.pvalue,
        })

    results_df = pd.DataFrame(results).sort_values("delta", ascending=False)

    print("\n  Clutch performance (deciding games vs. baseline):")
    for _, row in results_df.iterrows():
        direction = "+" if row["delta"] >= 0 else ""
        sig = "*" if row["p_value"] < 0.05 else ""
        print(
            f"    {row['player']:<15} | Clutch: {row['clutch_wr']:.1%} | "
            f"Baseline: {row['overall_wr']:.1%} | Delta: {direction}{row['delta']:.1%} | "
            f"n={row['clutch_n']:.0f} {sig}"
        )

    n_sig = (results_df["p_value"] < 0.05).sum()
    min_p = results_df["p_value"].min() if len(results_df) > 0 else 1.0
    verdict = "CONFIRMED" if n_sig > 0 else "BUSTED"
    print(f"\n  Players with significant clutch deviation: {n_sig}")
    print(f"  Verdict: {verdict}")

    results_df.to_csv(DATA_DIR / "clutch_factor.csv", index=False)

    fig, ax = plt.subplots(figsize=(10, 5))
    colors = ["#2ecc71" if d >= 0 else "#e74c3c" for d in results_df["delta"]]
    ax.barh(results_df["player"], results_df["delta"], color=colors, edgecolor="white")
    ax.axvline(x=0, color="gray", linestyle="--")
    ax.set_xlabel("Win Rate Delta (Clutch - Baseline)")
    ax.set_title("Clutch Factor: Deciding Game Performance vs. Baseline")
    ax.invert_yaxis()
    fig.tight_layout()
    viz_path = str(ASSETS_DIR / "clutch_factor.png")
    fig.savefig(viz_path, dpi=150)
    plt.close(fig)

    return {
        "title": "Clutch Factor",
        "hypothesis": "Some players significantly over/underperform in deciding games",
        "method": "Per-player binomial test comparing clutch win rate to overall baseline",
        "finding": f"{n_sig} player(s) with statistically significant clutch deviation (p < 0.05)",
        "p_value": min_p,
        "verdict": verdict,
        "viz_path": viz_path,
    }


# ============================================================================
# INVESTIGATION 6: ONE-SIDED CIV MATCHUPS
# ============================================================================


def investigate_civ_matchups(df: pd.DataFrame) -> dict[str, Any]:
    """Which civ pairings are most imbalanced?"""
    print("\n" + "=" * 70)
    print("INVESTIGATION 6: One-Sided Civ Matchups")
    print("Question: Which civ pairings are most imbalanced?")
    print("=" * 70)

    matchups: dict[tuple[str, str], dict[str, int]] = {}
    for _, row in df.iterrows():
        civ1, civ2 = sorted([row["player1_civ"], row["player2_civ"]])
        key = (civ1, civ2)
        if key not in matchups:
            matchups[key] = {"civ1_wins": 0, "civ2_wins": 0, "total": 0}
        matchups[key]["total"] += 1

        winner_civ = row["player1_civ"] if row["winner"] == row["player1"] else row["player2_civ"]
        sorted_winner = civ1 if winner_civ == civ1 else civ2
        if sorted_winner == civ1:
            matchups[key]["civ1_wins"] += 1
        else:
            matchups[key]["civ2_wins"] += 1

    rows = []
    for (c1, c2), data in matchups.items():
        if c1 == c2 or data["total"] < 3:
            continue
        dominant_wins = max(data["civ1_wins"], data["civ2_wins"])
        dominant_civ = c1 if data["civ1_wins"] >= data["civ2_wins"] else c2
        weaker_civ = c2 if dominant_civ == c1 else c1
        wr = dominant_wins / data["total"]
        result = binomtest(dominant_wins, data["total"], 0.5, alternative="greater")
        rows.append({
            "civ_a": dominant_civ,
            "civ_b": weaker_civ,
            "civ_a_wins": dominant_wins,
            "total": data["total"],
            "win_rate": wr,
            "p_value": result.pvalue,
        })

    matchup_df = pd.DataFrame(rows).sort_values("win_rate", ascending=False)
    matchup_df.to_csv(DATA_DIR / "civ_matchup_matrix.csv", index=False)

    sig_matchups = matchup_df[matchup_df["p_value"] < 0.05]

    print(f"\n  Total civ pairings analyzed (n >= 3): {len(matchup_df)}")
    print(f"  Statistically one-sided matchups (p < 0.05): {len(sig_matchups)}")
    if len(matchup_df) > 0:
        print("\n  Most one-sided pairings:")
        for _, row in matchup_df.head(10).iterrows():
            sig = "*" if row["p_value"] < 0.05 else ""
            print(
                f"    {row['civ_a']:<15} vs {row['civ_b']:<15} | "
                f"{row['win_rate']:.0%} ({row['civ_a_wins']:.0f}/{row['total']:.0f}) {sig}"
            )

    verdict = "CONFIRMED" if len(sig_matchups) > 0 else "BUSTED"
    print(f"\n  Verdict: {verdict}")

    if len(matchup_df) >= 5:
        top = matchup_df.head(15)
        fig, ax = plt.subplots(figsize=(10, 6))
        labels = [f"{r['civ_a']} vs {r['civ_b']}" for _, r in top.iterrows()]
        ax.barh(labels, top["win_rate"], color="#9b59b6", edgecolor="white")
        ax.axvline(x=0.5, color="red", linestyle="--", alpha=0.7)
        ax.set_xlabel("Dominant Civ Win Rate")
        ax.set_title("Most One-Sided Civ Matchups")
        ax.set_xlim(0.4, 1.0)
        ax.invert_yaxis()
        fig.tight_layout()
        viz_path = str(ASSETS_DIR / "civ_matchups.png")
        fig.savefig(viz_path, dpi=150)
        plt.close(fig)
    else:
        viz_path = None

    return {
        "title": "One-Sided Civ Matchups",
        "hypothesis": "Some civ pairings have significantly imbalanced win rates",
        "method": "Civ-vs-civ win rate matrix (min 3 games), binomial test per pair",
        "finding": f"{len(sig_matchups)} matchup(s) significantly one-sided out of {len(matchup_df)} tested",
        "p_value": sig_matchups["p_value"].min() if len(sig_matchups) > 0 else 1.0,
        "verdict": verdict,
        "viz_path": viz_path,
    }


# ============================================================================
# INVESTIGATION 7: MAP SPECIALISTS
# ============================================================================


def investigate_map_specialists(df: pd.DataFrame) -> dict[str, Any]:
    """Which players over/underperform on specific maps?"""
    print("\n" + "=" * 70)
    print("INVESTIGATION 7: Map Specialists")
    print("Question: Which players over/underperform on specific maps?")
    print("=" * 70)

    all_players = pd.concat([df["player1"], df["player2"]]).unique()
    results = []

    for player in all_players:
        player_games = df[(df["player1"] == player) | (df["player2"] == player)]
        overall_wins = (player_games["winner"] == player).sum()
        overall_n = len(player_games)
        if overall_n < 10:
            continue
        overall_wr = overall_wins / overall_n

        for map_name in player_games["map"].unique():
            map_games = player_games[player_games["map"] == map_name]
            map_wins = (map_games["winner"] == player).sum()
            map_n = len(map_games)
            if map_n < 3:
                continue
            map_wr = map_wins / map_n
            delta = map_wr - overall_wr

            result = binomtest(map_wins, map_n, overall_wr, alternative="two-sided")
            results.append({
                "player": player,
                "map": map_name,
                "map_wr": map_wr,
                "overall_wr": overall_wr,
                "delta": delta,
                "map_n": map_n,
                "p_value": result.pvalue,
            })

    affinity_df = pd.DataFrame(results).sort_values("delta", ascending=False)
    affinity_df.to_csv(DATA_DIR / "player_map_affinity.csv", index=False)

    sig = affinity_df[affinity_df["p_value"] < 0.05]

    print(f"\n  Player-map pairs analyzed (n >= 3): {len(affinity_df)}")
    print(f"  Statistically significant affinities (p < 0.05): {len(sig)}")

    if len(affinity_df) > 0:
        print("\n  Top map specialists (largest positive delta):")
        for _, row in affinity_df.head(10).iterrows():
            s = "*" if row["p_value"] < 0.05 else ""
            print(
                f"    {row['player']:<15} on {row['map']:<15} | "
                f"Map WR: {row['map_wr']:.1%} vs Baseline: {row['overall_wr']:.1%} | "
                f"Delta: +{row['delta']:.1%} | n={row['map_n']:.0f} {s}"
            )

    verdict = "CONFIRMED" if len(sig) > 0 else "BUSTED"
    print(f"\n  Verdict: {verdict}")

    if len(affinity_df) >= 5:
        top_n = min(20, len(affinity_df))
        top = affinity_df.head(top_n)
        fig, ax = plt.subplots(figsize=(10, 7))
        labels = [f"{r['player']} / {r['map']}" for _, r in top.iterrows()]
        colors = ["#2ecc71" if d >= 0 else "#e74c3c" for d in top["delta"]]
        ax.barh(labels, top["delta"], color=colors, edgecolor="white")
        ax.axvline(x=0, color="gray", linestyle="--")
        ax.set_xlabel("Win Rate Delta vs. Baseline")
        ax.set_title("Map Specialists: Largest Deviations from Baseline")
        ax.invert_yaxis()
        fig.tight_layout()
        viz_path = str(ASSETS_DIR / "map_specialists.png")
        fig.savefig(viz_path, dpi=150)
        plt.close(fig)
    else:
        viz_path = None

    return {
        "title": "Map Specialists",
        "hypothesis": "Certain players have statistically significant map affinities",
        "method": "Per-player per-map win rate vs. baseline, binomial test (min 3 games)",
        "finding": f"{len(sig)} significant map affinity pair(s) out of {len(affinity_df)}",
        "p_value": sig["p_value"].min() if len(sig) > 0 else 1.0,
        "verdict": verdict,
        "viz_path": viz_path,
    }


# ============================================================================
# INVESTIGATION 8: UPSET PROBABILITY
# ============================================================================


def investigate_upset_probability(df: pd.DataFrame) -> dict[str, Any]:
    """Do underdogs win more often than ELO theory predicts?"""
    print("\n" + "=" * 70)
    print("INVESTIGATION 8: Upset Probability")
    print("Question: Do underdogs win more often than ELO theory predicts?")
    print("=" * 70)

    df_copy = df.copy()
    df_copy["elo_diff"] = abs(df_copy["player1_elo"] - df_copy["player2_elo"])
    df_copy["favorite"] = np.where(
        df_copy["player1_elo"] >= df_copy["player2_elo"],
        df_copy["player1"],
        df_copy["player2"],
    )
    df_copy["favorite_won"] = df_copy["winner"] == df_copy["favorite"]

    df_copy["expected_fav_wr"] = 1 / (1 + 10 ** (-df_copy["elo_diff"] / 400))

    bins = [0, 25, 50, 100, 200, float("inf")]
    labels = ["0-25", "26-50", "51-100", "101-200", "200+"]
    df_copy["elo_bin"] = pd.cut(df_copy["elo_diff"], bins=bins, labels=labels)

    bin_stats = []
    for label in labels:
        subset = df_copy[df_copy["elo_bin"] == label]
        if len(subset) == 0:
            continue
        actual_fav = subset["favorite_won"].mean()
        expected_fav = subset["expected_fav_wr"].mean()
        actual_upset = 1 - actual_fav
        expected_upset = 1 - expected_fav
        volatility = actual_upset / expected_upset if expected_upset > 0 else 0
        bin_stats.append({
            "elo_bin": label,
            "n": len(subset),
            "actual_fav_wr": actual_fav,
            "expected_fav_wr": expected_fav,
            "actual_upset_rate": actual_upset,
            "expected_upset_rate": expected_upset,
            "volatility_factor": volatility,
        })

    bin_df = pd.DataFrame(bin_stats)
    bin_df.to_csv(DATA_DIR / "upset_probability_by_elo_bin.csv", index=False)

    print("\n  Upset rates by ELO difference bin:")
    print(f"    {'ELO Diff':<10} {'n':>5} {'Actual Upset':>14} {'Expected Upset':>16} {'Volatility':>12}")
    for _, row in bin_df.iterrows():
        print(
            f"    {row['elo_bin']:<10} {row['n']:>5.0f} "
            f"{row['actual_upset_rate']:>13.1%} {row['expected_upset_rate']:>15.1%} "
            f"{row['volatility_factor']:>11.2f}x"
        )

    overall_actual = 1 - df_copy["favorite_won"].mean()
    overall_expected = 1 - df_copy["expected_fav_wr"].mean()
    overall_volatility = overall_actual / overall_expected if overall_expected > 0 else 0

    n_upsets = (~df_copy["favorite_won"]).sum()
    n_total = len(df_copy)
    result = binomtest(n_upsets, n_total, overall_expected, alternative="greater")
    p_value = result.pvalue

    print(f"\n  Overall tournament volatility factor: {overall_volatility:.2f}x")
    print(f"  Binomial test (upsets > expected): p = {p_value:.4f}")
    verdict = "CONFIRMED" if p_value < 0.05 else ("INCONCLUSIVE" if p_value < 0.10 else "BUSTED")
    print(f"  Verdict: {verdict}")

    fig, ax = plt.subplots(figsize=(8, 5))
    x = range(len(bin_df))
    width = 0.35
    ax.bar([i - width / 2 for i in x], bin_df["actual_upset_rate"], width, label="Actual Upset Rate", color="#e74c3c")
    ax.bar([i + width / 2 for i in x], bin_df["expected_upset_rate"], width, label="Expected (ELO Model)", color="#3498db")
    ax.set_xticks(list(x))
    ax.set_xticklabels(bin_df["elo_bin"])
    ax.set_xlabel("ELO Difference Bin")
    ax.set_ylabel("Upset Rate")
    ax.set_title("Actual vs. Expected Upset Rates by ELO Difference")
    ax.legend()
    fig.tight_layout()
    viz_path = str(ASSETS_DIR / "upset_probability.png")
    fig.savefig(viz_path, dpi=150)
    plt.close(fig)

    return {
        "title": "Upset Probability",
        "hypothesis": "Tournament upsets exceed the logistic ELO model expectation",
        "method": "Bin by ELO difference, compare actual upset rate to E(win) = 1/(1+10^(-d/400)), binomial test",
        "finding": f"Tournament volatility factor: {overall_volatility:.2f}x (p = {p_value:.4f})",
        "p_value": p_value,
        "verdict": verdict,
        "viz_path": viz_path,
    }


# ============================================================================
# INVESTIGATION 9: TEMPO CONTROL
# ============================================================================


def investigate_tempo_control(df: pd.DataFrame) -> dict[str, Any]:
    """Does controlling game length correlate with winning?"""
    print("\n" + "=" * 70)
    print("INVESTIGATION 9: Tempo Control")
    print("Question: Does controlling game length correlate with winning?")
    print("=" * 70)

    all_players = pd.concat([df["player1"], df["player2"]]).unique()
    player_stats = []

    for player in all_players:
        games = df[(df["player1"] == player) | (df["player2"] == player)]
        if len(games) < 10:
            continue
        wins = (games["winner"] == player).sum()
        durations = games["duration_minutes"].values
        player_stats.append({
            "player": player,
            "win_rate": wins / len(games),
            "mean_duration": np.mean(durations),
            "std_duration": np.std(durations, ddof=1),
            "cv_duration": np.std(durations, ddof=1) / np.mean(durations) if np.mean(durations) > 0 else 0,
            "n_games": len(games),
        })

    ps_df = pd.DataFrame(player_stats)

    if len(ps_df) < 6:
        print("  Too few qualified players for clustering.")
        return {
            "title": "Tempo Control",
            "hypothesis": "Low duration variance correlates with higher win rate",
            "method": "K-means clustering on duration distributions",
            "finding": "Insufficient data",
            "p_value": None,
            "verdict": "INCONCLUSIVE",
            "viz_path": None,
        }

    terciles = ps_df["mean_duration"].quantile([1 / 3, 2 / 3]).values
    ps_df["tempo"] = pd.cut(
        ps_df["mean_duration"],
        bins=[-np.inf, terciles[0], terciles[1], np.inf],
        labels=["Fast", "Medium", "Slow"],
    )

    print("\n  Tempo clusters:")
    for tempo in ["Fast", "Medium", "Slow"]:
        subset = ps_df[ps_df["tempo"] == tempo]
        if len(subset) == 0:
            continue
        print(
            f"    {tempo:<8} | n={len(subset)} players | "
            f"Avg Duration: {subset['mean_duration'].mean():.1f} min | "
            f"Avg CV: {subset['cv_duration'].mean():.3f} | "
            f"Avg Win Rate: {subset['win_rate'].mean():.1%}"
        )

    corr, p_value = stats.spearmanr(ps_df["cv_duration"], ps_df["win_rate"])
    print(f"\n  Spearman correlation (duration CV vs win rate): rho = {corr:.4f}, p = {p_value:.4f}")

    verdict = "CONFIRMED" if p_value < 0.05 else ("INCONCLUSIVE" if p_value < 0.10 else "BUSTED")
    print(f"  Verdict: {verdict}")

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    for tempo, color in [("Fast", "#e74c3c"), ("Medium", "#f39c12"), ("Slow", "#3498db")]:
        subset = ps_df[ps_df["tempo"] == tempo]
        axes[0].scatter(subset["mean_duration"], subset["win_rate"], label=tempo, color=color, s=80, alpha=0.8)
    axes[0].set_xlabel("Mean Game Duration (min)")
    axes[0].set_ylabel("Win Rate")
    axes[0].set_title("Tempo Clusters: Duration vs. Win Rate")
    axes[0].legend()

    axes[1].scatter(ps_df["cv_duration"], ps_df["win_rate"], color="#9b59b6", s=80, alpha=0.8)
    axes[1].set_xlabel("Duration CV (Consistency)")
    axes[1].set_ylabel("Win Rate")
    axes[1].set_title("Duration Consistency vs. Win Rate")

    fig.tight_layout()
    viz_path = str(ASSETS_DIR / "tempo_control.png")
    fig.savefig(viz_path, dpi=150)
    plt.close(fig)

    return {
        "title": "Tempo Control",
        "hypothesis": "Players with low duration variance (consistent tempo) win more",
        "method": "Tercile-based tempo grouping on mean duration, Spearman correlation (CV vs win rate)",
        "finding": f"Spearman rho = {corr:.4f} (p = {p_value:.4f})",
        "p_value": p_value,
        "verdict": verdict,
        "viz_path": viz_path,
    }


# ============================================================================
# INVESTIGATION 10: META EVOLUTION
# ============================================================================


def investigate_meta_evolution(df: pd.DataFrame) -> dict[str, Any]:
    """How do civ picks shift as tournament stakes increase?"""
    print("\n" + "=" * 70)
    print("INVESTIGATION 10: Meta Evolution")
    print("Question: How do civ picks shift as tournament stakes increase?")
    print("=" * 70)

    stages = df["stage"].unique()
    print(f"\n  Stages found: {list(stages)}")

    if len(stages) < 2:
        print("  Only one stage found -- cannot measure evolution.")
        return {
            "title": "Meta Evolution",
            "hypothesis": "Civ pick distributions change across tournament stages",
            "method": "Per-civ pick rate by stage, chi-square test",
            "finding": "Only one stage in data -- cannot measure evolution",
            "p_value": None,
            "verdict": "INCONCLUSIVE",
            "viz_path": None,
        }

    stage_civ_counts: dict[str, dict[str, int]] = {}
    for _, row in df.iterrows():
        stage = row["stage"]
        for civ_col in ["player1_civ", "player2_civ"]:
            civ = row[civ_col]
            stage_civ_counts.setdefault(stage, {}).setdefault(civ, 0)
            stage_civ_counts[stage][civ] += 1

    all_civs = set()
    for counts in stage_civ_counts.values():
        all_civs.update(counts.keys())

    pivot = pd.DataFrame(
        {stage: {civ: counts.get(civ, 0) for civ in all_civs} for stage, counts in stage_civ_counts.items()}
    )

    stage_totals = pivot.sum(axis=0)
    pick_rates = pivot.div(stage_totals, axis=1)

    if len(stages) == 2:
        s1, s2 = sorted(stages)
        pick_rates["delta"] = pick_rates[s2] - pick_rates[s1]
        pick_rates_sorted = pick_rates.sort_values("delta", ascending=False)
        print(f"\n  Biggest risers ({s1} -> {s2}):")
        for civ, row in pick_rates_sorted.head(5).iterrows():
            print(f"    {civ:<18} | {s1}: {row[s1]:.1%} -> {s2}: {row[s2]:.1%} | Delta: +{row['delta']:.1%}")
        print(f"\n  Biggest fallers ({s1} -> {s2}):")
        for civ, row in pick_rates_sorted.tail(5).iterrows():
            print(f"    {civ:<18} | {s1}: {row[s1]:.1%} -> {s2}: {row[s2]:.1%} | Delta: {row['delta']:.1%}")
    else:
        first_stage = sorted(stages)[0]
        last_stage = sorted(stages)[-1]
        if first_stage in pick_rates.columns and last_stage in pick_rates.columns:
            pick_rates["delta"] = pick_rates[last_stage] - pick_rates[first_stage]
            pick_rates_sorted = pick_rates.sort_values("delta", ascending=False)
            print(f"\n  Biggest risers ({first_stage} -> {last_stage}):")
            for civ, row in pick_rates_sorted.head(5).iterrows():
                print(f"    {civ:<18} | Delta: +{row['delta']:.1%}")
            print(f"\n  Biggest fallers ({first_stage} -> {last_stage}):")
            for civ, row in pick_rates_sorted.tail(5).iterrows():
                print(f"    {civ:<18} | Delta: {row['delta']:.1%}")

    contingency = pivot.values
    chi2, p_value, _, _ = chi2_contingency(contingency)
    print(f"\n  Chi-square test (civ distribution vs stage): chi2 = {chi2:.4f}, p = {p_value:.4f}")

    verdict = "CONFIRMED" if p_value < 0.05 else ("INCONCLUSIVE" if p_value < 0.10 else "BUSTED")
    print(f"  Verdict: {verdict}")

    if "delta" in pick_rates.columns:
        pick_rates_sorted = pick_rates.sort_values("delta", ascending=False)
        top_movers = pd.concat([pick_rates_sorted.head(7), pick_rates_sorted.tail(7)])
        fig, ax = plt.subplots(figsize=(10, 7))
        colors = ["#2ecc71" if d >= 0 else "#e74c3c" for d in top_movers["delta"]]
        ax.barh(top_movers.index, top_movers["delta"], color=colors, edgecolor="white")
        ax.axvline(x=0, color="gray", linestyle="--")
        ax.set_xlabel("Pick Rate Delta (Early -> Late Stage)")
        ax.set_title("Meta Evolution: Biggest Civ Pick Rate Shifts")
        ax.invert_yaxis()
        fig.tight_layout()
        viz_path = str(ASSETS_DIR / "meta_evolution.png")
        fig.savefig(viz_path, dpi=150)
        plt.close(fig)
    else:
        viz_path = None

    return {
        "title": "Meta Evolution",
        "hypothesis": "Civ pick distributions change significantly between tournament stages",
        "method": "Per-civ pick rate by stage, chi-square test for distributional shift",
        "finding": f"Chi-square = {chi2:.4f} (p = {p_value:.4f})",
        "p_value": p_value,
        "verdict": verdict,
        "viz_path": viz_path,
    }


# ============================================================================
# REPORT GENERATION
# ============================================================================


def generate_report(findings: list[dict[str, Any]]) -> None:
    """Write SPIRIT_FINDINGS.md from investigation results."""
    lines = [
        "# Spirit of the Law Investigations -- T90 Titans League Season 5",
        "",
        "Deep investigative analysis: 10 questions the standard pipeline does not cover.",
        "",
        "---",
        "",
    ]

    lines.append("## Summary")
    lines.append("")
    lines.append("| Investigation | Verdict | p-value |")
    lines.append("|---------------|---------|---------|")
    for f in findings:
        p = f.get("p_value")
        p_str = f"{p:.4f}" if isinstance(p, float) else "N/A"
        lines.append(f"| {f['title']} | {f['verdict']} | {p_str} |")
    lines.append("")
    lines.append("---")
    lines.append("")

    for i, f in enumerate(findings, 1):
        lines.append(f"## {i}. {f['title']}")
        lines.append("")
        lines.append(f"**Hypothesis:** {f['hypothesis']}")
        lines.append("")
        lines.append(f"**Method:** {f['method']}")
        lines.append("")
        lines.append(f"**Finding:** {f['finding']}")
        lines.append("")
        p = f.get("p_value")
        if isinstance(p, float):
            lines.append(f"**p-value:** {p:.4f}")
            lines.append("")
        lines.append(f"**Verdict:** {f['verdict']}")
        lines.append("")
        if f.get("viz_path"):
            lines.append(f"![{f['title']}]({f['viz_path']})")
            lines.append("")
        lines.append("---")
        lines.append("")

    with open("SPIRIT_FINDINGS.md", "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))

    print(f"\nReport written to SPIRIT_FINDINGS.md ({len(findings)} investigations)")


# ============================================================================
# MAIN
# ============================================================================


def main() -> None:
    """Run all 10 investigations and generate the report."""
    _ensure_dirs()

    print("=" * 70)
    print("SPIRIT OF THE LAW INVESTIGATIONS")
    print("T90 Titans League Season 5")
    print("=" * 70)

    df = load_data()
    findings: list[dict[str, Any]] = []

    findings.append(investigate_snowball_effect(df))
    findings.append(investigate_draft_order(df))
    findings.append(investigate_fatigue_factor(df))
    findings.append(investigate_comfort_picks(df))
    findings.append(investigate_clutch_factor(df))
    findings.append(investigate_civ_matchups(df))
    findings.append(investigate_map_specialists(df))
    findings.append(investigate_upset_probability(df))
    findings.append(investigate_tempo_control(df))
    findings.append(investigate_meta_evolution(df))

    generate_report(findings)

    print("\n" + "=" * 70)
    print("ALL INVESTIGATIONS COMPLETE")
    print("=" * 70)
    confirmed = sum(1 for f in findings if f["verdict"] == "CONFIRMED")
    busted = sum(1 for f in findings if f["verdict"] == "BUSTED")
    inconclusive = sum(1 for f in findings if f["verdict"] == "INCONCLUSIVE")
    print(f"  CONFIRMED: {confirmed}")
    print(f"  BUSTED: {busted}")
    print(f"  INCONCLUSIVE: {inconclusive}")


if __name__ == "__main__":
    main()
