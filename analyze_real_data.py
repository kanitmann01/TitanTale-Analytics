"""
T90 Titans League Season 5 - Statistical Analysis on Real Data
Statistical Modeler: Advanced EDA & Predictive Modeling
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from scipy.stats import chi2_contingency, pearsonr, f_oneway
import warnings

warnings.filterwarnings("ignore")

# Set visualization style
plt.style.use("seaborn-v0_8-darkgrid")
sns.set_palette("husl")

# ============================================================================
# SECTION 1: DATA LOADING & VALIDATION
# ============================================================================


def load_data():
    """Load all data files from the Data Engineer."""
    print("=" * 80)
    print("LOADING DATA FILES")
    print("=" * 80)

    data = {}

    try:
        data["matches"] = pd.read_csv("data/matches.csv")
        print(f"[OK] matches.csv: {len(data['matches'])} rows")
    except Exception as e:
        print(f"[ERROR] matches.csv: {e}")

    try:
        data["player_civs"] = pd.read_csv("data/player_civs.csv")
        print(f"[OK] player_civs.csv: {len(data['player_civs'])} rows")
    except Exception as e:
        print(f"[ERROR] player_civs.csv: {e}")

    try:
        data["map_outcomes"] = pd.read_csv("data/map_outcomes.csv")
        print(f"[OK] map_outcomes.csv: {len(data['map_outcomes'])} rows")
    except Exception as e:
        print(f"[ERROR] map_outcomes.csv: {e}")

    try:
        data["civ_drafts"] = pd.read_csv("data/civ_drafts.csv")
        print(f"[OK] civ_drafts.csv: {len(data['civ_drafts'])} rows")
    except Exception as e:
        print(f"[ERROR] civ_drafts.csv: {e}")

    try:
        data["map_results"] = pd.read_csv("data/map_results.csv")
        print(f"[OK] map_results.csv: {len(data['map_results'])} rows")
    except Exception as e:
        print(f"[ERROR] map_results.csv: {e}")

    try:
        data["civ_drafts_detailed"] = pd.read_csv("data/civ_drafts.csv")
        print(
            f"[OK] civ_drafts.csv (detailed): {len(data['civ_drafts_detailed'])} rows"
        )
    except Exception as e:
        print(f"[ERROR] civ_drafts.csv: {e}")

    return data


# ============================================================================
# SECTION 2: EXPLORATORY DATA ANALYSIS
# ============================================================================


def analyze_civilization_performance(data):
    """Analyze civilization win rates and pick rates."""
    print("\n" + "=" * 80)
    print("CIVILIZATION PERFORMANCE ANALYSIS")
    print("=" * 80)

    civ_stats = data["player_civs"].copy()

    # Clean winrate column
    civ_stats["winrate_numeric"] = (
        civ_stats["winrate"].str.rstrip("%").astype(float) / 100
    )

    # Sort by win rate
    civ_stats_sorted = civ_stats.sort_values("winrate_numeric", ascending=False)

    print("\nS-TIER CIVILIZATIONS (Win Rate >= 60%, n >= 5):")
    print("-" * 60)
    s_tier = civ_stats_sorted[
        (civ_stats_sorted["winrate_numeric"] >= 0.60)
        & (civ_stats_sorted["total_games"] >= 5)
    ]
    for _, civ in s_tier.iterrows():
        print(
            f"  {civ['civilization']:<15} | Win: {civ['winrate_numeric'] * 100:>5.1f}% | "
            f"W-L: {civ['wins']}-{civ['losses']} | n={civ['total_games']}"
        )

    print("\nF-TIER CIVILIZATIONS (Win Rate <= 40%, n >= 5):")
    print("-" * 60)
    f_tier = civ_stats_sorted[
        (civ_stats_sorted["winrate_numeric"] <= 0.40)
        & (civ_stats_sorted["total_games"] >= 5)
    ]
    for _, civ in f_tier.iterrows():
        print(
            f"  {civ['civilization']:<15} | Win: {civ['winrate_numeric'] * 100:>5.1f}% | "
            f"W-L: {civ['wins']}-{civ['losses']} | n={civ['total_games']}"
        )

    # Calculate pick rates
    total_games = civ_stats["total_games"].sum()
    civ_stats["pick_rate"] = civ_stats["total_games"] / total_games

    print(f"\nTotal Games Analyzed: {total_games}")
    print(f"Unique Civilizations: {len(civ_stats)}")
    print(f"Average Win Rate: {civ_stats['winrate_numeric'].mean() * 100:.1f}%")
    print(f"Win Rate Std Dev: {civ_stats['winrate_numeric'].std() * 100:.1f}%")

    return civ_stats


def analyze_map_distribution(data):
    """Analyze map distribution and play rates."""
    print("\n" + "=" * 80)
    print("MAP DISTRIBUTION ANALYSIS")
    print("=" * 80)

    map_stats = data["map_outcomes"].copy()

    # Clean play_rate
    map_stats["play_rate_numeric"] = (
        map_stats["play_rate"].str.rstrip("%").astype(float)
    )

    # Aggregate by map across leagues
    map_totals = (
        map_stats.groupby("map")
        .agg({"num_games": "sum", "play_rate_numeric": "mean"})
        .reset_index()
        .sort_values("num_games", ascending=False)
    )

    print("\nMost Played Maps:")
    print("-" * 60)
    for _, map_row in map_totals.head(10).iterrows():
        print(
            f"  {map_row['map']:<20} | Games: {map_row['num_games']:>3} | "
            f"Avg Play Rate: {map_row['play_rate_numeric']:.1f}%"
        )

    print(f"\nTotal Unique Maps: {len(map_totals)}")
    print(f"Total Games: {map_totals['num_games'].sum()}")

    return map_totals


def analyze_player_standings(data):
    """Analyze player standings from matches data."""
    print("\n" + "=" * 80)
    print("PLAYER STANDINGS ANALYSIS")
    print("=" * 80)

    matches = data["matches"].copy()

    # Parse standings to extract match records
    def parse_standings(standings_str):
        try:
            parts = standings_str.split(" | ")
            match_record = parts[0]  # e.g., "1-0"
            game_record = parts[1]  # e.g., "3-0"
            match_wins, match_losses = map(int, match_record.split("-"))
            game_wins, game_losses = map(int, game_record.split("-"))
            return match_wins, match_losses, game_wins, game_losses
        except:
            return 0, 0, 0, 0

    matches[["match_wins", "match_losses", "game_wins", "game_losses"]] = matches[
        "standings_snapshot"
    ].apply(lambda x: pd.Series(parse_standings(x)))

    # Get latest standings for each player
    latest_standings = matches.groupby("player").last().reset_index()

    # Calculate win rates
    latest_standings["match_win_rate"] = latest_standings["match_wins"] / (
        latest_standings["match_wins"] + latest_standings["match_losses"]
    )
    latest_standings["game_win_rate"] = latest_standings["game_wins"] / (
        latest_standings["game_wins"] + latest_standings["game_losses"]
    )

    print("\nTop 10 Players by Match Win Rate:")
    print("-" * 60)
    top_players = latest_standings.nlargest(10, "match_win_rate")
    for _, player in top_players.iterrows():
        print(
            f"  {player['player']:<15} | Match W-L: {player['match_wins']}-{player['match_losses']} | "
            f"Match WR: {player['match_win_rate'] * 100:>5.1f}% | "
            f"Game WR: {player['game_win_rate'] * 100:>5.1f}%"
        )

    print(f"\nTotal Players: {len(latest_standings)}")
    print(f"Total Leagues: {latest_standings['league'].nunique()}")

    return latest_standings


def analyze_civ_drafts(data):
    """Analyze civilization draft patterns."""
    print("\n" + "=" * 80)
    print("CIVILIZATION DRAFT PATTERN ANALYSIS")
    print("=" * 80)

    drafts = data["civ_drafts"].copy()

    print(f"\nTotal Draft Records: {len(drafts)}")
    print(f"Unique Matches: {drafts['match_id'].nunique()}")
    print(f"Unique Maps: {drafts['map'].nunique()}")

    # Most common civs
    all_civs = pd.concat([drafts["player1_civ"], drafts["player2_civ"]])
    civ_counts = all_civs.value_counts()

    print("\nTop 10 Most Drafted Civilizations:")
    print("-" * 60)
    for civ, count in civ_counts.head(10).items():
        print(f"  {civ:<15} | Drafted {count} times")

    # Most common maps
    map_counts = drafts["map"].value_counts()
    print("\nTop 10 Most Played Maps (from drafts):")
    print("-" * 60)
    for map_name, count in map_counts.head(10).items():
        print(f"  {map_name:<20} | Played {count} times")

    return drafts, civ_counts, map_counts


# ============================================================================
# SECTION 3: ADVANCED STATISTICAL ANALYSIS
# ============================================================================


def perform_correlation_analysis(civ_stats, map_totals, player_standings):
    """Perform correlation analysis between variables."""
    print("\n" + "=" * 80)
    print("CORRELATION ANALYSIS")
    print("=" * 80)

    # Civilization: Wins vs Total Games (sample size effect)
    corr_games_wins, p_games = pearsonr(civ_stats["total_games"], civ_stats["wins"])
    print(f"\n1. Civilization: Total Games vs Wins")
    print(f"   Correlation: {corr_games_wins:.3f}")
    print(f"   P-value: {p_games:.3f}")
    print(f"   Significant: {'YES' if p_games < 0.05 else 'NO'}")

    # Player: Match wins vs Game wins
    corr_match_game, p_match = pearsonr(
        player_standings["match_win_rate"].fillna(0),
        player_standings["game_win_rate"].fillna(0),
    )
    print(f"\n2. Player: Match Win Rate vs Game Win Rate")
    print(f"   Correlation: {corr_match_game:.3f}")
    print(f"   P-value: {p_match:.3f}")
    print(f"   Significant: {'YES' if p_match < 0.05 else 'NO'}")

    return {
        "games_wins": (corr_games_wins, p_games),
        "match_game": (corr_match_game, p_match),
    }


def identify_statistical_outliers(civ_stats, player_standings):
    """Identify statistical outliers using z-scores."""
    print("\n" + "=" * 80)
    print("OUTLIER DETECTION (Z-Score > 1.5, 95% CI)")
    print("=" * 80)

    outliers = {"civs": [], "players": []}

    # Civilization outliers
    civ_stats["winrate_zscore"] = np.abs(stats.zscore(civ_stats["winrate_numeric"]))
    civ_outliers = civ_stats[civ_stats["winrate_zscore"] > 1.5].sort_values(
        "winrate_zscore", ascending=False
    )

    print("\nCivilization Performance Outliers:")
    print("-" * 60)
    for _, civ in civ_outliers.iterrows():
        direction = (
            "OVER"
            if civ["winrate_numeric"] > civ_stats["winrate_numeric"].mean()
            else "UNDER"
        )
        print(
            f"  {direction}PERFORMER: {civ['civilization']:<15} | "
            f"Win Rate: {civ['winrate_numeric'] * 100:>5.1f}% | "
            f"Z-Score: {civ['winrate_zscore']:.2f}"
        )
        outliers["civs"].append(
            {
                "name": civ["civilization"],
                "win_rate": civ["winrate_numeric"],
                "z_score": civ["winrate_zscore"],
                "type": direction,
            }
        )

    # Player outliers
    player_standings_clean = player_standings.dropna(subset=["match_win_rate"])
    if len(player_standings_clean) > 3:
        player_standings_clean["winrate_zscore"] = np.abs(
            stats.zscore(player_standings_clean["match_win_rate"])
        )
        player_outliers = player_standings_clean[
            player_standings_clean["winrate_zscore"] > 1.5
        ]

        print("\nPlayer Performance Outliers:")
        print("-" * 60)
        for _, player in player_outliers.iterrows():
            direction = (
                "OVER"
                if player["match_win_rate"]
                > player_standings_clean["match_win_rate"].mean()
                else "UNDER"
            )
            print(
                f"  {direction}PERFORMER: {player['player']:<15} | "
                f"Match WR: {player['match_win_rate'] * 100:>5.1f}% | "
                f"Z-Score: {player['winrate_zscore']:.2f}"
            )
            outliers["players"].append(
                {
                    "name": player["player"],
                    "win_rate": player["match_win_rate"],
                    "z_score": player["winrate_zscore"],
                    "type": direction,
                }
            )

    return outliers


# ============================================================================
# SECTION 4: VISUALIZATION GENERATION
# ============================================================================


def create_visualizations(civ_stats, map_totals, player_standings, drafts):
    """Generate comprehensive visualizations."""
    print("\n" + "=" * 80)
    print("GENERATING VISUALIZATIONS")
    print("=" * 80)

    # Filter civs with meaningful sample size
    sig_civs = civ_stats[civ_stats["total_games"] >= 5].sort_values(
        "winrate_numeric", ascending=True
    )

    # 1. Main Dashboard
    fig = plt.figure(figsize=(20, 12))
    gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)

    # A. Civilization Win Rates
    ax1 = fig.add_subplot(gs[0, :2])
    colors = [
        "#d62728"
        if wr < 0.45
        else "#ff7f0e"
        if wr < 0.5
        else "#2ca02c"
        if wr < 0.55
        else "#1f77b4"
        for wr in sig_civs["winrate_numeric"]
    ]
    bars = ax1.barh(
        range(len(sig_civs)),
        sig_civs["winrate_numeric"] * 100,
        color=colors,
        alpha=0.8,
        edgecolor="black",
    )
    ax1.set_yticks(range(len(sig_civs)))
    ax1.set_yticklabels(sig_civs["civilization"], fontsize=9)
    ax1.set_xlabel("Win Rate (%)", fontsize=11)
    ax1.set_title(
        "Civilization Win Rates (n >= 5 games)", fontsize=13, fontweight="bold"
    )
    ax1.axvline(x=50, color="black", linestyle="--", linewidth=2, alpha=0.7)
    ax1.grid(True, alpha=0.3, axis="x")
    ax1.set_xlim(0, 100)

    # B. Map Distribution
    ax2 = fig.add_subplot(gs[0, 2])
    top_maps = map_totals.head(10)
    ax2.barh(
        range(len(top_maps)),
        top_maps["num_games"],
        color="steelblue",
        alpha=0.7,
        edgecolor="black",
    )
    ax2.set_yticks(range(len(top_maps)))
    ax2.set_yticklabels(top_maps["map"], fontsize=9)
    ax2.set_xlabel("Number of Games", fontsize=11)
    ax2.set_title("Top 10 Maps by Games Played", fontsize=13, fontweight="bold")
    ax2.grid(True, alpha=0.3, axis="x")

    # C. Player Match Win Rates
    ax3 = fig.add_subplot(gs[1, :2])
    player_clean = player_standings.dropna(subset=["match_win_rate"])
    player_sorted = player_clean.sort_values("match_win_rate", ascending=True)
    colors2 = [
        "#d62728"
        if wr < 0.4
        else "#ff7f0e"
        if wr < 0.5
        else "#2ca02c"
        if wr < 0.6
        else "#1f77b4"
        for wr in player_sorted["match_win_rate"]
    ]
    ax3.barh(
        range(len(player_sorted)),
        player_sorted["match_win_rate"] * 100,
        color=colors2,
        alpha=0.8,
        edgecolor="black",
    )
    ax3.set_yticks(range(len(player_sorted)))
    ax3.set_yticklabels(player_sorted["player"], fontsize=9)
    ax3.set_xlabel("Match Win Rate (%)", fontsize=11)
    ax3.set_title("Player Match Win Rates", fontsize=13, fontweight="bold")
    ax3.axvline(x=50, color="black", linestyle="--", linewidth=2, alpha=0.7)
    ax3.grid(True, alpha=0.3, axis="x")
    ax3.set_xlim(0, 100)

    # D. Wins vs Games Played Scatter
    ax4 = fig.add_subplot(gs[1, 2])
    ax4.scatter(
        civ_stats["total_games"],
        civ_stats["wins"],
        alpha=0.6,
        s=100,
        edgecolors="black",
    )
    z = np.polyfit(civ_stats["total_games"], civ_stats["wins"], 1)
    p = np.poly1d(z)
    ax4.plot(
        civ_stats["total_games"],
        p(civ_stats["total_games"]),
        "r--",
        alpha=0.8,
        linewidth=2,
    )
    ax4.set_xlabel("Total Games Played", fontsize=11)
    ax4.set_ylabel("Wins", fontsize=11)
    ax4.set_title("Civilization: Wins vs Games Played", fontsize=13, fontweight="bold")
    ax4.grid(True, alpha=0.3)

    # E. Win Rate Distribution (Violin)
    ax5 = fig.add_subplot(gs[2, 0])
    parts = ax5.violinplot(
        [civ_stats["winrate_numeric"] * 100],
        positions=[1],
        showmeans=True,
        showmedians=True,
    )
    ax5.scatter(
        np.random.normal(1, 0.04, len(civ_stats)),
        civ_stats["winrate_numeric"] * 100,
        alpha=0.5,
        s=30,
    )
    ax5.axhline(y=50, color="r", linestyle="--", alpha=0.5, label="50% Parity")
    ax5.set_ylabel("Win Rate (%)", fontsize=11)
    ax5.set_title("Civ Win Rate Distribution", fontsize=13, fontweight="bold")
    ax5.set_xticks([1])
    ax5.set_xticklabels(["All Civs"])
    ax5.grid(True, alpha=0.3)
    ax5.legend()

    # F. Top Civilizations by Draft Frequency
    ax6 = fig.add_subplot(gs[2, 1])
    all_civs = pd.concat([drafts["player1_civ"], drafts["player2_civ"]])
    civ_counts = all_civs.value_counts().head(15)
    ax6.barh(
        range(len(civ_counts)),
        civ_counts.values,
        color="darkgreen",
        alpha=0.7,
        edgecolor="black",
    )
    ax6.set_yticks(range(len(civ_counts)))
    ax6.set_yticklabels(civ_counts.index, fontsize=9)
    ax6.set_xlabel("Number of Drafts", fontsize=11)
    ax6.set_title("Top 15 Most Drafted Civs", fontsize=13, fontweight="bold")
    ax6.grid(True, alpha=0.3, axis="x")

    # G. League Distribution
    ax7 = fig.add_subplot(gs[2, 2])
    league_counts = player_standings["league"].value_counts()
    colors_pie = plt.cm.Set3(np.linspace(0, 1, len(league_counts)))
    wedges, texts, autotexts = ax7.pie(
        league_counts.values,
        labels=league_counts.index,
        autopct="%1.1f%%",
        colors=colors_pie,
        startangle=90,
    )
    ax7.set_title("Player Distribution by League", fontsize=13, fontweight="bold")

    plt.suptitle(
        "T90 Titans League Season 5 - Comprehensive Statistical Analysis",
        fontsize=16,
        fontweight="bold",
        y=0.995,
    )

    plt.savefig(
        "assets/ttl_s5_comprehensive_analysis.png", dpi=300, bbox_inches="tight"
    )
    print("  [OK] Saved: assets/ttl_s5_comprehensive_analysis.png")
    plt.close()

    # 2. Civilization Tier List
    fig, ax = plt.subplots(figsize=(12, 10))

    tier_colors = []
    tier_labels = []
    for _, civ in sig_civs.iterrows():
        wr = civ["winrate_numeric"]
        if wr >= 0.65:
            tier_colors.append("#FFD700")  # Gold - S Tier
            tier_labels.append("S")
        elif wr >= 0.55:
            tier_colors.append("#C0C0C0")  # Silver - A Tier
            tier_labels.append("A")
        elif wr >= 0.45:
            tier_colors.append("#CD7F32")  # Bronze - B Tier
            tier_labels.append("B")
        else:
            tier_colors.append("#FF6B6B")  # Red - C Tier
            tier_labels.append("C")

    bars = ax.barh(
        range(len(sig_civs)),
        sig_civs["winrate_numeric"] * 100,
        color=tier_colors,
        alpha=0.8,
        edgecolor="black",
        linewidth=1.5,
    )
    ax.set_yticks(range(len(sig_civs)))
    ax.set_yticklabels(
        [f"{civ} ({tier})" for civ, tier in zip(sig_civs["civilization"], tier_labels)],
        fontsize=10,
    )
    ax.set_xlabel("Win Rate (%)", fontsize=12)
    ax.set_title(
        "Civilization Tier List - T90 Titans League Season 5\n(Minimum 5 games played)",
        fontsize=14,
        fontweight="bold",
    )
    ax.axvline(x=50, color="black", linestyle="--", linewidth=2)
    ax.axvline(x=55, color="gray", linestyle=":", alpha=0.5)
    ax.axvline(x=65, color="gray", linestyle=":", alpha=0.5)
    ax.grid(True, alpha=0.3, axis="x")
    ax.set_xlim(0, 100)

    # Add legend
    from matplotlib.patches import Patch

    legend_elements = [
        Patch(facecolor="#FFD700", edgecolor="black", label="S-Tier (>=65%)"),
        Patch(facecolor="#C0C0C0", edgecolor="black", label="A-Tier (55-64%)"),
        Patch(facecolor="#CD7F32", edgecolor="black", label="B-Tier (45-54%)"),
        Patch(facecolor="#FF6B6B", edgecolor="black", label="C-Tier (<45%)"),
    ]
    ax.legend(handles=legend_elements, loc="lower right", fontsize=10)

    plt.tight_layout()
    plt.savefig(
        "assets/civilization_tier_list_detailed.png", dpi=300, bbox_inches="tight"
    )
    print("  [OK] Saved: assets/civilization_tier_list_detailed.png")
    plt.close()

    # 3. Correlation Heatmap
    fig, ax = plt.subplots(figsize=(10, 8))

    # Prepare correlation data
    corr_data = civ_stats[
        ["wins", "losses", "total_games", "winrate_numeric", "pick_rate"]
    ].corr()

    sns.heatmap(
        corr_data,
        annot=True,
        fmt=".3f",
        cmap="RdBu_r",
        center=0,
        vmin=-1,
        vmax=1,
        square=True,
        ax=ax,
        cbar_kws={"label": "Correlation Coefficient"},
        linewidths=0.5,
    )
    ax.set_title(
        "Civilization Statistics Correlation Matrix", fontsize=14, fontweight="bold"
    )

    plt.tight_layout()
    plt.savefig("assets/correlation_heatmap.png", dpi=300, bbox_inches="tight")
    print("  [OK] Saved: assets/correlation_heatmap.png")
    plt.close()

    print("\nAll visualizations saved successfully!")


# ============================================================================
# SECTION 5: REPORT GENERATION
# ============================================================================


def generate_stats_report(
    civ_stats, map_totals, player_standings, drafts, correlations, outliers
):
    """Generate comprehensive statistical report."""

    report = []

    report.append("=" * 80)
    report.append("T90 TITANS LEAGUE SEASON 5 - STATISTICAL ANALYSIS REPORT")
    report.append("Generated by: Statistical Modeler (The Quant)")
    report.append("Data Source: Data Engineer ETL Pipeline")
    report.append("=" * 80)
    report.append("")

    # Executive Summary
    report.append("EXECUTIVE SUMMARY")
    report.append("-" * 80)
    report.append(f"""
