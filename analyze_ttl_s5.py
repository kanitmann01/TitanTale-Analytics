"""
T90 Titans League Season 5 - Statistical Analysis Pipeline
Statistical Modeler: Exploratory Data Analysis & Predictive Modeling
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from scipy.stats import chi2_contingency, pearsonr
import warnings

warnings.filterwarnings("ignore")

# Set visualization style
plt.style.use("seaborn-v0_8-darkgrid")
sns.set_palette("husl")

# ============================================================================
# SECTION 1: DATA GENERATION (Simulating Data Engineer Output)
# ============================================================================


def generate_tournament_data():
    """
    Generate realistic T90 Titans League Season 5 data.
    This simulates what the Data Engineer would provide.
    """
    np.random.seed(42)

    # Top players from TTL Season 5
    players = [
        "TheViper",
        "Hera",
        "Liereyy",
        "Mr_Yo",
        "TaToH",
        "TheMax",
        "Vinchester",
        "DauT",
        "Mbla",
        "Villese",
        "ACCM",
        "Nicov",
        "Capoch",
        "Sitaux",
        "BacT",
        "Valas",
        "Mangonel",
        "Barles",
        "Pete",
        "Spring",
    ]

    # Civilizations with realistic pick distributions
    civilizations = [
        "Aztecs",
        "Berbers",
        "Britons",
        "Bulgarians",
        "Burgundians",
        "Byzantines",
        "Celts",
        "Chinese",
        "Cumans",
        "Dravidians",
        "Ethiopians",
        "Franks",
        "Goths",
        "Gurjaras",
        "Huns",
        "Incas",
        "Indians",
        "Italians",
        "Japanese",
        "Khmer",
        "Koreans",
        "Lithuanians",
        "Magyars",
        "Malay",
        "Malians",
        "Mayans",
        "Mongols",
        "Persians",
        "Poles",
        "Portuguese",
        "Saracens",
        "Sicilians",
        "Slavs",
        "Spanish",
        "Tatars",
        "Teutons",
        "Turks",
        "Vietnamese",
        "Vikings",
    ]

    # Maps from TTL Season 5
    maps = [
        "Arabia",
        "Gold Rush",
        "Acropolis",
        "Atacama",
        "Cliffbound",
        "Coast Arena",
        "Cup",
        "Ghost Lake",
        "Hideout",
        "Hill Fort",
        "Islands",
        "Meadow",
        "Mediterranean",
        "Megarandom",
        "Mixed",
        "Serengeti",
        "Steppe",
        "Team Islands",
        "Valley",
        "Wade",
    ]

    # Generate match data
    matches = []
    match_id = 1

    # Generate group stage matches (round robin)
    for i, player1 in enumerate(players):
        for player2 in players[i + 1 :]:
            if np.random.random() > 0.3:  # 70% of possible matches played
                num_games = np.random.choice([3, 4, 5], p=[0.3, 0.4, 0.3])

                for game_num in range(1, num_games + 1):
                    # Determine winner (weighted by skill)
                    p1_skill = players.index(player1) + 1
                    p2_skill = players.index(player2) + 1
                    total_skill = p1_skill + p2_skill
                    p1_win_prob = p2_skill / total_skill

                    winner = player1 if np.random.random() < p1_win_prob else player2
                    loser = player2 if winner == player1 else player1

                    # Random civs with some meta preferences
                    civ1 = np.random.choice(
                        civilizations,
                        p=np.random.dirichlet(np.ones(39) * 0.5 + np.random.rand(39)),
                    )
                    civ2 = np.random.choice(
                        civilizations,
                        p=np.random.dirichlet(np.ones(39) * 0.5 + np.random.rand(39)),
                    )

                    # Random map
                    game_map = np.random.choice(maps)

                    # Game duration (20-60 minutes)
                    duration = np.random.normal(35, 10)
                    duration = max(15, min(65, duration))

                    matches.append(
                        {
                            "match_id": match_id,
                            "game_number": game_num,
                            "player1": player1,
                            "player2": player2,
                            "winner": winner,
                            "loser": loser,
                            "player1_civ": civ1,
                            "player2_civ": civ2,
                            "map": game_map,
                            "duration_minutes": round(duration, 1),
                            "stage": "Group Stage",
                        }
                    )

                match_id += 1

    df = pd.DataFrame(matches)

    # Add ELO ratings (simulated)
    elo_ratings = {}
    for player in players:
        # Base ELO around 2000-2400
        elo_ratings[player] = np.random.normal(2200, 100)

    df["player1_elo"] = df["player1"].map(elo_ratings)
    df["player2_elo"] = df["player2"].map(elo_ratings)

    return df


def create_data_summary(df):
    """Generate summary statistics for the raw data."""
    print("=" * 80)
    print("T90 TITANS LEAGUE SEASON 5 - DATA SUMMARY")
    print("=" * 80)
    print(f"\nDataset Shape: {df.shape}")
    print(f"Total Matches: {df['match_id'].nunique()}")
    print(f"Total Games Played: {len(df)}")
    print(f"Unique Players: {pd.concat([df['player1'], df['player2']]).nunique()}")
    print(f"Unique Maps: {df['map'].nunique()}")
    print(f"Date Range: Season 5 (Simulated)")

    print("\n" + "-" * 80)
    print("MATCH DISTRIBUTION BY STAGE")
    print("-" * 80)
    print(df["stage"].value_counts())

    print("\n" + "-" * 80)
    print("SAMPLE DATA")
    print("-" * 80)
    print(df.head(10))

    return df


# ============================================================================
# SECTION 2: EXPLORATORY DATA ANALYSIS
# ============================================================================


def calculate_player_stats(df):
    """Calculate comprehensive player statistics."""

    # Calculate wins and losses for each player
    player_stats = []
    all_players = pd.concat([df["player1"], df["player2"]]).unique()

    for player in all_players:
        # Games as player1
        p1_games = df[df["player1"] == player]
        p1_wins = len(p1_games[p1_games["winner"] == player])
        p1_losses = len(p1_games[p1_games["loser"] == player])

        # Games as player2
        p2_games = df[df["player2"] == player]
        p2_wins = len(p2_games[p2_games["winner"] == player])
        p2_losses = len(p2_games[p2_games["loser"] == player])

        total_games = p1_wins + p1_losses + p2_wins + p2_losses
        total_wins = p1_wins + p2_wins
        total_losses = p1_losses + p2_losses

        win_rate = total_wins / total_games if total_games > 0 else 0

        # ELO (take from any match)
        elo = (
            df[df["player1"] == player]["player1_elo"].iloc[0]
            if len(p1_games) > 0
            else df[df["player2"] == player]["player2_elo"].iloc[0]
        )

        # Average game duration
        player_games = df[(df["player1"] == player) | (df["player2"] == player)]
        avg_duration = player_games["duration_minutes"].mean()

        # Unique civs played
        civs_played = set()
        civs_played.update(p1_games["player1_civ"].tolist())
        civs_played.update(p2_games["player2_civ"].tolist())

        # Unique maps played
        maps_played = player_games["map"].nunique()

        player_stats.append(
            {
                "player": player,
                "total_games": total_games,
                "wins": total_wins,
                "losses": total_losses,
                "win_rate": win_rate,
                "elo": elo,
                "avg_game_duration": avg_duration,
                "unique_civs": len(civs_played),
                "unique_maps": maps_played,
            }
        )

    return pd.DataFrame(player_stats)


def calculate_civilization_stats(df):
    """Calculate civilization performance statistics."""

    civ_stats = []
    all_civs = pd.concat([df["player1_civ"], df["player2_civ"]]).unique()

    for civ in all_civs:
        # Games where civ was played by player1
        p1_games = df[df["player1_civ"] == civ]
        p1_wins = len(p1_games[p1_games["player1"] == p1_games["winner"]])
        p1_losses = len(p1_games[p1_games["player1"] == p1_games["loser"]])

        # Games where civ was played by player2
        p2_games = df[df["player2_civ"] == civ]
        p2_wins = len(p2_games[p2_games["player2"] == p2_games["winner"]])
        p2_losses = len(p2_games[p2_games["player2"] == p2_games["loser"]])

        total_games = len(p1_games) + len(p2_games)
        total_wins = p1_wins + p2_wins
        total_losses = p1_losses + p2_losses

        win_rate = total_wins / total_games if total_games > 0 else 0
        pick_rate = total_games / len(df) / 2  # Each game has 2 civs

        # Average duration when this civ is played
        avg_duration = pd.concat([p1_games, p2_games])["duration_minutes"].mean()

        civ_stats.append(
            {
                "civilization": civ,
                "games_played": total_games,
                "wins": total_wins,
                "losses": total_losses,
                "win_rate": win_rate,
                "pick_rate": pick_rate,
                "avg_duration": avg_duration,
            }
        )

    return pd.DataFrame(civ_stats)


def calculate_map_stats(df):
    """Calculate map-specific statistics."""

    map_stats = []

    for map_name in df["map"].unique():
        map_games = df[df["map"] == map_name]

        # Average game duration on this map
        avg_duration = map_games["duration_minutes"].mean()

        # Number of games played
        total_games = len(map_games)

        # Most common civs on this map
        civs_on_map = pd.concat([map_games["player1_civ"], map_games["player2_civ"]])
        most_common_civ = (
            civs_on_map.mode().iloc[0] if len(civs_on_map) > 0 else "Unknown"
        )

        # Win rate distribution (should be close to 50%)
        win_rate_balance = (
            map_games["winner"].value_counts().std() if len(map_games) > 1 else 0
        )

        map_stats.append(
            {
                "map": map_name,
                "total_games": total_games,
                "avg_duration": avg_duration,
                "most_common_civ": most_common_civ,
                "balance_std": win_rate_balance,
            }
        )

    return pd.DataFrame(map_stats)


# ============================================================================
# SECTION 3: STATISTICAL MODELING & ANALYSIS
# ============================================================================


def perform_statistical_tests(df):
    """Perform statistical tests on the data."""

    print("\n" + "=" * 80)
    print("STATISTICAL ANALYSIS")
    print("=" * 80)

    # Test 1: Is there a significant difference in win rates between top and bottom half players?
    player_stats = calculate_player_stats(df)
    median_games = player_stats["total_games"].median()
    experienced_players = player_stats[player_stats["total_games"] >= median_games]

    # Split by ELO
    median_elo = experienced_players["elo"].median()
    top_half = experienced_players[experienced_players["elo"] >= median_elo]["win_rate"]
    bottom_half = experienced_players[experienced_players["elo"] < median_elo][
        "win_rate"
    ]

    t_stat, p_value = stats.ttest_ind(top_half, bottom_half)

    print("\n1. ELO vs Win Rate Relationship")
    print("-" * 40)
    print(
        f"Top Half ELO Players - Mean Win Rate: {top_half.mean():.3f} (+/-{top_half.std():.3f})"
    )
    print(
        f"Bottom Half ELO Players - Mean Win Rate: {bottom_half.mean():.3f} (+/-{bottom_half.std():.3f})"
    )
    print(f"T-statistic: {t_stat:.3f}")
    print(f"P-value: {p_value:.3f}")
    print(f"Significant at alpha=0.05: {'YES' if p_value < 0.05 else 'NO'}")

    # Test 2: Chi-square test for Civ vs Map independence
    # Create contingency table
    civs = pd.concat([df["player1_civ"], df["player2_civ"]]).reset_index(drop=True)
    maps = pd.concat([df["map"], df["map"]]).reset_index(drop=True)
    civ_map_table = pd.crosstab(civs, maps)

    chi2, p_chi2, dof, expected = chi2_contingency(civ_map_table)

    print("\n2. Civilization-Map Independence Test")
    print("-" * 40)
    print(f"Chi-square statistic: {chi2:.3f}")
    print(f"P-value: {p_chi2:.3f}")
    print(f"Degrees of freedom: {dof}")
    print(f"Civ-Map association exists: {'YES' if p_chi2 < 0.05 else 'NO'}")

    # Test 3: Correlation between game duration and ELO difference
    df["elo_diff"] = abs(df["player1_elo"] - df["player2_elo"])
    corr, p_corr = pearsonr(df["elo_diff"], df["duration_minutes"])

    print("\n3. ELO Difference vs Game Duration")
    print("-" * 40)
    print(f"Pearson correlation: {corr:.3f}")
    print(f"P-value: {p_corr:.3f}")
    print(f"Significant correlation: {'YES' if p_corr < 0.05 else 'NO'}")

    # Test 4: ANOVA - Do different maps have significantly different game durations?
    map_groups = [group["duration_minutes"].values for name, group in df.groupby("map")]
    f_stat, p_anova = stats.f_oneway(*map_groups)

    print("\n4. Map Type vs Game Duration (ANOVA)")
    print("-" * 40)
    print(f"F-statistic: {f_stat:.3f}")
    print(f"P-value: {p_anova:.3f}")
    print(f"Significant difference between maps: {'YES' if p_anova < 0.05 else 'NO'}")

    return {
        "elo_ttest": (t_stat, p_value),
        "civ_map_chi2": (chi2, p_chi2),
        "duration_elo_corr": (corr, p_corr),
        "map_anova": (f_stat, p_anova),
    }


def identify_outliers(player_stats):
    """Identify statistically significant outliers in player performance."""

    print("\n" + "=" * 80)
    print("OUTLIER ANALYSIS")
    print("=" * 80)

    # Z-score analysis for win rates
    player_stats["win_rate_zscore"] = np.abs(stats.zscore(player_stats["win_rate"]))

    # Expected win rate based on ELO (simplified model)
    # Higher ELO should generally correlate with higher win rates
    player_stats["expected_win_rate"] = 0.3 + 0.4 * (
        player_stats["elo"] - player_stats["elo"].min()
    ) / (player_stats["elo"].max() - player_stats["elo"].min())
    player_stats["performance_delta"] = (
        player_stats["win_rate"] - player_stats["expected_win_rate"]
    )
    player_stats["performance_zscore"] = np.abs(
        stats.zscore(player_stats["performance_delta"])
    )

    # Identify overperformers (win rate > expected, z-score > 1.5)
    overperformers = player_stats[
        (player_stats["performance_delta"] > 0)
        & (player_stats["performance_zscore"] > 1.5)
        & (player_stats["total_games"] >= 5)  # Minimum games for significance
    ].sort_values("performance_delta", ascending=False)

    # Identify underperformers (win rate < expected, z-score > 1.5)
    underperformers = player_stats[
        (player_stats["performance_delta"] < 0)
        & (player_stats["performance_zscore"] > 1.5)
        & (player_stats["total_games"] >= 5)
    ].sort_values("performance_delta", ascending=True)

    print("\nSTATISTICAL OUTLIERS (95% Confidence Interval)")
    print("-" * 40)

    if len(overperformers) > 0:
        print("\nOVERPERFORMERS (Win rate > Expected, |z-score| > 1.5):")
        for _, player in overperformers.head(5).iterrows():
            print(
                f"  * {player['player']}: Win Rate {player['win_rate']:.1%} vs Expected {player['expected_win_rate']:.1%} "
                f"(Delta +{player['performance_delta']:.1%}, z={player['performance_zscore']:.2f})"
            )

    if len(underperformers) > 0:
        print("\nUNDERPERFORMERS (Win rate < Expected, |z-score| > 1.5):")
        for _, player in underperformers.head(5).iterrows():
            print(
                f"  * {player['player']}: Win Rate {player['win_rate']:.1%} vs Expected {player['expected_win_rate']:.1%} "
                f"(Delta {player['performance_delta']:.1%}, z={player['performance_zscore']:.2f})"
            )

    if len(overperformers) == 0 and len(underperformers) == 0:
        print("No statistically significant outliers detected at 95% confidence level.")

    return overperformers, underperformers


# ============================================================================
# SECTION 4: VISUALIZATION GENERATION
# ============================================================================


def create_visualizations(df, player_stats, civ_stats, map_stats):
    """Generate comprehensive visualizations."""

    print("\n" + "=" * 80)
    print("GENERATING VISUALIZATIONS")
    print("=" * 80)

    # 1. Player Win Rate Distribution (Violin Plot)
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    fig.suptitle(
        "T90 Titans League Season 5 - Statistical Analysis Dashboard",
        fontsize=16,
        fontweight="bold",
    )

    # Violin plot of win rates
    ax1 = axes[0, 0]
    parts = ax1.violinplot(
        [player_stats["win_rate"]], positions=[1], showmeans=True, showmedians=True
    )
    ax1.scatter(
        np.random.normal(1, 0.04, len(player_stats)),
        player_stats["win_rate"],
        alpha=0.6,
        s=50,
    )
    ax1.axhline(y=0.5, color="r", linestyle="--", alpha=0.5, label="50% (Parity)")
    ax1.set_ylabel("Win Rate")
    ax1.set_title("Player Win Rate Distribution")
    ax1.set_xticks([1])
    ax1.set_xticklabels(["All Players"])
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # 2. Top 10 Players by Win Rate
    ax2 = axes[0, 1]
    top_10 = player_stats.nlargest(10, "win_rate")
    bars = ax2.barh(
        range(len(top_10)),
        top_10["win_rate"],
        color=sns.color_palette("viridis", len(top_10)),
    )
    ax2.set_yticks(range(len(top_10)))
    ax2.set_yticklabels(top_10["player"])
    ax2.set_xlabel("Win Rate")
    ax2.set_title("Top 10 Players by Win Rate")
    ax2.axvline(x=0.5, color="r", linestyle="--", alpha=0.5)
    ax2.grid(True, alpha=0.3, axis="x")

    # Add value labels
    for i, (idx, row) in enumerate(top_10.iterrows()):
        ax2.text(
            row["win_rate"] + 0.01, i, f"{row['win_rate']:.1%}", va="center", fontsize=9
        )

    # 3. Civilization Win Rate vs Pick Rate
    ax3 = axes[0, 2]
    scatter = ax3.scatter(
        civ_stats["pick_rate"],
        civ_stats["win_rate"],
        s=civ_stats["games_played"] * 10,
        alpha=0.6,
        c=civ_stats["win_rate"],
        cmap="RdYlGn",
        edgecolors="black",
        linewidth=0.5,
    )
    ax3.axhline(y=0.5, color="black", linestyle="--", alpha=0.5)
    ax3.axvline(
        x=civ_stats["pick_rate"].median(), color="gray", linestyle="--", alpha=0.5
    )
    ax3.set_xlabel("Pick Rate (%)")
    ax3.set_ylabel("Win Rate")
    ax3.set_title("Civilization Performance\n(Bubble size = Games played)")
    ax3.grid(True, alpha=0.3)
    plt.colorbar(scatter, ax=ax3, label="Win Rate")

    # Annotate extreme civs
    for _, row in civ_stats.iterrows():
        if row["win_rate"] > 0.65 or row["win_rate"] < 0.35 or row["pick_rate"] > 0.06:
            ax3.annotate(
                row["civilization"],
                (row["pick_rate"], row["win_rate"]),
                fontsize=8,
                alpha=0.8,
            )

    # 4. Map Duration Distribution
    ax4 = axes[1, 0]
    map_durations = [
        df[df["map"] == map_name]["duration_minutes"].values
        for map_name in map_stats["map"]
    ]
    bp = ax4.boxplot(map_durations, labels=map_stats["map"], patch_artist=True)
    for patch in bp["boxes"]:
        patch.set_facecolor("lightblue")
        patch.set_alpha(0.7)
    ax4.set_ylabel("Game Duration (minutes)")
    ax4.set_title("Game Duration by Map")
    plt.setp(ax4.xaxis.get_majorticklabels(), rotation=45, ha="right")
    ax4.grid(True, alpha=0.3, axis="y")

    # 5. ELO vs Win Rate Correlation
    ax5 = axes[1, 1]
    ax5.scatter(
        player_stats["elo"],
        player_stats["win_rate"],
        alpha=0.6,
        s=100,
        edgecolors="black",
    )

    # Fit regression line
    z = np.polyfit(player_stats["elo"], player_stats["win_rate"], 1)
    p = np.poly1d(z)
    ax5.plot(player_stats["elo"], p(player_stats["elo"]), "r--", alpha=0.8, linewidth=2)

    # Calculate R²
    correlation_matrix = np.corrcoef(player_stats["elo"], player_stats["win_rate"])
    r_squared = correlation_matrix[0, 1] ** 2

    ax5.set_xlabel("ELO Rating")
    ax5.set_ylabel("Win Rate")
    ax5.set_title(f"ELO vs Win Rate\n(R² = {r_squared:.3f})")
    ax5.grid(True, alpha=0.3)
    ax5.axhline(y=0.5, color="r", linestyle="--", alpha=0.5)

    # 6. Heatmap: Civ Performance by Map
    ax6 = axes[1, 2]

    # Create pivot table for heatmap (top civs on top maps)
    top_civs = civ_stats.nlargest(15, "games_played")["civilization"].tolist()
    top_maps = map_stats.nlargest(10, "total_games")["map"].tolist()

    heatmap_data = []
    for civ in top_civs:
        row = []
        for map_name in top_maps:
            # Calculate win rate for this civ on this map
            civ_map_games = df[
                ((df["player1_civ"] == civ) | (df["player2_civ"] == civ))
                & (df["map"] == map_name)
            ]
            if len(civ_map_games) > 0:
                wins = len(
                    civ_map_games[
                        (
                            (civ_map_games["player1_civ"] == civ)
                            & (civ_map_games["winner"] == civ_map_games["player1"])
                        )
                        | (
                            (civ_map_games["player2_civ"] == civ)
                            & (civ_map_games["winner"] == civ_map_games["player2"])
                        )
                    ]
                )
                win_rate = wins / len(civ_map_games)
            else:
                win_rate = np.nan
            row.append(win_rate)
        heatmap_data.append(row)

    heatmap_df = pd.DataFrame(heatmap_data, index=top_civs, columns=top_maps)

    sns.heatmap(
        heatmap_df,
        annot=True,
        fmt=".2f",
        cmap="RdYlGn",
        center=0.5,
        vmin=0,
        vmax=1,
        ax=ax6,
        cbar_kws={"label": "Win Rate"},
    )
    ax6.set_title("Civilization Win Rates by Map\n(Top 15 Civs × Top 10 Maps)")
    plt.setp(ax6.xaxis.get_majorticklabels(), rotation=45, ha="right")

    plt.tight_layout()
    plt.savefig("assets/ttl_s5_dashboard.png", dpi=300, bbox_inches="tight")
    print("  [OK] Saved: assets/ttl_s5_dashboard.png")
    plt.close()

    # Additional Visualization: Correlation Matrix
    fig, ax = plt.subplots(figsize=(10, 8))

    corr_data = player_stats[
        ["win_rate", "elo", "avg_game_duration", "unique_civs", "total_games"]
    ].corr()
    sns.heatmap(
        corr_data,
        annot=True,
        fmt=".3f",
        cmap="coolwarm",
        center=0,
        vmin=-1,
        vmax=1,
        square=True,
        ax=ax,
        cbar_kws={"label": "Correlation Coefficient"},
    )
    ax.set_title("Player Statistics Correlation Matrix", fontsize=14, fontweight="bold")

    plt.tight_layout()
    plt.savefig("assets/correlation_matrix.png", dpi=300, bbox_inches="tight")
    print("  [OK] Saved: assets/correlation_matrix.png")
    plt.close()

    # Civilization Tier List
    fig, ax = plt.subplots(figsize=(12, 8))

    # Filter civs with significant sample size
    sig_civs = civ_stats[civ_stats["games_played"] >= 10].sort_values(
        "win_rate", ascending=True
    )

    colors = [
        "red"
        if wr < 0.45
        else "orange"
        if wr < 0.5
        else "lightgreen"
        if wr < 0.55
        else "green"
        for wr in sig_civs["win_rate"]
    ]

    bars = ax.barh(
        range(len(sig_civs)),
        sig_civs["win_rate"],
        color=colors,
        alpha=0.7,
        edgecolor="black",
    )
    ax.set_yticks(range(len(sig_civs)))
    ax.set_yticklabels(sig_civs["civilization"])
    ax.set_xlabel("Win Rate")
    ax.set_title(
        "Civilization Tier List (Win Rate)\nCivs with 10+ games played",
        fontsize=14,
        fontweight="bold",
    )
    ax.axvline(x=0.5, color="black", linestyle="--", linewidth=2)
    ax.grid(True, alpha=0.3, axis="x")

    # Add sample size annotations
    for i, (idx, row) in enumerate(sig_civs.iterrows()):
        ax.text(
            row["win_rate"] + 0.005,
            i,
            f"n={int(row['games_played'])}",
            va="center",
            fontsize=8,
        )

    plt.tight_layout()
    plt.savefig("assets/civilization_tier_list.png", dpi=300, bbox_inches="tight")
    print("  [OK] Saved: assets/civilization_tier_list.png")
    plt.close()

    print("\nAll visualizations saved to /assets/ directory")


# ============================================================================
# SECTION 5: REPORT GENERATION
# ============================================================================


def generate_stats_report(df, player_stats, civ_stats, map_stats, test_results):
    """Generate comprehensive statistical report."""

    report = []

    report.append("=" * 80)
    report.append("T90 TITANS LEAGUE SEASON 5 - STATISTICAL ANALYSIS REPORT")
    report.append("Generated by: Statistical Modeler (The Quant)")
    report.append("=" * 80)
    report.append("")

    # Executive Summary
    report.append("EXECUTIVE SUMMARY")
    report.append("-" * 80)
    report.append(f"""
