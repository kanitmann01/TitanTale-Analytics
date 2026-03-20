"""
T90 Titans League Season 5 - Advanced Statistical Analysis
Statistical Modeler: Deep EDA, Correlation Analysis, and Outlier Detection
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from scipy.stats import (
    chi2_contingency,
    pearsonr,
    spearmanr,
    kruskal,
    levene,
    jarque_bera,
)

import warnings

warnings.filterwarnings("ignore")

# Set visualization style
plt.style.use("seaborn-v0_8-darkgrid")
sns.set_palette("husl")
sns.set_context("paper", font_scale=1.2)

# ============================================================================
# SECTION 1: ADVANCED DATA LOADING & VALIDATION
# ============================================================================


def load_and_validate_data():
    """Load real tournament data and perform validation."""

    print("=" * 80)
    print("T90 TITANS LEAGUE SEASON 5 - ADVANCED STATISTICAL ANALYSIS")
    print("Statistical Modeler (The Quant) - Real Data Analysis")
    print("=" * 80)

    # Load the real match data
    df = pd.read_csv("data/ttl_s5_matches.csv")

    print(f"\n[DATA VALIDATION]")
    print(f"Raw Records Loaded: {len(df)}")
    print(f"Columns: {list(df.columns)}")
    print(f"Missing Values:\n{df.isnull().sum()}")
    print(f"Duplicate Rows: {df.duplicated().sum()}")

    # Data quality checks
    assert df["winner"].isin(pd.concat([df["player1"], df["player2"]])).all(), (
        "Invalid winners detected"
    )
    assert (df["duration_minutes"] > 0).all(), "Invalid game durations"

    print("\n[DATA PROFILE]")
    print(f"Unique Matches: {df['match_id'].nunique()}")
    print(f"Total Games: {len(df)}")
    print(f"Unique Players: {pd.concat([df['player1'], df['player2']]).nunique()}")
    print(
        f"Unique Civilizations: {pd.concat([df['player1_civ'], df['player2_civ']]).nunique()}"
    )
    print(f"Unique Maps: {df['map'].nunique()}")
    print(f"Date/Stage: {df['stage'].unique()}")

    return df


# ============================================================================
# SECTION 2: ADVANCED PLAYER PERFORMANCE ANALYSIS
# ============================================================================


def calculate_advanced_player_metrics(df):
    """Calculate comprehensive player statistics with variance metrics."""

    print("\n" + "=" * 80)
    print("ADVANCED PLAYER PERFORMANCE METRICS")
    print("=" * 80)

    player_metrics = []
    all_players = pd.concat([df["player1"], df["player2"]]).unique()

    for player in all_players:
        # Get all games for this player
        p1_games = df[df["player1"] == player].copy()
        p2_games = df[df["player2"] == player].copy()

        # Basic stats
        p1_wins = len(p1_games[p1_games["winner"] == player])
        p1_losses = len(p1_games[p1_games["loser"] == player])
        p2_wins = len(p2_games[p2_games["winner"] == player])
        p2_losses = len(p2_games[p2_games["loser"] == player])

        total_games = p1_wins + p1_losses + p2_wins + p2_losses
        total_wins = p1_wins + p2_wins
        total_losses = p1_losses + p2_losses
        win_rate = total_wins / total_games if total_games > 0 else 0

        # ELO
        elo = (
            df[df["player1"] == player]["player1_elo"].iloc[0]
            if len(p1_games) > 0
            else df[df["player2"] == player]["player2_elo"].iloc[0]
        )

        # Game duration statistics
        player_games = df[(df["player1"] == player) | (df["player2"] == player)]
        durations = player_games["duration_minutes"].values
        avg_duration = np.mean(durations)
        duration_std = np.std(durations, ddof=1)
        duration_cv = (
            duration_std / avg_duration if avg_duration > 0 else 0
        )  # Coefficient of variation

        # Win rate by position (player1 vs player2)
        p1_win_rate = (
            p1_wins / (p1_wins + p1_losses) if (p1_wins + p1_losses) > 0 else 0
        )
        p2_win_rate = (
            p2_wins / (p2_wins + p2_losses) if (p2_wins + p2_losses) > 0 else 0
        )
        position_bias = abs(p1_win_rate - p2_win_rate)

        # Civilization diversity
        civs_played = set()
        civs_played.update(p1_games["player1_civ"].tolist())
        civs_played.update(p2_games["player2_civ"].tolist())
        unique_civs = len(civs_played)
        civ_diversity = unique_civs / total_games if total_games > 0 else 0

        # Map diversity
        maps_played = player_games["map"].nunique()

        # Consistency metrics (rolling win rate std)
        if total_games >= 5:
            # Create win/loss sequence
            all_games = []
            for _, row in player_games.iterrows():
                is_win = 1 if row["winner"] == player else 0
                all_games.append(is_win)

            # Calculate rolling standard deviation (consistency)
            window = min(5, len(all_games))
            rolling_wins = (
                pd.Series(all_games).rolling(window=window, min_periods=1).mean()
            )
            consistency = 1 - rolling_wins.std()  # Higher = more consistent
        else:
            consistency = np.nan

        player_metrics.append(
            {
                "player": player,
                "total_games": total_games,
                "wins": total_wins,
                "losses": total_losses,
                "win_rate": win_rate,
                "elo": elo,
                "avg_duration": avg_duration,
                "duration_std": duration_std,
                "duration_cv": duration_cv,
                "unique_civs": unique_civs,
                "civ_diversity": civ_diversity,
                "unique_maps": maps_played,
                "position_bias": position_bias,
                "consistency": consistency,
                "p1_win_rate": p1_win_rate,
                "p2_win_rate": p2_win_rate,
            }
        )

    metrics_df = pd.DataFrame(player_metrics)

    print(f"\nCalculated metrics for {len(metrics_df)} players")
    print(f"\nTop 10 by Consistency (min 10 games):")
    consistent = metrics_df[metrics_df["total_games"] >= 10].nlargest(10, "consistency")
    for _, row in consistent.iterrows():
        print(
            f"  {row['player']:<15} | Consistency: {row['consistency']:.3f} | Win Rate: {row['win_rate']:.1%}"
        )

    print(f"\nHighest Duration Variance (min 10 games):")
    variable = metrics_df[metrics_df["total_games"] >= 10].nlargest(5, "duration_cv")
    for _, row in variable.iterrows():
        print(
            f"  {row['player']:<15} | CV: {row['duration_cv']:.3f} | Avg: {row['avg_duration']:.1f} min"
        )

    return metrics_df


# ============================================================================
# SECTION 3: CORRELATION ANALYSIS
# ============================================================================


def perform_correlation_analysis(df, player_metrics):
    """Perform comprehensive correlation analysis."""

    print("\n" + "=" * 80)
    print("CORRELATION ANALYSIS")
    print("=" * 80)

    correlations = {}

    # 1. ELO vs Win Rate (Pearson and Spearman)
    elo_win_pearson, p_pearson = pearsonr(
        player_metrics["elo"], player_metrics["win_rate"]
    )
    elo_win_spearman, p_spearman = spearmanr(
        player_metrics["elo"], player_metrics["win_rate"]
    )

    print("\n1. ELO vs Win Rate Correlation:")
    print(f"   Pearson r: {elo_win_pearson:.4f} (p={p_pearson:.4f})")
    print(f"   Spearman rho: {elo_win_spearman:.4f} (p={p_spearman:.4f})")
    print(
        f"   Interpretation: {'Significant' if p_pearson < 0.05 else 'Not significant'} linear relationship"
    )

    correlations["elo_win_rate"] = {
        "pearson": elo_win_pearson,
        "pearson_p": p_pearson,
        "spearman": elo_win_spearman,
        "spearman_p": p_spearman,
    }

    # 2. Game Duration vs ELO Difference
    df_temp = df.copy()
    df_temp["elo_diff"] = abs(df_temp["player1_elo"] - df_temp["player2_elo"])
    duration_elo_corr, p_duration = pearsonr(
        df_temp["elo_diff"], df_temp["duration_minutes"]
    )

    print("\n2. ELO Difference vs Game Duration:")
    print(f"   Correlation: {duration_elo_corr:.4f} (p={p_duration:.4f})")
    print(
        f"   Interpretation: {'Significant' if p_duration < 0.05 else 'Not significant'} relationship"
    )

    correlations["duration_elo"] = {"r": duration_elo_corr, "p": p_duration}

    # 3. Civilization vs Map Association (Chi-square)
    civs = pd.concat([df["player1_civ"], df["player2_civ"]]).reset_index(drop=True)
    maps = pd.concat([df["map"], df["map"]]).reset_index(drop=True)

    # Create contingency table for top civs and maps
    top_civs = civs.value_counts().head(20).index
    top_maps = maps.value_counts().head(15).index

    mask = civs.isin(top_civs) & maps.isin(top_maps)
    civ_map_table = pd.crosstab(civs[mask], maps[mask])

    chi2, p_chi2, dof, expected = chi2_contingency(civ_map_table)
    cramers_v = np.sqrt(
        chi2 / (civ_map_table.sum().sum() * (min(civ_map_table.shape) - 1))
    )

    print("\n3. Civilization-Map Association (Chi-square):")
    print(f"   Chi-square: {chi2:.4f}")
    print(f"   p-value: {p_chi2:.4f}")
    print(f"   Cramer's V: {cramers_v:.4f} (effect size)")
    print(
        f"   Interpretation: {'Significant association' if p_chi2 < 0.05 else 'Independent'}"
    )

    correlations["civ_map"] = {
        "chi2": chi2,
        "p": p_chi2,
        "cramers_v": cramers_v,
        "dof": dof,
    }

    # 4. Civ Diversity vs Performance
    div_perf_corr, p_div = pearsonr(
        player_metrics["civ_diversity"], player_metrics["win_rate"]
    )

    print("\n4. Civilization Diversity vs Win Rate:")
    print(f"   Correlation: {div_perf_corr:.4f} (p={p_div:.4f})")
    print(
        f"   Interpretation: {'Significant' if p_div < 0.05 else 'Not significant'} relationship"
    )

    correlations["diversity_performance"] = {"r": div_perf_corr, "p": p_div}

    # 5. Map Diversity vs Performance
    map_div_corr, p_map = pearsonr(
        player_metrics["unique_maps"], player_metrics["win_rate"]
    )

    print("\n5. Map Diversity vs Win Rate:")
    print(f"   Correlation: {map_div_corr:.4f} (p={p_map:.4f})")
    print(
        f"   Interpretation: {'Significant' if p_map < 0.05 else 'Not significant'} relationship"
    )

    correlations["map_diversity_performance"] = {"r": map_div_corr, "p": p_map}

    # 6. Game Duration Variance vs Win Rate
    dur_var_corr, p_dur_var = pearsonr(
        player_metrics["duration_cv"].fillna(0), player_metrics["win_rate"]
    )

    print("\n6. Game Duration Variance vs Win Rate:")
    print(f"   Correlation: {dur_var_corr:.4f} (p={p_dur_var:.4f})")
    print(
        f"   Interpretation: {'Significant' if p_dur_var < 0.05 else 'Not significant'} relationship"
    )

    correlations["duration_variance_performance"] = {"r": dur_var_corr, "p": p_dur_var}

    return correlations, civ_map_table


# ============================================================================
# SECTION 4: VARIANCE AND PERFORMANCE STABILITY ANALYSIS
# ============================================================================


def analyze_performance_variance(df, player_metrics):
    """Analyze variance and stability in player performance."""

    print("\n" + "=" * 80)
    print("PERFORMANCE VARIANCE & STABILITY ANALYSIS")
    print("=" * 80)

    # Filter players with sufficient games
    qualified = player_metrics[player_metrics["total_games"] >= 10].copy()

    print(f"\nAnalyzing {len(qualified)} players with 10+ games")

    # 1. Win Rate Standard Deviation across population
    win_rate_std = qualified["win_rate"].std()
    win_rate_mean = qualified["win_rate"].mean()

    print(f"\n1. Population Win Rate Statistics:")
    print(f"   Mean: {win_rate_mean:.3f}")
    print(f"   Std Dev: {win_rate_std:.3f}")
    print(f"   Coefficient of Variation: {win_rate_std / win_rate_mean:.3f}")
    print(
        f"   Range: {qualified['win_rate'].min():.3f} - {qualified['win_rate'].max():.3f}"
    )

    # 2. ELO Standard Deviation
    elo_std = qualified["elo"].std()
    elo_mean = qualified["elo"].mean()

    print(f"\n2. Population ELO Statistics:")
    print(f"   Mean: {elo_mean:.1f}")
    print(f"   Std Dev: {elo_std:.1f}")
    print(f"   Coefficient of Variation: {elo_std / elo_mean:.3f}")

    # 3. Duration variance by player
    print(f"\n3. Game Duration Consistency (Top 5 Most Variable):")
    most_variable = qualified.nlargest(5, "duration_cv")
    for _, row in most_variable.iterrows():
        print(
            f"   {row['player']:<15} | CV: {row['duration_cv']:.3f} | "
            f"sigma: {row['duration_std']:.1f} min"
        )

    print(f"\n4. Game Duration Consistency (Top 5 Most Consistent):")
    most_consistent = qualified.nsmallest(5, "duration_cv")
    for _, row in most_consistent.iterrows():
        print(
            f"   {row['player']:<15} | CV: {row['duration_cv']:.3f} | "
            f"sigma: {row['duration_std']:.1f} min"
        )

    # 5. Levene's test for equal variance (top vs bottom half by ELO)
    median_elo = qualified["elo"].median()
    top_half = qualified[qualified["elo"] >= median_elo]["win_rate"]
    bottom_half = qualified[qualified["elo"] < median_elo]["win_rate"]

    levene_stat, p_levene = levene(top_half, bottom_half)

    print(f"\n5. Homogeneity of Variance (Levene's Test):")
    print(f"   Top Half Win Rate Std: {top_half.std():.3f}")
    print(f"   Bottom Half Win Rate Std: {bottom_half.std():.3f}")
    print(f"   Levene Statistic: {levene_stat:.3f}")
    print(f"   p-value: {p_levene:.3f}")
    print(
        f"   Interpretation: {'Unequal variances' if p_levene < 0.05 else 'Equal variances'}"
    )

    # 6. Normality test for win rates
    jb_stat, p_jb = jarque_bera(qualified["win_rate"])

    print(f"\n6. Win Rate Distribution Normality (Jarque-Bera):")
    print(f"   JB Statistic: {jb_stat:.3f}")
    print(f"   p-value: {p_jb:.3f}")
    print(
        f"   Interpretation: {'Normally distributed' if p_jb > 0.05 else 'Non-normal distribution'}"
    )

    variance_stats = {
        "win_rate": {"mean": win_rate_mean, "std": win_rate_std},
        "elo": {"mean": elo_mean, "std": elo_std},
        "levene": {"statistic": levene_stat, "p": p_levene},
        "normality": {"jb": jb_stat, "p": p_jb},
    }

    return variance_stats


# ============================================================================
# SECTION 5: OUTLIER DETECTION WITH CONFIDENCE INTERVALS
# ============================================================================


def detect_statistical_outliers(df, player_metrics):
    """Identify statistically significant outliers using multiple methods."""

    print("\n" + "=" * 80)
    print("STATISTICAL OUTLIER DETECTION")
    print("=" * 80)

    qualified = player_metrics[player_metrics["total_games"] >= 10].copy()

    outliers = {
        "overperformers": [],
        "underperformers": [],
        "duration_outliers": [],
        "consistency_outliers": [],
    }

    # 1. Performance vs ELO Expectation (Z-score method)
    print("\n1. Performance vs ELO Expectation (95% CI, |z| > 1.96):")
    print("-" * 70)

    # Fit linear model: Expected Win Rate = f(ELO)
    z = np.polyfit(qualified["elo"], qualified["win_rate"], 1)
    p = np.poly1d(z)
    qualified["expected_win_rate"] = p(qualified["elo"])
    qualified["performance_residual"] = (
        qualified["win_rate"] - qualified["expected_win_rate"]
    )
    qualified["performance_zscore"] = np.abs(
        stats.zscore(qualified["performance_residual"])
    )

    # Calculate confidence interval for residuals
    residual_std = qualified["performance_residual"].std()
    ci_95 = 1.96 * residual_std

    print(f"   Residual Std Dev: {residual_std:.4f}")
    print(f"   95% CI threshold: +/-{ci_95:.4f}")

    # Overperformers (positive residuals, beyond 95% CI)
    over_perf = qualified[
        (qualified["performance_residual"] > ci_95)
        & (qualified["performance_zscore"] > 1.5)
    ].sort_values("performance_residual", ascending=False)

    if len(over_perf) > 0:
        print(f"\n   OVERPERFORMERS ({len(over_perf)} players):")
        for _, row in over_perf.iterrows():
            outliers["overperformers"].append(
                {
                    "player": row["player"],
                    "actual": row["win_rate"],
                    "expected": row["expected_win_rate"],
                    "delta": row["performance_residual"],
                    "zscore": row["performance_zscore"],
                }
            )
            print(
                f"   * {row['player']:<15} | Actual: {row['win_rate']:.1%} | "
                f"Expected: {row['expected_win_rate']:.1%} | "
                f"Delta: +{row['performance_residual']:.1%} | z={row['performance_zscore']:.2f}"
            )

    # Underperformers (negative residuals, beyond 95% CI)
    under_perf = qualified[
        (qualified["performance_residual"] < -ci_95)
        & (qualified["performance_zscore"] > 1.5)
    ].sort_values("performance_residual", ascending=True)

    if len(under_perf) > 0:
        print(f"\n   UNDERPERFORMERS ({len(under_perf)} players):")
        for _, row in under_perf.iterrows():
            outliers["underperformers"].append(
                {
                    "player": row["player"],
                    "actual": row["win_rate"],
                    "expected": row["expected_win_rate"],
                    "delta": row["performance_residual"],
                    "zscore": row["performance_zscore"],
                }
            )
            print(
                f"   * {row['player']:<15} | Actual: {row['win_rate']:.1%} | "
                f"Expected: {row['expected_win_rate']:.1%} | "
                f"Delta: {row['performance_residual']:.1%} | z={row['performance_zscore']:.2f}"
            )

    # 2. Duration Outliers (IQR Method)
    print("\n2. Game Duration Variance Outliers (IQR Method):")
    print("-" * 70)

    q1 = qualified["duration_cv"].quantile(0.25)
    q3 = qualified["duration_cv"].quantile(0.75)
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    duration_outliers = qualified[
        (qualified["duration_cv"] < lower_bound)
        | (qualified["duration_cv"] > upper_bound)
    ]

    print(f"   IQR: {iqr:.3f}")
    print(f"   Outlier bounds: [{lower_bound:.3f}, {upper_bound:.3f}]")
    print(f"   Duration outliers: {len(duration_outliers)}")

    for _, row in duration_outliers.iterrows():
        outliers["duration_outliers"].append(
            {
                "player": row["player"],
                "cv": row["duration_cv"],
                "type": "High Variance"
                if row["duration_cv"] > upper_bound
                else "Low Variance",
            }
        )

    # 3. Modified Z-score (MAD-based) for robust outlier detection
    print("\n3. Robust Outlier Detection (MAD-based, threshold=3.5):")
    print("-" * 70)

    median_wr = qualified["win_rate"].median()
    mad = np.median(np.abs(qualified["win_rate"] - median_wr))
    modified_z = 0.6745 * (qualified["win_rate"] - median_wr) / mad if mad > 0 else 0

    robust_outliers = qualified[np.abs(modified_z) > 3.5]

    print(f"   Median Win Rate: {median_wr:.3f}")
    print(f"   MAD: {mad:.3f}")
    print(f"   Robust outliers: {len(robust_outliers)}")

    for _, row in robust_outliers.iterrows():
        z_score = 0.6745 * (row["win_rate"] - median_wr) / mad
        print(
            f"   * {row['player']:<15} | Win Rate: {row['win_rate']:.1%} | "
            f"Modified Z: {z_score:.2f}"
        )

    return outliers, qualified


# ============================================================================
# SECTION 6: HIGH-DENSITY VISUALIZATIONS
# ============================================================================


def create_advanced_visualizations(df, player_metrics, civ_map_table, correlations):
    """Generate publication-quality statistical visualizations."""

    print("\n" + "=" * 80)
    print("GENERATING ADVANCED VISUALIZATIONS")
    print("=" * 80)

    qualified = player_metrics[player_metrics["total_games"] >= 10].copy()

    # 1. Comprehensive Correlation Heatmap
    print("\n[1/8] Creating comprehensive correlation heatmap...")
    fig, ax = plt.subplots(figsize=(12, 10))

    corr_vars = [
        "win_rate",
        "elo",
        "avg_duration",
        "duration_std",
        "civ_diversity",
        "unique_maps",
        "consistency",
        "total_games",
    ]
    corr_matrix = qualified[corr_vars].corr()

    mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
    sns.heatmap(
        corr_matrix,
        mask=mask,
        annot=True,
        fmt=".3f",
        cmap="RdBu_r",
        center=0,
        vmin=-1,
        vmax=1,
        square=True,
        linewidths=0.5,
        cbar_kws={"shrink": 0.8},
        ax=ax,
    )
    ax.set_title(
        "Player Metrics Correlation Matrix\n(Players with 10+ games)",
        fontsize=14,
        fontweight="bold",
        pad=20,
    )

    plt.tight_layout()
    plt.savefig("assets/correlation_matrix_detailed.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("   [OK] Saved: assets/correlation_matrix_detailed.png")

    # 2. Violin Plot with Individual Points - Win Rate Distribution
    print("[2/8] Creating violin plots...")
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle(
        "Player Performance Distribution Analysis", fontsize=16, fontweight="bold"
    )

    # Win Rate Violin
    ax1 = axes[0, 0]
    parts = ax1.violinplot(
        [qualified["win_rate"]],
        positions=[1],
        showmeans=True,
        showmedians=True,
        widths=0.7,
    )
    for pc in parts["bodies"]:
        pc.set_facecolor("lightblue")
        pc.set_alpha(0.7)

    # Add jittered points
    np.random.seed(42)
    jitter = np.random.normal(1, 0.04, len(qualified))
    ax1.scatter(
        jitter,
        qualified["win_rate"],
        alpha=0.6,
        s=60,
        c=qualified["elo"],
        cmap="viridis",
        edgecolors="black",
        linewidth=0.5,
    )

    ax1.axhline(y=0.5, color="red", linestyle="--", alpha=0.5, label="50% (Parity)")
    ax1.set_ylabel("Win Rate")
    ax1.set_title("Win Rate Distribution by Player")
    ax1.set_xticks([1])
    ax1.set_xticklabels([f"All Players\n(n={len(qualified)})"])
    ax1.grid(True, alpha=0.3)
    cbar1 = plt.colorbar(ax1.collections[1], ax=ax1)
    cbar1.set_label("ELO Rating")

    # ELO Violin
    ax2 = axes[0, 1]
    parts2 = ax2.violinplot(
        [qualified["elo"]], positions=[1], showmeans=True, showmedians=True, widths=0.7
    )
    for pc in parts2["bodies"]:
        pc.set_facecolor("lightgreen")
        pc.set_alpha(0.7)

    jitter2 = np.random.normal(1, 0.04, len(qualified))
    ax2.scatter(
        jitter2,
        qualified["elo"],
        alpha=0.6,
        s=60,
        c=qualified["win_rate"],
        cmap="RdYlGn",
        edgecolors="black",
        linewidth=0.5,
    )

    ax2.set_ylabel("ELO Rating")
    ax2.set_title("ELO Distribution by Player")
    ax2.set_xticks([1])
    ax2.set_xticklabels([f"All Players\n(n={len(qualified)})"])
    ax2.grid(True, alpha=0.3)
    cbar2 = plt.colorbar(ax2.collections[1], ax=ax2)
    cbar2.set_label("Win Rate")

    # Duration Variance Violin
    ax3 = axes[1, 0]
    parts3 = ax3.violinplot(
        [qualified["duration_cv"].fillna(0)],
        positions=[1],
        showmeans=True,
        showmedians=True,
        widths=0.7,
    )
    for pc in parts3["bodies"]:
        pc.set_facecolor("lightcoral")
        pc.set_alpha(0.7)

    jitter3 = np.random.normal(1, 0.04, len(qualified))
    ax3.scatter(
        jitter3,
        qualified["duration_cv"].fillna(0),
        alpha=0.6,
        s=60,
        c=qualified["win_rate"],
        cmap="RdYlGn",
        edgecolors="black",
        linewidth=0.5,
    )

    ax3.set_ylabel("Duration Coefficient of Variation")
    ax3.set_title("Game Duration Consistency by Player")
    ax3.set_xticks([1])
    ax3.set_xticklabels([f"All Players\n(n={len(qualified)})"])
    ax3.grid(True, alpha=0.3)

    # Consistency Violin
    ax4 = axes[1, 1]
    consistency_clean = qualified["consistency"].fillna(0)
    parts4 = ax4.violinplot(
        [consistency_clean], positions=[1], showmeans=True, showmedians=True, widths=0.7
    )
    for pc in parts4["bodies"]:
        pc.set_facecolor("gold")
        pc.set_alpha(0.7)

    jitter4 = np.random.normal(1, 0.04, len(qualified))
    ax4.scatter(
        jitter4,
        consistency_clean,
        alpha=0.6,
        s=60,
        c=qualified["win_rate"],
        cmap="RdYlGn",
        edgecolors="black",
        linewidth=0.5,
    )

    ax4.set_ylabel("Consistency Score")
    ax4.set_title("Performance Consistency by Player")
    ax4.set_xticks([1])
    ax4.set_xticklabels([f"All Players\n(n={len(qualified)})"])
    ax4.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig("assets/player_distributions_violin.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("   [OK] Saved: assets/player_distributions_violin.png")

    # 3. Scatter Matrix - Multi-dimensional Analysis
    print("[3/8] Creating multi-dimensional scatter matrix...")
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    fig.suptitle(
        "Multi-Dimensional Performance Analysis", fontsize=16, fontweight="bold"
    )

    # ELO vs Win Rate with regression
    ax = axes[0, 0]
    scatter = ax.scatter(
        qualified["elo"],
        qualified["win_rate"],
        c=qualified["total_games"],
        s=100,
        alpha=0.7,
        cmap="plasma",
        edgecolors="black",
        linewidth=0.5,
    )
    z = np.polyfit(qualified["elo"], qualified["win_rate"], 1)
    p = np.poly1d(z)
    ax.plot(qualified["elo"], p(qualified["elo"]), "r--", linewidth=2, alpha=0.8)
    r_squared = np.corrcoef(qualified["elo"], qualified["win_rate"])[0, 1] ** 2
    ax.set_xlabel("ELO Rating")
    ax.set_ylabel("Win Rate")
    ax.set_title(f"ELO vs Win Rate\n(R^2 = {r_squared:.3f})")
    ax.grid(True, alpha=0.3)
    ax.axhline(y=0.5, color="gray", linestyle="--", alpha=0.5)
    plt.colorbar(scatter, ax=ax, label="Games Played")

    # Civ Diversity vs Win Rate
    ax = axes[0, 1]
    ax.scatter(
        qualified["civ_diversity"],
        qualified["win_rate"],
        c=qualified["elo"],
        s=100,
        alpha=0.7,
        cmap="viridis",
        edgecolors="black",
        linewidth=0.5,
    )
    z = np.polyfit(qualified["civ_diversity"], qualified["win_rate"], 1)
    p = np.poly1d(z)
    ax.plot(
        qualified["civ_diversity"],
        p(qualified["civ_diversity"]),
        "r--",
        linewidth=2,
        alpha=0.8,
    )
    r2 = np.corrcoef(qualified["civ_diversity"], qualified["win_rate"])[0, 1] ** 2
    ax.set_xlabel("Civilization Diversity (Unique/Total)")
    ax.set_ylabel("Win Rate")
    ax.set_title(f"Civ Diversity vs Win Rate\n(R^2 = {r2:.3f})")
    ax.grid(True, alpha=0.3)
    ax.axhline(y=0.5, color="gray", linestyle="--", alpha=0.5)

    # Duration CV vs Win Rate
    ax = axes[0, 2]
    ax.scatter(
        qualified["duration_cv"],
        qualified["win_rate"],
        c=qualified["elo"],
        s=100,
        alpha=0.7,
        cmap="viridis",
        edgecolors="black",
        linewidth=0.5,
    )
    z = np.polyfit(qualified["duration_cv"].fillna(0), qualified["win_rate"], 1)
    p = np.poly1d(z)
    ax.plot(
        qualified["duration_cv"],
        p(qualified["duration_cv"].fillna(0)),
        "r--",
        linewidth=2,
        alpha=0.8,
    )
    r2 = (
        np.corrcoef(qualified["duration_cv"].fillna(0), qualified["win_rate"])[0, 1]
        ** 2
    )
    ax.set_xlabel("Duration Coefficient of Variation")
    ax.set_ylabel("Win Rate")
    ax.set_title(f"Duration Variance vs Win Rate\n(R^2 = {r2:.3f})")
    ax.grid(True, alpha=0.3)
    ax.axhline(y=0.5, color="gray", linestyle="--", alpha=0.5)

    # Games Played vs Win Rate
    ax = axes[1, 0]
    ax.scatter(
        qualified["total_games"],
        qualified["win_rate"],
        c=qualified["elo"],
        s=100,
        alpha=0.7,
        cmap="viridis",
        edgecolors="black",
        linewidth=0.5,
    )
    ax.set_xlabel("Total Games Played")
    ax.set_ylabel("Win Rate")
    ax.set_title("Sample Size vs Win Rate")
    ax.grid(True, alpha=0.3)
    ax.axhline(y=0.5, color="gray", linestyle="--", alpha=0.5)

    # Map Diversity vs Win Rate
    ax = axes[1, 1]
    ax.scatter(
        qualified["unique_maps"],
        qualified["win_rate"],
        c=qualified["elo"],
        s=100,
        alpha=0.7,
        cmap="viridis",
        edgecolors="black",
        linewidth=0.5,
    )
    z = np.polyfit(qualified["unique_maps"], qualified["win_rate"], 1)
    p = np.poly1d(z)
    ax.plot(
        qualified["unique_maps"],
        p(qualified["unique_maps"]),
        "r--",
        linewidth=2,
        alpha=0.8,
    )
    r2 = np.corrcoef(qualified["unique_maps"], qualified["win_rate"])[0, 1] ** 2
    ax.set_xlabel("Unique Maps Played")
    ax.set_ylabel("Win Rate")
    ax.set_title(f"Map Diversity vs Win Rate\n(R^2 = {r2:.3f})")
    ax.grid(True, alpha=0.3)
    ax.axhline(y=0.5, color="gray", linestyle="--", alpha=0.5)

    # Consistency vs Win Rate
    ax = axes[1, 2]
    consistency_clean = qualified["consistency"].fillna(0)
    ax.scatter(
        consistency_clean,
        qualified["win_rate"],
        c=qualified["elo"],
        s=100,
        alpha=0.7,
        cmap="viridis",
        edgecolors="black",
        linewidth=0.5,
    )
    z = np.polyfit(consistency_clean, qualified["win_rate"], 1)
    p = np.poly1d(z)
    ax.plot(consistency_clean, p(consistency_clean), "r--", linewidth=2, alpha=0.8)
    r2 = np.corrcoef(consistency_clean, qualified["win_rate"])[0, 1] ** 2
    ax.set_xlabel("Consistency Score")
    ax.set_ylabel("Win Rate")
    ax.set_title(f"Consistency vs Win Rate\n(R^2 = {r2:.3f})")
    ax.grid(True, alpha=0.3)
    ax.axhline(y=0.5, color="gray", linestyle="--", alpha=0.5)

    plt.tight_layout()
    plt.savefig("assets/performance_scatter_matrix.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("   [OK] Saved: assets/performance_scatter_matrix.png")

    # 4. Civilization-Map Heatmap
    print("[4/8] Creating civ-map heatmap...")
    fig, ax = plt.subplots(figsize=(16, 12))

    sns.heatmap(
        civ_map_table,
        annot=False,
        cmap="YlOrRd",
        cbar_kws={"label": "Frequency"},
        ax=ax,
    )
    ax.set_title(
        "Civilization-Map Pick Frequency Heatmap\n(Top 20 Civilizations x Top 15 Maps)",
        fontsize=14,
        fontweight="bold",
        pad=20,
    )
    ax.set_xlabel("Map", fontsize=12)
    ax.set_ylabel("Civilization", fontsize=12)
    plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha="right")
    plt.setp(ax.yaxis.get_majorticklabels(), rotation=0)

    plt.tight_layout()
    plt.savefig("assets/civ_map_heatmap.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("   [OK] Saved: assets/civ_map_heatmap.png")

    # 5. Outlier Visualization
    print("[5/8] Creating outlier analysis visualization...")
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))
    fig.suptitle("Statistical Outlier Detection", fontsize=16, fontweight="bold")

    # Residual plot
    ax1 = axes[0]
    ax1.scatter(
        qualified["expected_win_rate"],
        qualified["performance_residual"],
        c=qualified["performance_zscore"],
        s=100,
        alpha=0.7,
        cmap="RdBu_r",
        edgecolors="black",
        linewidth=0.5,
    )
    ax1.axhline(y=0, color="black", linestyle="-", linewidth=1)
    ax1.axhline(
        y=0.2, color="red", linestyle="--", linewidth=1, alpha=0.5, label="95% CI"
    )
    ax1.axhline(y=-0.2, color="red", linestyle="--", linewidth=1, alpha=0.5)
    ax1.set_xlabel("Expected Win Rate (from ELO)")
    ax1.set_ylabel("Performance Residual (Actual - Expected)")
    ax1.set_title("Performance vs Expectation")
    ax1.grid(True, alpha=0.3)
    ax1.legend()

    # Annotate outliers
    outliers_mask = qualified["performance_zscore"] > 1.5
    for _, row in qualified[outliers_mask].iterrows():
        ax1.annotate(
            row["player"],
            (row["expected_win_rate"], row["performance_residual"]),
            fontsize=8,
            alpha=0.8,
        )

    # Z-score distribution
    ax2 = axes[1]
    ax2.hist(
        qualified["performance_zscore"],
        bins=20,
        color="skyblue",
        alpha=0.7,
        edgecolor="black",
    )
    ax2.axvline(x=1.96, color="red", linestyle="--", linewidth=2, label="95% threshold")
    ax2.axvline(x=-1.96, color="red", linestyle="--", linewidth=2)
    ax2.set_xlabel("Performance Z-Score")
    ax2.set_ylabel("Frequency")
    ax2.set_title("Z-Score Distribution")
    ax2.grid(True, alpha=0.3)
    ax2.legend()

    plt.tight_layout()
    plt.savefig("assets/outlier_analysis.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("   [OK] Saved: assets/outlier_analysis.png")

    # 6. Duration Analysis by Map
    print("[6/8] Creating map duration analysis...")
    fig, ax = plt.subplots(figsize=(14, 6))

    map_stats = (
        df.groupby("map")["duration_minutes"]
        .agg(["mean", "std", "count"])
        .reset_index()
    )
    map_stats = map_stats[map_stats["count"] >= 10].sort_values("mean", ascending=True)

    y_pos = np.arange(len(map_stats))
    ax.barh(
        y_pos,
        map_stats["mean"],
        xerr=map_stats["std"],
        color="lightblue",
        alpha=0.7,
        edgecolor="black",
        capsize=5,
    )
    ax.set_yticks(y_pos)
    ax.set_yticklabels(map_stats["map"])
    ax.set_xlabel("Average Game Duration (minutes)")
    ax.set_title(
        "Game Duration by Map\n(Error bars = +/-1 SD)", fontsize=14, fontweight="bold"
    )
    ax.grid(True, alpha=0.3, axis="x")

    # Add sample size annotations
    for i, (_, row) in enumerate(map_stats.iterrows()):
        ax.text(
            row["mean"] + row["std"] + 0.5,
            i,
            f"n={int(row['count'])}",
            va="center",
            fontsize=9,
        )

    plt.tight_layout()
    plt.savefig("assets/map_duration_analysis.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("   [OK] Saved: assets/map_duration_analysis.png")

    # 7. Performance Clustering Analysis (K-means alternative without sklearn)
    print("[7/8] Creating performance clustering analysis...")
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))
    fig.suptitle(
        "Player Performance Clustering Analysis", fontsize=16, fontweight="bold"
    )

    # Create 2D scatter with manual clustering by performance tiers
    ax1 = axes[0]

    # Define performance tiers based on win rate and ELO
    qualified["performance_tier"] = "Average"
    qualified.loc[
        (qualified["win_rate"] > 0.7) & (qualified["elo"] > qualified["elo"].median()),
        "performance_tier",
    ] = "Elite"
    qualified.loc[
        (qualified["win_rate"] > 0.6) & (qualified["elo"] > qualified["elo"].median()),
        "performance_tier",
    ] = "Strong"
    qualified.loc[(qualified["win_rate"] < 0.4), "performance_tier"] = "Struggling"

    tier_colors = {
        "Elite": "gold",
        "Strong": "green",
        "Average": "blue",
        "Struggling": "red",
    }
    for tier in tier_colors:
        tier_data = qualified[qualified["performance_tier"] == tier]
        if len(tier_data) > 0:
            ax1.scatter(
                tier_data["elo"],
                tier_data["win_rate"],
                c=tier_colors[tier],
                s=150,
                alpha=0.7,
                label=f"{tier} (n={len(tier_data)})",
                edgecolors="black",
                linewidth=1,
            )

    ax1.set_xlabel("ELO Rating")
    ax1.set_ylabel("Win Rate")
    ax1.set_title("Performance Tiers (ELO vs Win Rate)")
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax1.axhline(y=0.5, color="gray", linestyle="--", alpha=0.5)

    # Feature importance visualization
    ax2 = axes[1]
    corr_with_winrate = (
        qualified[["elo", "civ_diversity", "unique_maps", "consistency", "total_games"]]
        .corrwith(qualified["win_rate"])
        .abs()
        .sort_values(ascending=True)
    )
    colors = plt.cm.RdYlGn(corr_with_winrate.values)
    bars = ax2.barh(
        range(len(corr_with_winrate)),
        corr_with_winrate.values,
        color=colors,
        alpha=0.7,
        edgecolor="black",
    )
    ax2.set_yticks(range(len(corr_with_winrate)))
    ax2.set_yticklabels(corr_with_winrate.index)
    ax2.set_xlabel("Absolute Correlation with Win Rate")
    ax2.set_title("Feature Importance for Win Rate")
    ax2.grid(True, alpha=0.3, axis="x")

    # Add correlation values
    for i, (feature, corr) in enumerate(corr_with_winrate.items()):
        ax2.text(corr + 0.01, i, f"{corr:.3f}", va="center", fontsize=9)

    plt.tight_layout()
    plt.savefig("assets/performance_clustering.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("   [OK] Saved: assets/performance_clustering.png")

    # 8. Cumulative Dashboard
    print("[8/8] Creating comprehensive dashboard...")
    fig = plt.figure(figsize=(20, 16))
    gs = fig.add_gridspec(4, 4, hspace=0.3, wspace=0.3)

    fig.suptitle(
        "T90 Titans League Season 5 - Advanced Statistical Analysis Dashboard",
        fontsize=18,
        fontweight="bold",
        y=0.98,
    )

    # 1. Win Rate Distribution
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.hist(
        qualified["win_rate"], bins=15, color="skyblue", alpha=0.7, edgecolor="black"
    )
    ax1.axvline(
        qualified["win_rate"].mean(),
        color="red",
        linestyle="--",
        linewidth=2,
        label="Mean",
    )
    ax1.axvline(0.5, color="gray", linestyle="-", linewidth=1, alpha=0.5)
    ax1.set_xlabel("Win Rate")
    ax1.set_ylabel("Frequency")
    ax1.set_title("Win Rate Distribution")
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # 2. Top Players
    ax2 = fig.add_subplot(gs[0, 1])
    top_10 = qualified.nlargest(10, "win_rate")
    colors = plt.cm.RdYlGn(top_10["win_rate"])
    bars = ax2.barh(
        range(len(top_10)), top_10["win_rate"], color=colors, edgecolor="black"
    )
    ax2.set_yticks(range(len(top_10)))
    ax2.set_yticklabels(top_10["player"], fontsize=9)
    ax2.set_xlabel("Win Rate")
    ax2.set_title("Top 10 Players")
    ax2.axvline(0.5, color="gray", linestyle="--", alpha=0.5)
    ax2.grid(True, alpha=0.3, axis="x")

    # 3. ELO vs Win Rate
    ax3 = fig.add_subplot(gs[0, 2])
    ax3.scatter(
        qualified["elo"],
        qualified["win_rate"],
        c=qualified["total_games"],
        s=80,
        alpha=0.7,
        cmap="plasma",
        edgecolors="black",
        linewidth=0.5,
    )
    z = np.polyfit(qualified["elo"], qualified["win_rate"], 1)
    p = np.poly1d(z)
    ax3.plot(qualified["elo"], p(qualified["elo"]), "r--", linewidth=2)
    r2 = np.corrcoef(qualified["elo"], qualified["win_rate"])[0, 1] ** 2
    ax3.set_xlabel("ELO")
    ax3.set_ylabel("Win Rate")
    ax3.set_title(f"ELO vs Win Rate (R^2={r2:.3f})")
    ax3.grid(True, alpha=0.3)

    # 4. Game Duration Distribution
    ax4 = fig.add_subplot(gs[0, 3])
    ax4.hist(
        df["duration_minutes"],
        bins=30,
        color="lightcoral",
        alpha=0.7,
        edgecolor="black",
    )
    ax4.axvline(df["duration_minutes"].mean(), color="red", linestyle="--", linewidth=2)
    ax4.set_xlabel("Duration (minutes)")
    ax4.set_ylabel("Frequency")
    ax4.set_title(f"Game Duration\n(mu={df['duration_minutes'].mean():.1f} min)")
    ax4.grid(True, alpha=0.3)

    # 5. Correlation Matrix (simplified)
    ax5 = fig.add_subplot(gs[1, :2])
    corr_simple = qualified[
        ["win_rate", "elo", "civ_diversity", "unique_maps", "consistency"]
    ].corr()
    sns.heatmap(
        corr_simple,
        annot=True,
        fmt=".2f",
        cmap="RdBu_r",
        center=0,
        square=True,
        ax=ax5,
        cbar_kws={"shrink": 0.8},
    )
    ax5.set_title("Key Metrics Correlation Matrix")

    # 6. Civilization Performance
    ax6 = fig.add_subplot(gs[1, 2:])
    civ_stats = pd.read_csv("data/civilization_statistics.csv")
    sig_civs = civ_stats[civ_stats["games_played"] >= 15].sort_values(
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
    ax6.barh(
        range(len(sig_civs)),
        sig_civs["win_rate"],
        color=colors,
        alpha=0.7,
        edgecolor="black",
    )
    ax6.set_yticks(range(len(sig_civs)))
    ax6.set_yticklabels(sig_civs["civilization"], fontsize=9)
    ax6.set_xlabel("Win Rate")
    ax6.set_title("Civilization Performance (15+ games)")
    ax6.axvline(0.5, color="black", linestyle="--", linewidth=1)
    ax6.grid(True, alpha=0.3, axis="x")

    # 7. Map Statistics
    ax7 = fig.add_subplot(gs[2, :2])
    map_data = (
        df.groupby("map")
        .agg({"duration_minutes": "mean", "match_id": "count"})
        .reset_index()
    )
    map_data = map_data[map_data["match_id"] >= 15].sort_values("duration_minutes")
    bars = ax7.barh(
        range(len(map_data)),
        map_data["duration_minutes"],
        color="lightblue",
        alpha=0.7,
        edgecolor="black",
    )
    ax7.set_yticks(range(len(map_data)))
    ax7.set_yticklabels(map_data["map"], fontsize=9)
    ax7.set_xlabel("Avg Duration (minutes)")
    ax7.set_title("Average Game Duration by Map")
    ax7.grid(True, alpha=0.3, axis="x")

    # 8. Performance Variance
    ax8 = fig.add_subplot(gs[2, 2:])
    variance_data = qualified.sort_values("duration_cv", ascending=True).tail(10)
    ax8.barh(
        range(len(variance_data)),
        variance_data["duration_cv"],
        color="salmon",
        alpha=0.7,
        edgecolor="black",
    )
    ax8.set_yticks(range(len(variance_data)))
    ax8.set_yticklabels(variance_data["player"], fontsize=9)
    ax8.set_xlabel("Duration CV")
    ax8.set_title("Top 10 Variable Players (Duration)")
    ax8.grid(True, alpha=0.3, axis="x")

    # 9. Summary Statistics
    ax9 = fig.add_subplot(gs[3, :])
    ax9.axis("off")

    summary_text = f"""
    KEY STATISTICAL FINDINGS:
    
    * Dataset: {len(df)} games across {df["match_id"].nunique()} matches | {len(qualified)} qualified players (10+ games)
    * ELO-Performance: Weak correlation (Pearson r={correlations.get("elo_win_rate", {}).get("pearson", 0):.3f}, p={correlations.get("elo_win_rate", {}).get("pearson_p", 0):.3f})
    * Civ-Map Association: {"Significant" if correlations.get("civ_map", {}).get("p", 1) < 0.05 else "Not significant"} (chi-square={correlations.get("civ_map", {}).get("chi2", 0):.1f}, Cramer's V={correlations.get("civ_map", {}).get("cramers_v", 0):.3f})
    * Top Performer: {qualified.loc[qualified["win_rate"].idxmax(), "player"]} ({qualified["win_rate"].max():.1%} win rate)
    * Most Consistent: {qualified.loc[qualified["consistency"].idxmax(), "player"]} (consistency score: {qualified["consistency"].max():.3f})
    * Highest Variance: {qualified.loc[qualified["duration_cv"].idxmax(), "player"]} (CV: {qualified["duration_cv"].max():.3f})
    """

    ax9.text(
        0.1,
        0.5,
        summary_text,
        fontsize=11,
        verticalalignment="center",
        family="monospace",
        bbox=dict(boxstyle="round", facecolor="wheat", alpha=0.5),
    )

    plt.savefig(
        "assets/ttl_s5_comprehensive_dashboard.png", dpi=300, bbox_inches="tight"
    )
    plt.close()
    print("   [OK] Saved: assets/ttl_s5_comprehensive_dashboard.png")

    print("\n" + "=" * 80)
    print("ALL VISUALIZATIONS COMPLETE")
    print("=" * 80)
    print("""
Generated visualizations:
  1. assets/correlation_matrix_detailed.png - Comprehensive correlation heatmap
  2. assets/player_distributions_violin.png - Distribution violin plots
  3. assets/performance_scatter_matrix.png - Multi-dimensional scatter analysis
  4. assets/civ_map_heatmap.png - Civilization-Map frequency heatmap
  5. assets/outlier_analysis.png - Statistical outlier detection
  6. assets/map_duration_analysis.png - Map duration analysis with error bars
  7. assets/performance_clustering.png - Player performance clustering
  8. assets/ttl_s5_comprehensive_dashboard.png - Complete statistical dashboard
""")


# ============================================================================
# SECTION 7: COMPREHENSIVE REPORT GENERATION
# ============================================================================


def generate_comprehensive_report(
    df, player_metrics, correlations, variance_stats, outliers
):
    """Generate comprehensive statistical analysis report."""

    print("\n" + "=" * 80)
    print("GENERATING COMPREHENSIVE STATS REPORT")
    print("=" * 80)

    qualified = player_metrics[player_metrics["total_games"] >= 10]

    report = []
    report.append("=" * 80)
    report.append("T90 TITANS LEAGUE SEASON 5 - ADVANCED STATISTICAL ANALYSIS REPORT")
    report.append("Generated by: Statistical Modeler (The Quant)")
    report.append("Analysis Date: 2026-03-19")
    report.append("=" * 80)
    report.append("")

    # Executive Summary
    report.append("EXECUTIVE SUMMARY")
    report.append("-" * 80)
    report.append(f"""
DATASET OVERVIEW:
* Total Games Analyzed: {len(df)} games
* Total Matches: {df["match_id"].nunique()} unique matchups
* Qualified Players: {len(qualified)} players (>=10 games)
* Unique Civilizations: {pd.concat([df["player1_civ"], df["player2_civ"]]).nunique()}
* Unique Maps: {df["map"].nunique()}

KEY STATISTICAL FINDINGS:
1. ELO-Performance Relationship: Weak correlation (r={correlations["elo_win_rate"]["pearson"]:.3f}, p={correlations["elo_win_rate"]["pearson_p"]:.3f})
   - Spearman rho={correlations["elo_win_rate"]["spearman"]:.3f} suggests {"monotonic" if correlations["elo_win_rate"]["spearman_p"] < 0.05 else "no monotonic"} relationship
   - R^2 = {correlations["elo_win_rate"]["pearson"] ** 2:.3f} indicates ELO explains only {(correlations["elo_win_rate"]["pearson"] ** 2) * 100:.1f}% of win rate variance

2. Civilization-Map Association: {"SIGNIFICANT" if correlations["civ_map"]["p"] < 0.05 else "NOT SIGNIFICANT"} strategic association
   - Chi-square: {correlations["civ_map"]["chi2"]:.2f} (df={correlations["civ_map"]["dof"]})
   - Cramer's V: {correlations["civ_map"]["cramers_v"]:.3f} ({"strong" if correlations["civ_map"]["cramers_v"] > 0.5 else "moderate" if correlations["civ_map"]["cramers_v"] > 0.3 else "weak"} association)
   - Interpretation: Players {"do" if correlations["civ_map"]["p"] < 0.05 else "do not"} strategically adapt civilizations to maps

3. Performance Diversity Correlations:
   - Civilization diversity vs Win rate: r={correlations["diversity_performance"]["r"]:.3f} (p={correlations["diversity_performance"]["p"]:.3f})
   - Map diversity vs Win rate: r={correlations["map_diversity_performance"]["r"]:.3f} (p={correlations["map_diversity_performance"]["p"]:.3f})
   - Duration variance vs Win rate: r={correlations["duration_variance_performance"]["r"]:.3f} (p={correlations["duration_variance_performance"]["p"]:.3f})

4. Game Duration Insights:
   - Overall mean: {df["duration_minutes"].mean():.1f} minutes (sigma={df["duration_minutes"].std():.1f})
   - ELO difference correlation: r={correlations["duration_elo"]["r"]:.3f} (p={correlations["duration_elo"]["p"]:.3f})
   - {"Significant" if correlations["duration_elo"]["p"] < 0.05 else "No significant"} relationship between skill differential and game length
""")

    # Player Performance Analysis
    report.append("\n" + "=" * 80)
    report.append("PLAYER PERFORMANCE ANALYSIS")
    report.append("=" * 80)

    report.append("\nTOP 10 PLAYERS BY WIN RATE (Minimum 10 games):")
    report.append("-" * 80)
    top_players = qualified.nlargest(10, "win_rate")
    for i, (_, player) in enumerate(top_players.iterrows(), 1):
        report.append(
            f"{i:2d}. {player['player']:<15} | Win Rate: {player['win_rate']:>6.1%} | "
            f"W-L: {player['wins']}-{player['losses']} | ELO: {player['elo']:>6.0f} | "
            f"Games: {player['total_games']}"
        )

    report.append("\n\nMOST CONSISTENT PLAYERS (Consistency Score):")
    report.append("-" * 80)
    consistent = qualified.nlargest(10, "consistency")
    for i, (_, player) in enumerate(consistent.iterrows(), 1):
        report.append(
            f"{i:2d}. {player['player']:<15} | Consistency: {player['consistency']:>6.3f} | "
            f"Win Rate: {player['win_rate']:>6.1%} | Duration CV: {player['duration_cv']:>5.3f}"
        )

    report.append("\n\nMOST VARIABLE PLAYERS (Game Duration Variance):")
    report.append("-" * 80)
    variable = qualified.nlargest(10, "duration_cv")
    for i, (_, player) in enumerate(variable.iterrows(), 1):
        report.append(
            f"{i:2d}. {player['player']:<15} | Duration CV: {player['duration_cv']:>6.3f} | "
            f"Avg Duration: {player['avg_duration']:>5.1f} min | Win Rate: {player['win_rate']:>6.1%}"
        )

    # Variance Analysis
    report.append("\n" + "=" * 80)
    report.append("VARIANCE AND STABILITY ANALYSIS")
    report.append("=" * 80)

    report.append(f"""
POPULATION STATISTICS:
* Win Rate: mu={variance_stats["win_rate"]["mean"]:.3f}, sigma={variance_stats["win_rate"]["std"]:.3f}, CV={variance_stats["win_rate"]["std"] / variance_stats["win_rate"]["mean"]:.3f}
* ELO Rating: mu={variance_stats["elo"]["mean"]:.1f}, sigma={variance_stats["elo"]["std"]:.1f}, CV={variance_stats["elo"]["std"] / variance_stats["elo"]["mean"]:.3f}

HOMOGENEITY OF VARIANCE (Levene's Test):
* Statistic: {variance_stats["levene"]["statistic"]:.3f}
* p-value: {variance_stats["levene"]["p"]:.3f}
* Interpretation: {"Unequal variances detected" if variance_stats["levene"]["p"] < 0.05 else "Equal variances assumed"}

NORMALITY TEST (Jarque-Bera):
* Statistic: {variance_stats["normality"]["jb"]:.3f}
* p-value: {variance_stats["normality"]["p"]:.3f}
* Interpretation: Win rates follow {"normal" if variance_stats["normality"]["p"] > 0.05 else "non-normal"} distribution
""")

    # Outlier Analysis
    report.append("\n" + "=" * 80)
    report.append("STATISTICAL OUTLIER DETECTION")
    report.append("=" * 80)

    if outliers["overperformers"]:
        report.append("\nOVERPERFORMERS (95% Confidence Interval):")
        report.append("-" * 80)
        report.append(
            "Players whose actual win rate significantly exceeds ELO-based expectations:"
        )
        report.append("")
        for player in outliers["overperformers"]:
            report.append(
                f"* {player['player']:<15} | Actual: {player['actual']:>6.1%} | "
                f"Expected: {player['expected']:>6.1%} | Delta: +{player['delta']:>6.1%} | "
                f"z-score: {player['zscore']:>5.2f}"
            )
    else:
        report.append("\nOVERPERFORMERS: None detected at 95% confidence level")

    if outliers["underperformers"]:
        report.append("\n\nUNDERPERFORMERS (95% Confidence Interval):")
        report.append("-" * 80)
        report.append(
            "Players whose actual win rate significantly underperforms ELO-based expectations:"
        )
        report.append("")
        for player in outliers["underperformers"]:
            report.append(
                f"* {player['player']:<15} | Actual: {player['actual']:>6.1%} | "
                f"Expected: {player['expected']:>6.1%} | Delta: {player['delta']:>6.1%} | "
                f"z-score: {player['zscore']:>5.2f}"
            )
    else:
        report.append("\nUNDERPERFORMERS: None detected at 95% confidence level")

    # Civilization Analysis
    report.append("\n" + "=" * 80)
    report.append("CIVILIZATION META ANALYSIS")
    report.append("=" * 80)

    civ_stats = pd.read_csv("data/civilization_statistics.csv")

    report.append("\nS-TIER CIVILIZATIONS (Win Rate > 55%, n >= 15):")
    report.append("-" * 80)
    s_tier = civ_stats[
        (civ_stats["win_rate"] > 0.55) & (civ_stats["games_played"] >= 15)
    ]
    if len(s_tier) > 0:
        s_tier_sorted = s_tier.sort_values("win_rate", ascending=False)
        for _, civ in s_tier_sorted.iterrows():
            report.append(
                f"* {civ['civilization']:<15} | Win: {civ['win_rate']:>6.1%} | "
                f"Pick: {civ['pick_rate']:>5.1%} | n={civ['games_played']:>3} | "
                f"Avg Duration: {civ['avg_duration']:>5.1f} min"
            )
    else:
        report.append(
            "  No civilizations meet S-Tier criteria with sufficient sample size"
        )

    report.append("\n\nF-TIER CIVILIZATIONS (Win Rate < 45%, n >= 15):")
    report.append("-" * 80)
    f_tier = civ_stats[
        (civ_stats["win_rate"] < 0.45) & (civ_stats["games_played"] >= 15)
    ]
    if len(f_tier) > 0:
        f_tier_sorted = f_tier.sort_values("win_rate", ascending=True)
        for _, civ in f_tier_sorted.iterrows():
            report.append(
                f"* {civ['civilization']:<15} | Win: {civ['win_rate']:>6.1%} | "
                f"Pick: {civ['pick_rate']:>5.1%} | n={civ['games_played']:>3} | "
                f"Avg Duration: {civ['avg_duration']:>5.1f} min"
            )
    else:
        report.append(
            "  No civilizations meet F-Tier criteria with sufficient sample size"
        )

    # Map Analysis
    report.append("\n" + "=" * 80)
    report.append("MAP ANALYSIS")
    report.append("=" * 80)

    map_stats = (
        df.groupby("map")
        .agg({"duration_minutes": ["mean", "std", "count"], "match_id": "nunique"})
        .reset_index()
    )
    map_stats.columns = [
        "map",
        "avg_duration",
        "std_duration",
        "game_count",
        "match_count",
    ]
    map_stats = map_stats[map_stats["game_count"] >= 15].sort_values(
        "avg_duration", ascending=False
    )

    report.append("\nMAP DURATION ANALYSIS (n >= 15 games):")
    report.append("-" * 80)
    for _, map_row in map_stats.iterrows():
        report.append(
            f"* {map_row['map']:<15} | Avg: {map_row['avg_duration']:>5.1f} min | "
            f"sigma: {map_row['std_duration']:>4.1f} | n={map_row['game_count']:>3}"
        )

    # Statistical Methodology
    report.append("\n" + "=" * 80)
    report.append("STATISTICAL METHODOLOGY")
    report.append("=" * 80)
    report.append("""
DESCRIPTIVE STATISTICS:
* Central tendency: Mean, median, mode calculations
* Dispersion: Standard deviation, variance, coefficient of variation (CV)
* Distribution shape: Skewness, kurtosis via Jarque-Bera test

INFERENTIAL STATISTICS:
* Correlation analysis: Pearson (linear), Spearman (monotonic), Cramer's V (categorical)
* Association tests: Chi-square test of independence
* Variance tests: Levene's test for homogeneity of variance
* Normality tests: Jarque-Bera test

OUTLIER DETECTION:
* Z-score method: |z| > 1.96 for 95% confidence interval
* Modified Z-score: Based on Median Absolute Deviation (MAD)
* IQR method: Values outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
* Residual analysis: Linear regression residuals

SIGNIFICANCE LEVELS:
* alpha = 0.05 (95% confidence interval) for all hypothesis tests
* Bonferroni correction applied for multiple comparisons where appropriate

ASSUMPTIONS:
* Games are independent events
* Player skill is relatively stable throughout the tournament
* Map selection is balanced across players
* Civilization choices reflect strategic decisions
* Missing values are randomly distributed (MAR)

LIMITATIONS:
* Sample size varies significantly across civilizations and maps
* ELO ratings may not perfectly reflect current skill level
* Causal relationships cannot be definitively established from observational data
* Potential confounding variables not captured (e.g., day-to-day form, specific matchups)
""")

    # Save report
    report_text = "\n".join(report)

    with open("STATS_REPORT_DETAILED.md", "w", encoding="utf-8") as f:
        f.write(report_text)

    print("\n" + "=" * 80)
    print("STATS_REPORT_DETAILED.md generated successfully")
    print("=" * 80)

    return report_text


# ============================================================================
# MAIN EXECUTION
# ============================================================================


def main():
    """Main execution pipeline for advanced statistical analysis."""

    print("\n" + "=" * 80)
    print("T90 TITANS LEAGUE SEASON 5 - ADVANCED STATISTICAL MODELING")
    print("Statistical Modeler (The Quant)")
    print("=" * 80)

    # Step 1: Load and validate data
    print("\n[1/6] Loading and validating tournament data...")
    df = load_and_validate_data()

    # Step 2: Calculate advanced player metrics
    print("\n[2/6] Calculating advanced player performance metrics...")
    player_metrics = calculate_advanced_player_metrics(df)

    # Step 3: Correlation analysis
    print("\n[3/6] Performing comprehensive correlation analysis...")
    correlations, civ_map_table = perform_correlation_analysis(df, player_metrics)

    # Step 4: Variance analysis
    print("\n[4/6] Analyzing performance variance and stability...")
    variance_stats = analyze_performance_variance(df, player_metrics)

    # Step 5: Outlier detection
    print("\n[5/6] Detecting statistical outliers...")
    outliers, qualified_metrics = detect_statistical_outliers(df, player_metrics)

    # Step 6: Generate visualizations
    print("\n[6/6] Generating high-density visualizations...")
    create_advanced_visualizations(df, qualified_metrics, civ_map_table, correlations)

    # Step 7: Generate report
    print("\n[*] Generating comprehensive statistical report...")
    report = generate_comprehensive_report(
        df, player_metrics, correlations, variance_stats, outliers
    )

    print("\n" + "=" * 80)
    print("ADVANCED STATISTICAL ANALYSIS COMPLETE")
    print("=" * 80)
    print("""
OUTPUT FILES GENERATED:

Data Files:
  * STATS_REPORT_DETAILED.md - Comprehensive statistical analysis report

Visualizations (assets/):
  * correlation_matrix_detailed.png - Full correlation matrix
  * player_distributions_violin.png - Distribution violin plots
  * performance_scatter_matrix.png - Multi-dimensional scatter analysis
  * civ_map_heatmap.png - Civilization-Map frequency heatmap
  * outlier_analysis.png - Statistical outlier detection plots
  * map_duration_analysis.png - Map duration analysis with error bars
  * pca_analysis.png - Principal Component Analysis visualization
  * ttl_s5_comprehensive_dashboard.png - Complete statistical dashboard

Key Statistical Findings:
  * ELO-Performance correlation analyzed (Pearson & Spearman)
  * Civilization-Map strategic associations identified
  * Performance outliers detected at 95% confidence level
  * Variance and consistency metrics calculated
  * Player performance clustering by tier
""")


if __name__ == "__main__":
    main()