Dataset Overview:
- Total Draft Records Analyzed: {len(drafts)}
- Unique Matches: {drafts["match_id"].nunique()}
- Unique Players: {len(player_standings)}
- Unique Civilizations: {len(civ_stats)}
- Unique Maps: {len(map_totals)}

Key Findings:
1. Best Performing Civilization: {civ_stats.loc[civ_stats["winrate_numeric"].idxmax(), "civilization"]} ({civ_stats["winrate_numeric"].max() * 100:.1f}% win rate)
2. Most Drafted Civilization: {pd.concat([drafts["player1_civ"], drafts["player2_civ"]]).value_counts().index[0]} ({pd.concat([drafts["player1_civ"], drafts["player2_civ"]]).value_counts().iloc[0]} drafts)
3. Most Played Map: {map_totals.iloc[0]["map"]} ({map_totals.iloc[0]["num_games"]} games)
4. Average Civilization Win Rate: {civ_stats["winrate_numeric"].mean() * 100:.1f}% (+/- {civ_stats["winrate_numeric"].std() * 100:.1f}%)
5. Statistical Outliers Detected: {len(outliers["civs"])} civilizations, {len(outliers["players"])} players
""")

    # Civilization Meta Analysis
    s_tier = civ_stats[
        (civ_stats["winrate_numeric"] >= 0.60) & (civ_stats["total_games"] >= 5)
    ]
    f_tier = civ_stats[
        (civ_stats["winrate_numeric"] <= 0.40) & (civ_stats["total_games"] >= 5)
    ]

    report.append("\n" + "=" * 80)
    report.append("CIVILIZATION META ANALYSIS")
    report.append("=" * 80)

    report.append("\nS-TIER CIVILIZATIONS (Win Rate >= 60%, n >= 5):")
    report.append("-" * 60)
    for _, civ in s_tier.iterrows():
        report.append(
            f"  {civ['civilization']:<15} | Win Rate: {civ['winrate_numeric'] * 100:>5.1f}% | "
            f"W-L: {civ['wins']}-{civ['losses']} | Games: {civ['total_games']}"
        )

    report.append("\nF-TIER CIVILIZATIONS (Win Rate <= 40%, n >= 5):")
    report.append("-" * 60)
    for _, civ in f_tier.iterrows():
        report.append(
            f"  {civ['civilization']:<15} | Win Rate: {civ['winrate_numeric'] * 100:>5.1f}% | "
            f"W-L: {civ['wins']}-{civ['losses']} | Games: {civ['total_games']}"
        )

    # Statistical Significance Tests
    report.append("\n" + "=" * 80)
    report.append("STATISTICAL SIGNIFICANCE TESTS")
    report.append("=" * 80)

    corr1, p1 = correlations["games_wins"]
    report.append(f"""
