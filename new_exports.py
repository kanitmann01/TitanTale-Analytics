"""
New data exports for the web layer.

Produces:
  data/player_h2h.csv           -- per-series head-to-head records
  data/player_advanced_metrics.csv -- extended player stats (residuals, tiers)
  data/scouting_reports.csv     -- pairwise preparation summaries
  data/draft_position_outcomes.csv -- pick-order win rates from civ_drafts
"""

from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

DATA_DIR = Path("data")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_matches() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "ttl_s5_matches.csv")


def _load_spirit_affinity() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "spirit" / "player_map_affinity.csv")


def _load_spirit_upset() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "spirit" / "upset_probability_by_elo_bin.csv")


def _load_drafts() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "civ_drafts.csv")


# ---------------------------------------------------------------------------
# 1. player_h2h.csv
# ---------------------------------------------------------------------------

def export_player_h2h(df: pd.DataFrame) -> pd.DataFrame:
    """One row per series (match_id) with H2H record and context."""

    rows: list[dict[str, Any]] = []
    for mid, grp in df.groupby("match_id"):
        p1 = grp["player1"].iloc[0]
        p2 = grp["player2"].iloc[0]
        player_a, player_b = sorted([p1, p2])

        a_wins = 0
        b_wins = 0
        maps_played: list[str] = []
        a_civs: list[str] = []
        b_civs: list[str] = []

        for _, g in grp.iterrows():
            maps_played.append(g["map"])
            is_p1_a = g["player1"] == player_a
            if is_p1_a:
                a_civs.append(g["player1_civ"])
                b_civs.append(g["player2_civ"])
            else:
                a_civs.append(g["player2_civ"])
                b_civs.append(g["player1_civ"])

            if g["winner"] == player_a:
                a_wins += 1
            else:
                b_wins += 1

        series_winner = player_a if a_wins > b_wins else player_b
        elo_a = (
            grp.loc[grp["player1"] == player_a, "player1_elo"].values[0]
            if (grp["player1"] == player_a).any()
            else grp.loc[grp["player2"] == player_a, "player2_elo"].values[0]
        )
        elo_b = (
            grp.loc[grp["player1"] == player_b, "player1_elo"].values[0]
            if (grp["player1"] == player_b).any()
            else grp.loc[grp["player2"] == player_b, "player2_elo"].values[0]
        )

        rows.append({
            "player_a": player_a,
            "player_b": player_b,
            "series_winner": series_winner,
            "a_game_wins": a_wins,
            "b_game_wins": b_wins,
            "total_games": len(grp),
            "maps_played": ";".join(maps_played),
            "a_civs": ";".join(a_civs),
            "b_civs": ";".join(b_civs),
            "avg_duration": round(grp["duration_minutes"].mean(), 1),
            "elo_diff": round(elo_a - elo_b, 1),
        })

    out = pd.DataFrame(rows).sort_values(["player_a", "player_b"]).reset_index(drop=True)
    out.to_csv(DATA_DIR / "player_h2h.csv", index=False)
    print(f"[OK] player_h2h.csv: {len(out)} rows")
    return out


# ---------------------------------------------------------------------------
# 2. player_advanced_metrics.csv
# ---------------------------------------------------------------------------