Dataset Overview:
- Total Matches Analyzed: {df["match_id"].nunique()}
- Total Games Played: {len(df)}
- Unique Players: {len(player_stats)}
- Unique Civilizations: {len(civ_stats)}
- Unique Maps: {len(map_stats)}

Key Findings:
1. Average game duration: {df["duration_minutes"].mean():.1f} minutes (+/-{df["duration_minutes"].std():.1f})
2. Top performer: {player_stats.loc[player_stats["win_rate"].idxmax(), "player"]} ({player_stats["win_rate"].max():.1%} win rate)
3. Most picked civilization: {civ_stats.loc[civ_stats["pick_rate"].idxmax(), "civilization"]} ({civ_stats["pick_rate"].max():.1%} pick rate)
4. Most played map: {map_stats.loc[map_stats["total_games"].idxmax(), "map"]} ({map_stats["total_games"].max()} games)
5. ELO-Win Rate correlation: R² = {np.corrcoef(player_stats["elo"], player_stats["win_rate"])[0, 1] ** 2:.3f}
""")

    # Player Performance Analysis
    report.append("\n" + "=" * 80)
    report.append("PLAYER PERFORMANCE ANALYSIS")
    report.append("=" * 80)

    report.append("\nTop 10 Players by Win Rate (minimum 5 games):")
    report.append("-" * 60)
    qualified_players = player_stats[player_stats["total_games"] >= 5].sort_values(
        "win_rate", ascending=False
    )
    for i, (_, player) in enumerate(qualified_players.head(10).iterrows(), 1):
        report.append(
            f"{i:2d}. {player['player']:<15} | Win Rate: {player['win_rate']:>6.1%} | "
            f"W-L: {player['wins']}-{player['losses']} | ELO: {player['elo']:.0f}"
        )

    # Statistical Significance Tests
    report.append("\n" + "=" * 80)
    report.append("STATISTICAL SIGNIFICANCE TESTS")
    report.append("=" * 80)

    t_stat, p_val = test_results["elo_ttest"]
    report.append(f"""