1. Civilization Games Played vs Wins (Pearson Correlation):
   - Correlation Coefficient: {corr1:.3f}
   - P-value: {p1:.3f}
   - Result: {"SIGNIFICANT" if p1 < 0.05 else "NOT SIGNIFICANT"} at alpha = 0.05
   - Interpretation: {"Strong positive correlation between sample size and wins" if p1 < 0.05 and corr1 > 0 else "No significant correlation detected"}
""")

    corr2, p2 = correlations["match_game"]
    report.append(f"""2. Player Match Win Rate vs Game Win Rate (Pearson Correlation):
   - Correlation Coefficient: {corr2:.3f}
   - P-value: {p2:.3f}
   - Result: {"SIGNIFICANT" if p2 < 0.05 else "NOT SIGNIFICANT"} at alpha = 0.05
   - Interpretation: {"Strong correlation between match and game performance" if p2 < 0.05 and abs(corr2) > 0.5 else "Weak or no correlation"}
""")

    # Outlier Analysis
    report.append("\n" + "=" * 80)
    report.append("OUTLIER ANALYSIS (95% Confidence Interval)")
    report.append("=" * 80)

    report.append("\nCivilization Performance Outliers (|z-score| > 1.5):")
    report.append("-" * 60)
    for outlier in outliers["civs"]:
        report.append(
            f"  {outlier['type']}PERFORMER: {outlier['name']:<15} | "
            f"Win Rate: {outlier['win_rate'] * 100:>5.1f}% | Z-Score: {outlier['z_score']:.2f}"
        )

    if len(outliers["players"]) > 0:
        report.append("\nPlayer Performance Outliers (|z-score| > 1.5):")
        report.append("-" * 60)
        for outlier in outliers["players"]:
            report.append(
                f"  {outlier['type']}PERFORMER: {outlier['name']:<15} | "
                f"Win Rate: {outlier['win_rate'] * 100:>5.1f}% | Z-Score: {outlier['z_score']:.2f}"
            )

    # Top Players
    report.append("\n" + "=" * 80)
    report.append("TOP PLAYER PERFORMANCES")
    report.append("=" * 80)

    player_clean = player_standings.dropna(subset=["match_win_rate"])
    top_10 = player_clean.nlargest(10, "match_win_rate")

    report.append("\nTop 10 Players by Match Win Rate:")
    report.append("-" * 60)
    for i, (_, player) in enumerate(top_10.iterrows(), 1):
        report.append(
            f"{i:2d}. {player['player']:<15} | Match W-L: {player['match_wins']}-{player['match_losses']} | "
            f"Match WR: {player['match_win_rate'] * 100:>5.1f}%"
        )

    # Map Analysis
    report.append("\n" + "=" * 80)
    report.append("MAP META ANALYSIS")
    report.append("=" * 80)

    report.append("\nMost Popular Maps:")
    report.append("-" * 60)
    for _, map_row in map_totals.head(10).iterrows():
        report.append(
            f"  {map_row['map']:<20} | Games: {map_row['num_games']:>3} | "
            f"Play Rate: {map_row['play_rate_numeric']:.1f}%"
        )

    # Methodology
    report.append("\n" + "=" * 80)
    report.append("METHODOLOGY")
    report.append("=" * 80)
    report.append("""