def export_player_advanced_metrics(df: pd.DataFrame) -> pd.DataFrame:
    """Extended per-player metrics including ELO residuals and tiers."""

    all_players = sorted(pd.concat([df["player1"], df["player2"]]).unique())
    rows: list[dict[str, Any]] = []

    for player in all_players:
        mask = (df["player1"] == player) | (df["player2"] == player)
        games = df[mask]
        total = len(games)
        wins = len(games[games["winner"] == player])
        wr = wins / total if total > 0 else 0.0

        p1_mask = df["player1"] == player
        p1_games = df[p1_mask]
        p1_wins = len(p1_games[p1_games["winner"] == player])
        p1_total = len(p1_games)
        p1_wr = p1_wins / p1_total if p1_total > 0 else 0.0

        p2_mask = df["player2"] == player
        p2_games = df[p2_mask]
        p2_wins = len(p2_games[p2_games["winner"] == player])
        p2_total = len(p2_games)
        p2_wr = p2_wins / p2_total if p2_total > 0 else 0.0

        durations = games["duration_minutes"].values
        dur_mean = float(np.mean(durations))
        dur_std = float(np.std(durations, ddof=1)) if total > 1 else 0.0
        dur_cv = dur_std / dur_mean if dur_mean > 0 else 0.0

        civs = set()
        civs.update(p1_games["player1_civ"].tolist())
        civs.update(p2_games["player2_civ"].tolist())
        civ_diversity = len(civs) / total if total > 0 else 0.0

        elo = (
            p1_games["player1_elo"].iloc[0] if p1_total > 0
            else p2_games["player2_elo"].iloc[0]
        )

        if total >= 5:
            results = [
                1 if r["winner"] == player else 0 for _, r in games.iterrows()
            ]
            window = min(5, len(results))
            rolling = pd.Series(results).rolling(window=window, min_periods=1).mean()
            consistency = round(1 - float(rolling.std()), 3)
        else:
            consistency = float("nan")

        rows.append({
            "player": player,
            "elo": round(elo, 1),
            "win_rate": round(wr, 4),
            "total_games": total,
            "duration_cv": round(dur_cv, 4),
            "position_bias": round(abs(p1_wr - p2_wr), 4),
            "p1_win_rate": round(p1_wr, 4),
            "p2_win_rate": round(p2_wr, 4),
            "civ_diversity": round(civ_diversity, 4),
            "unique_civs": len(civs),
            "consistency": consistency,
        })

    metrics = pd.DataFrame(rows)

    # ELO regression residuals
    z = np.polyfit(metrics["elo"], metrics["win_rate"], 1)
    poly = np.poly1d(z)
    metrics["expected_win_rate"] = metrics["elo"].apply(lambda e: round(poly(e), 4))
    metrics["performance_residual"] = (
        metrics["win_rate"] - metrics["expected_win_rate"]
    ).round(4)

    # Performance tiers
    median_elo = metrics["elo"].median()
    tiers: list[str] = []
    for _, r in metrics.iterrows():
        if r["win_rate"] > 0.7 and r["elo"] > median_elo:
            tiers.append("Elite")
        elif r["win_rate"] > 0.55 and r["elo"] > median_elo:
            tiers.append("Strong")
        elif r["win_rate"] < 0.35:
            tiers.append("Struggling")
        else:
            tiers.append("Average")
    metrics["performance_tier"] = tiers

    metrics.to_csv(DATA_DIR / "player_advanced_metrics.csv", index=False)
    print(f"[OK] player_advanced_metrics.csv: {len(metrics)} rows")
    return metrics


# ---------------------------------------------------------------------------
# 3. scouting_reports.csv
# ---------------------------------------------------------------------------

def export_scouting_reports(
    df: pd.DataFrame,
    affinity: pd.DataFrame,
    upset: pd.DataFrame,
) -> pd.DataFrame:
    """Pairwise scouting summaries for every player pair in the dataset."""

    all_players = sorted(pd.concat([df["player1"], df["player2"]]).unique())

    # Build per-player civ stats
    player_civ_stats: dict[str, list[tuple[str, int, float]]] = {}
    for player in all_players:
        p1_mask = df["player1"] == player
        p2_mask = df["player2"] == player
        civ_records: dict[str, dict[str, int]] = {}
        for _, r in df[p1_mask].iterrows():
            c = r["player1_civ"]
            civ_records.setdefault(c, {"w": 0, "l": 0})
            civ_records[c]["w" if r["winner"] == player else "l"] += 1
        for _, r in df[p2_mask].iterrows():
            c = r["player2_civ"]
            civ_records.setdefault(c, {"w": 0, "l": 0})
            civ_records[c]["w" if r["winner"] == player else "l"] += 1
        ranked = sorted(
            [(c, s["w"] + s["l"], s["w"] / (s["w"] + s["l"]))
             for c, s in civ_records.items()],
            key=lambda x: -x[1],
        )
        player_civ_stats[player] = ranked

    # Build per-player ELO lookup
    elo_map: dict[str, float] = {}
    for player in all_players:
        row = df[df["player1"] == player]
        if len(row) > 0:
            elo_map[player] = float(row["player1_elo"].iloc[0])
        else:
            row = df[df["player2"] == player]
            elo_map[player] = float(row["player2_elo"].iloc[0])

    # Build per-player map affinity lookup
    player_best_maps: dict[str, list[str]] = {}
    player_weak_maps: dict[str, list[str]] = {}
    for player in all_players:
        pa = affinity[affinity["player"] == player].sort_values("delta", ascending=False)
        best = pa[pa["delta"] > 0.05].head(5)["map"].tolist()
        weak = pa[pa["delta"] < -0.10].head(5)["map"].tolist()
        player_best_maps[player] = best
        player_weak_maps[player] = weak

    # Upset probability bins
    def _upset_rate_for_gap(gap: float) -> float:
        abs_gap = abs(gap)
        if abs_gap <= 25:
            return float(upset[upset["elo_bin"] == "0-25"]["expected_upset_rate"].iloc[0])
        elif abs_gap <= 50:
            return float(upset[upset["elo_bin"] == "26-50"]["expected_upset_rate"].iloc[0])
        elif abs_gap <= 100:
            return float(upset[upset["elo_bin"] == "51-100"]["expected_upset_rate"].iloc[0])
        elif abs_gap <= 200:
            return float(upset[upset["elo_bin"] == "101-200"]["expected_upset_rate"].iloc[0])
        else:
            return float(upset[upset["elo_bin"] == "200+"]["expected_upset_rate"].iloc[0])

    rows: list[dict[str, Any]] = []
    for i, a in enumerate(all_players):
        for b in all_players[i + 1:]:
            a_best = player_best_maps.get(a, [])
            b_best = player_best_maps.get(b, [])
            contested = [m for m in a_best if m in b_best]
            a_weak = player_weak_maps.get(a, [])

            a_sig = player_civ_stats.get(a, [])[:3]
            b_sig = player_civ_stats.get(b, [])[:3]
            a_civ_set = {c for c, _, _ in player_civ_stats.get(a, [])}
            b_civ_set = {c for c, _, _ in player_civ_stats.get(b, [])}
            overlap = sorted(a_civ_set & b_civ_set)

            elo_a = elo_map.get(a, 0)
            elo_b = elo_map.get(b, 0)
            elo_diff = elo_a - elo_b
            elo_edge = f"{a} +{abs(elo_diff):.0f}" if elo_diff > 0 else f"{b} +{abs(elo_diff):.0f}"

            rows.append({
                "player_a": a,
                "player_b": b,
                "a_best_maps": ";".join(a_best) if a_best else "",
                "b_best_maps": ";".join(b_best) if b_best else "",
                "contested_maps": ";".join(contested) if contested else "",
                "a_weak_maps": ";".join(a_weak) if a_weak else "",
                "a_signature_civs": ";".join(
                    f"{c}({n}g {wr:.0%})" for c, n, wr in a_sig
                ),
                "b_signature_civs": ";".join(
                    f"{c}({n}g {wr:.0%})" for c, n, wr in b_sig
                ),
                "civ_overlap": ";".join(overlap) if overlap else "",
                "elo_edge": elo_edge,
                "upset_probability": round(_upset_rate_for_gap(elo_diff), 4),
            })

    out = pd.DataFrame(rows)
    out.to_csv(DATA_DIR / "scouting_reports.csv", index=False)
    print(f"[OK] scouting_reports.csv: {len(out)} rows")
    return out