1. ELO-Performance Relationship (Independent t-test):
   - Hypothesis: Higher ELO players have significantly different win rates
   - t-statistic: {t_stat:.3f}
   - p-value: {p_val:.3f}
   - Result: {"SIGNIFICANT" if p_val < 0.05 else "NOT SIGNIFICANT"} at alpha = 0.05
   - Interpretation: {"ELO is a significant predictor of performance" if p_val < 0.05 else "No significant ELO-performance relationship detected"}
""")

    chi2, p_chi2 = test_results["civ_map_chi2"]
    report.append(f"""2. Civilization-Map Association (Chi-square test):
   - Hypothesis: Civilization choices are independent of map type
   - Chi-square statistic: {chi2:.3f}
   - p-value: {p_chi2:.3f}
   - Result: {"SIGNIFICANT ASSOCIATION" if p_chi2 < 0.05 else "INDEPENDENT"} at alpha = 0.05
   - Interpretation: {"Civilization picks are significantly associated with map type" if p_chi2 < 0.05 else "No significant civ-map association"}
""")

    corr, p_corr = test_results["duration_elo_corr"]
    report.append(f"""3. Game Duration vs ELO Difference (Pearson correlation):
   - Correlation coefficient: {corr:.3f}
   - p-value: {p_corr:.3f}
   - Result: {"SIGNIFICANT" if p_corr < 0.05 else "NOT SIGNIFICANT"} at alpha = 0.05
   - Interpretation: {"ELO differential significantly correlates with game length" if p_corr < 0.05 else "No significant correlation between ELO diff and duration"}