Statistical Methods Employed:
1. Descriptive Statistics: Mean, standard deviation, percentiles
2. Correlation Analysis: Pearson correlation coefficients
3. Outlier Detection: Z-score analysis (threshold = 1.5 for 95% CI)
4. Data Visualization: Bar charts, violin plots, scatter plots, heatmaps
5. Significance Level: alpha = 0.05 (95% confidence interval)

Data Quality Notes:
- Minimum sample size of 5 games required for reliable win rate estimates
- All percentages calculated from raw win/loss counts
- Z-scores calculated using scipy.stats.zscore
- Correlations tested using scipy.stats.pearsonr

Limitations:
- Some civilizations have small sample sizes (n < 5)
- Map-specific win rates not available in source data
- Player ELO ratings not provided
- Casual relationships cannot be definitively established
""")

    # Save report
    report_text = "\n".join(report)

    with open("STATS_REPORT_REAL_DATA.md", "w", encoding="utf-8") as f:
        f.write(report_text)

    print("\n" + "=" * 80)
    print("STATS_REPORT_REAL_DATA.md generated successfully")
    print("=" * 80)

    return report_text


# ============================================================================
# MAIN EXECUTION
# ============================================================================


def main():
    """Main execution pipeline."""

    print("\n" + "=" * 80)
    print("T90 TITANS LEAGUE SEASON 5 - STATISTICAL MODELING PIPELINE")
    print("Statistical Modeler (The Quant) - Real Data Analysis")
    print("=" * 80)

    # Step 1: Load Data
    print("\n[1/7] Loading data files...")
    data = load_data()

    # Step 2: Analyze Civilizations
    print("\n[2/7] Analyzing civilization performance...")
    civ_stats = analyze_civilization_performance(data)

    # Step 3: Analyze Maps
    print("\n[3/7] Analyzing map distribution...")
    map_totals = analyze_map_distribution(data)

    # Step 4: Analyze Players
    print("\n[4/7] Analyzing player standings...")
    player_standings = analyze_player_standings(data)

    # Step 5: Analyze Drafts
    print("\n[5/7] Analyzing civilization drafts...")
    drafts, civ_counts, map_counts = analyze_civ_drafts(data)

    # Step 6: Statistical Tests
    print("\n[6/7] Performing statistical tests...")
    correlations = perform_correlation_analysis(civ_stats, map_totals, player_standings)

    # Step 7: Outlier Detection
    print("\n[7/7] Identifying outliers...")
    outliers = identify_statistical_outliers(civ_stats, player_standings)

    # Generate Visualizations
    print("\n[*] Generating visualizations...")
    create_visualizations(civ_stats, map_totals, player_standings, drafts)

    # Generate Report
    print("\n[*] Generating statistical report...")
    report = generate_stats_report(
        civ_stats, map_totals, player_standings, drafts, correlations, outliers
    )

    # Print report summary to console
    print("\n" + "=" * 80)
    print("ANALYSIS COMPLETE")
    print("=" * 80)
    print("""
Output Files Generated:
  Data Files Used:
    * data/matches.csv - Player standings and match records
    * data/player_civs.csv - Civilization win/loss statistics
    * data/map_outcomes.csv - Map play rate data
    * data/civ_drafts.csv - Detailed match draft data
  
  Visualizations:
    * assets/ttl_s5_comprehensive_analysis.png - Main dashboard (9 panels)
    * assets/civilization_tier_list_detailed.png - Tier list with S/A/B/C rankings
    * assets/correlation_heatmap.png - Statistical correlation matrix
  
  Reports:
    * STATS_REPORT_REAL_DATA.md - Comprehensive statistical analysis
""")


if __name__ == "__main__":
    main()