# ---------------------------------------------------------------------------
# 4. draft_position_outcomes.csv
# ---------------------------------------------------------------------------

def export_draft_position_outcomes(drafts: pd.DataFrame) -> pd.DataFrame:
    """Civ distribution and pick patterns by draft position (1st/2nd/3rd).

    Note: winner_civ in civ_drafts.csv is a player name, not a civ name,
    so we cannot compute per-position win rates from this file alone. We
    export pick distributions and frequencies instead.
    """

    # Combine both player columns into a long-form table
    p1 = drafts[["player1_civ", "player1_civ_draft_order", "map"]].rename(
        columns={"player1_civ": "civ", "player1_civ_draft_order": "draft_position"}
    )
    p2 = drafts[["player2_civ", "player2_civ_draft_order", "map"]].rename(
        columns={"player2_civ": "civ", "player2_civ_draft_order": "draft_position"}
    )
    long = pd.concat([p1, p2], ignore_index=True)

    rows: list[dict[str, Any]] = []
    for pos in sorted(long["draft_position"].unique()):
        subset = long[long["draft_position"] == pos]
        total_picks = len(subset)
        unique_civs = subset["civ"].nunique()
        top_civs = subset["civ"].value_counts().head(5)
        top_civs_str = ";".join(
            f"{civ}({count})" for civ, count in top_civs.items()
        )
        top_maps = subset["map"].value_counts().head(5)
        top_maps_str = ";".join(
            f"{m}({c})" for m, c in top_maps.items()
        )

        rows.append({
            "draft_position": int(pos),
            "total_picks": total_picks,
            "unique_civs": unique_civs,
            "top_civs": top_civs_str,
            "top_maps": top_maps_str,
        })

    out = pd.DataFrame(rows)
    out.to_csv(DATA_DIR / "draft_position_outcomes.csv", index=False)
    print(f"[OK] draft_position_outcomes.csv: {len(out)} rows")
    return out


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print("TTL Stats -- New Data Exports")
    print("=" * 60)

    df = _load_matches()
    affinity = _load_spirit_affinity()
    upset = _load_spirit_upset()
    drafts = _load_drafts()

    print(f"\nLoaded {len(df)} games, {len(affinity)} affinity rows, "
          f"{len(drafts)} draft rows\n")

    export_player_h2h(df)
    metrics = export_player_advanced_metrics(df)
    export_scouting_reports(df, affinity, upset)
    export_draft_position_outcomes(drafts)

    print("\nAll exports complete.")


if __name__ == "__main__":
    main()