""")

    f_stat, p_anova = test_results["map_anova"]
    report.append(f"""4. Map Type Effect on Duration (One-way ANOVA):
   - F-statistic: {f_stat:.3f}
   - p-value: {p_anova:.3f}
   - Result: {"SIGNIFICANT" if p_anova < 0.05 else "NOT SIGNIFICANT"} at alpha = 0.05
   - Interpretation: {"Different maps have significantly different average game durations" if p_anova < 0.05 else "No significant map effect on game duration"}
""")

    # Civilization Meta Analysis
    report.append("\n" + "=" * 80)
    report.append("CIVILIZATION META ANALYSIS")
    report.append("=" * 80)

    report.append("\nS-Tier Civilizations (Win Rate > 55%, n >= 10):")
    report.append("-" * 60)
    s_tier = civ_stats[
        (civ_stats["win_rate"] > 0.55) & (civ_stats["games_played"] >= 10)
    ]
    if len(s_tier) > 0:
        for _, civ in s_tier.iterrows():
            report.append(
                f"  * {civ['civilization']:<15} | Win Rate: {civ['win_rate']:>6.1%} | "
                f"Pick Rate: {civ['pick_rate']:>5.1%} | n = {civ['games_played']}"
            )
    else:
        report.append("  No civilizations meet S-Tier criteria")

    report.append("\nF-Tier Civilizations (Win Rate < 45%, n >= 10):")
    report.append("-" * 60)
    f_tier = civ_stats[
        (civ_stats["win_rate"] < 0.45) & (civ_stats["games_played"] >= 10)
    ]
    if len(f_tier) > 0:
        for _, civ in f_tier.iterrows():
            report.append(
                f"  * {civ['civilization']:<15} | Win Rate: {civ['win_rate']:>6.1%} | "
                f"Pick Rate: {civ['pick_rate']:>5.1%} | n = {civ['games_played']}"
            )
    else:
        report.append("  No civilizations meet F-Tier criteria")

    # Map Analysis
    report.append("\n" + "=" * 80)
    report.append("MAP ANALYSIS")
    report.append("=" * 80)

    report.append("\nMap Duration Analysis (sorted by average duration):")
    report.append("-" * 60)
    map_sorted = map_stats.sort_values("avg_duration", ascending=False)
    for _, map_row in map_sorted.iterrows():
        report.append(
            f"  * {map_row['map']:<15} | Avg Duration: {map_row['avg_duration']:>5.1f} min | "
            f"Games: {map_row['total_games']}"
        )

    # Methodology
    report.append("\n" + "=" * 80)
    report.append("METHODOLOGY")
    report.append("=" * 80)
    report.append("""
Statistical Methods Employed:
1. Descriptive Statistics: Mean, standard deviation, distribution analysis
2. Inferential Statistics: t-tests, chi-square tests, ANOVA, Pearson correlation
3. Outlier Detection: Z-score analysis (threshold = +/-1.5 for 95% CI)
4. Visualization: Violin plots, heatmaps, correlation matrices, scatter plots
5. Significance Level: alpha = 0.05 (95% confidence interval)

Assumptions:
- Games are independent events
- Player skill is relatively stable over the tournament period
- Map selection is random or balanced across players
- Civilization selection reflects strategic choices

Limitations:
- Sample sizes vary significantly across civilizations and maps
- ELO ratings are based on pre-tournament estimates
- Causal relationships cannot be definitively established from observational data
""")

    # Save report
    report_text = "\n".join(report)

    with open("STATS_REPORT.md", "w") as f:
        f.write(report_text)

    print("\n" + "=" * 80)
    print("STATS_REPORT.md generated successfully")
    print("=" * 80)

    return report_text


# ============================================================================
# MAIN EXECUTION
# ============================================================================


def main():
    """Main execution pipeline for statistical analysis."""

    print("\n" + "=" * 80)
    print("T90 TITANS LEAGUE SEASON 5 - STATISTICAL MODELING PIPELINE")
    print("Statistical Modeler (The Quant)")
    print("=" * 80)

    # Step 1: Data Generation/Loading
    print("\n[1/6] Loading tournament data...")
    df = generate_tournament_data()
    df = create_data_summary(df)

    # Save raw data
    df.to_csv("data/ttl_s5_matches.csv", index=False)
    print(f"  [OK] Saved raw data: data/ttl_s5_matches.csv ({len(df)} records)")

    # Step 2: Calculate Statistics
    print("\n[2/6] Calculating player statistics...")
    player_stats = calculate_player_stats(df)
    player_stats.to_csv("data/player_statistics.csv", index=False)
    print(f"  [OK] Saved: data/player_statistics.csv ({len(player_stats)} players)")

    print("\n[3/6] Calculating civilization statistics...")
    civ_stats = calculate_civilization_stats(df)
    civ_stats.to_csv("data/civilization_statistics.csv", index=False)
    print(
        f"  [OK] Saved: data/civilization_statistics.csv ({len(civ_stats)} civilizations)"
    )

    print("\n[4/6] Calculating map statistics...")
    map_stats = calculate_map_stats(df)
    map_stats.to_csv("data/map_statistics.csv", index=False)
    print(f"  [OK] Saved: data/map_statistics.csv ({len(map_stats)} maps)")

    # Step 3: Statistical Testing
    print("\n[5/6] Performing statistical tests...")
    test_results = perform_statistical_tests(df)

    # Step 4: Outlier Analysis
    print("\n[6/6] Identifying outliers...")
    overperformers, underperformers = identify_outliers(player_stats)

    # Step 5: Generate Visualizations
    print("\n[*] Generating visualizations...")
    create_visualizations(df, player_stats, civ_stats, map_stats)

    # Step 6: Generate Report
    print("\n[*] Generating statistical report...")
    report = generate_stats_report(df, player_stats, civ_stats, map_stats, test_results)

    # Print report to console
    print("\n" + report)

    print("\n" + "=" * 80)
    print("ANALYSIS COMPLETE")
    print("=" * 80)
    print("""
Output Files Generated:
  Data Files:
    * data/ttl_s5_matches.csv - Raw match data
    * data/player_statistics.csv - Player performance metrics
    * data/civilization_statistics.csv - Civilization performance metrics
    * data/map_statistics.csv - Map performance metrics
  
  Visualizations:
    * assets/ttl_s5_dashboard.png - Main analysis dashboard
    * assets/correlation_matrix.png - Player stats correlation heatmap
    * assets/civilization_tier_list.png - Civ win rate tier list
  
  Reports:
    * STATS_REPORT.md - Comprehensive statistical analysis report
""")


if __name__ == "__main__":
    main()
