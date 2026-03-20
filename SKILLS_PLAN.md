# SKILLS_PLAN

## Overview
This file defines the agent-safe tool contract for the future `src/scraper.py` and `src/modeler.py` modules described in `PLAN.md`.

The goal is to give Cursor Composer and downstream agents rigid boundaries:
- each tool does one job;
- each tool accepts explicit, validated inputs;
- each tool returns one final status string;
- each tool writes artifacts only to `/data`, `/assets`, or `/logs`;
- each tool fails with readable, normalized error strings instead of noisy stack traces or ad hoc `print()` output.

This contract treats the current top-level scripts as reference implementations only:
- `scraper.py` shows likely ETL parsing seams;
- `analyze_real_data.py` shows analysis and plotting seams;
- `advanced_statistical_analysis.py` shows deeper correlation and outlier seams.

The contract below is the target interface for future atomic tools. It is intentionally narrower than the current scripts.

## General Contract Rules
These rules apply to every tool in `src/scraper.py` and `src/modeler.py`.

1. Use strict type hints on every function signature.
2. Validate every input at the top of the function before doing network, file, DataFrame, or plotting work.
3. If a value can be safely cast, cast it explicitly. If it cannot, return a readable type error string.
4. Wrap the full execution path in `try/except`, catching specific exceptions first.
5. Do not use `print()` for data payloads, tables, previews, or metrics.
6. Return exactly one final status string to the caller.
7. Log verbose diagnostic detail to `/logs/etl.log` or `/logs/modeler.log` when useful, but keep the returned string short and machine-readable.
8. Never rely on the current working directory. Resolve all paths explicitly from function arguments.
9. Create missing parent directories only for approved output folders: `/data`, `/assets`, `/logs`.
10. Plotting tools must be headless-safe and must not require a GUI session.
11. All markdown, logs, and returned strings must remain ASCII-safe.

## Status String Standard
Every tool must return one string in one of these formats:

- Success: `Success: <artifact_or_action>`
- Error: `Error: <specific_reason>`

Examples:
- `Success: matches.csv saved to data/matches.csv`
- `Success: correlation_matrix.png saved to assets/correlation_matrix.png`
- `Error: invalid season value 'five'; expected integer`
- `Error: column 'win_rate' contains non-numeric data`
- `Error: table not found on page`

## Approved Data Schemas
To keep tools composable, the future implementation should standardize on these CSV outputs:

- `data/matches.csv`
- `data/civ_drafts.csv`
- `data/map_results.csv`

Recommended minimum columns:

### `matches.csv`
- `match_id`
- `stage`
- `date`
- `player1`
- `player2`
- `winner`
- `loser`
- `score`

### `civ_drafts.csv`
- `match_id`
- `map`
- `player1_civ`
- `player2_civ`
- `winner`

### `map_results.csv`
- `match_id`
- `map`
- `player1`
- `player2`
- `winner`
- `duration_minutes`

If a downstream analysis tool requires additional columns, that requirement must be stated in its contract.

## Tool Contracts: Data Engineer
These tools belong in future `src/scraper.py`.

### 1. `fetch_liquipedia_html`
Tool: `fetch_liquipedia_html(url: str, output_html_path: str, delay_seconds: float = 2.0, retries: int = 3) -> str`

Input:
- `url`: a non-empty HTTP or HTTPS URL
- `output_html_path`: target path for the raw HTML snapshot
- `delay_seconds`: non-negative delay between requests
- `retries`: integer greater than or equal to 1

Behavior:
- fetch one Liquipedia page;
- save the raw HTML snapshot;
- do not parse tables yet.

Success output:
- `Success: raw HTML saved to <output_html_path>`

Error outputs:
- `Error: invalid url '<url>'`
- `Error: invalid retries value '<value>'; expected integer >= 1`
- `Error: request timed out`
- `Error: received HTTP 403 from source page`
- `Error: failed to save HTML to <output_html_path>`

### 2. `scrape_liquipedia_matches`
Tool: `scrape_liquipedia_matches(url: str, season: int, output_csv_path: str) -> str`

Input:
- `url`: the target Liquipedia page
- `season`: integer season identifier
- `output_csv_path`: target CSV path, normally `data/matches.csv`

Behavior:
- validate `season`;
- fetch and parse match tables or bracket structures;
- normalize player names;
- write a clean match-level CSV.

Minimum output columns:
- `match_id`
- `stage`
- `date`
- `player1`
- `player2`
- `winner`
- `loser`
- `score`

Success output:
- `Success: matches.csv saved to <output_csv_path>`

Error outputs:
- `Error: invalid season value '<value>'; expected integer`
- `Error: table not found on page`
- `Error: no match rows extracted from source page`
- `Error: failed to write CSV to <output_csv_path>`

### 3. `extract_civ_drafts`
Tool: `extract_civ_drafts(html_path: str, output_csv_path: str) -> str`

Input:
- `html_path`: path to a previously saved raw HTML file
- `output_csv_path`: target CSV path, normally `data/civ_drafts.csv`

Behavior:
- read local HTML only;
- extract civilization drafts from stable page structures;
- return an explicit error if the page does not contain draft data.

Minimum output columns:
- `match_id`
- `map`
- `player1_civ`
- `player2_civ`
- `winner`

Success output:
- `Success: civ_drafts.csv saved to <output_csv_path>`

Error outputs:
- `Error: HTML file not found at <html_path>`
- `Error: civ draft table not found in HTML`
- `Error: extracted draft data is empty`
- `Error: failed to write CSV to <output_csv_path>`

### 4. `extract_map_results`
Tool: `extract_map_results(html_path: str, output_csv_path: str) -> str`

Input:
- `html_path`: path to a previously saved raw HTML file
- `output_csv_path`: target CSV path, normally `data/map_results.csv`

Behavior:
- read local HTML only;
- extract map-level results;
- normalize winners and duration fields if present.

Minimum output columns:
- `match_id`
- `map`
- `player1`
- `player2`
- `winner`
- `duration_minutes`

Success output:
- `Success: map_results.csv saved to <output_csv_path>`

Error outputs:
- `Error: HTML file not found at <html_path>`
- `Error: map results table not found in HTML`
- `Error: extracted map results are empty`
- `Error: failed to write CSV to <output_csv_path>`

### 5. `normalize_match_outputs`
Tool: `normalize_match_outputs(matches_csv_path: str, civ_drafts_csv_path: str, map_results_csv_path: str) -> str`

Input:
- paths to the three generated CSV files

Behavior:
- re-open each CSV;
- normalize casing and whitespace;
- standardize missing values to pandas-safe nulls;
- confirm required columns exist;
- overwrite the cleaned files in place.

Success output:
- `Success: cleaned CSVs validated and normalized`

Error outputs:
- `Error: required file not found at <path>`
- `Error: missing required column '<column_name>' in <file_name>`
- `Error: duplicate match_id values detected in matches.csv`
- `Error: winner column contains names not present in player columns`

### 6. `run_etl_pipeline`
Tool: `run_etl_pipeline(url: str, season: int, data_dir: str, html_snapshot_path: str) -> str`

Input:
- `url`
- `season`
- `data_dir`
- `html_snapshot_path`

Behavior:
- orchestrate the five Data Engineer tools above in sequence;
- stop at the first failure;
- return only the final pipeline status string.

Success output:
- `Success: ETL pipeline completed; CSVs saved to <data_dir>`

Error outputs:
- bubble up the first normalized error from any sub-step without adding extra formatting.

Note:
- this is the only allowed orchestration helper in `src/scraper.py`;
- it must call atomic tools rather than re-implement their logic inline.

## Tool Contracts: Statistical Modeler
These tools belong in future `src/modeler.py`.

### 1. `load_clean_dataset`
Tool: `load_clean_dataset(csv_path: str, required_columns: list[str]) -> str`

Input:
- `csv_path`: path to a cleaned CSV
- `required_columns`: list of required column names

Behavior:
- validate the file exists;
- validate the file is readable by pandas;
- validate all required columns are present;
- prepare the file for downstream analysis.

Success output:
- `Success: dataset validated at <csv_path>`

Error outputs:
- `Error: CSV file not found at <csv_path>`
- `Error: CSV is empty at <csv_path>`
- `Error: missing required column '<column_name>'`
- `Error: failed to parse CSV at <csv_path>`

Note:
- this function returns a status string by contract;
- implementation may also expose an internal helper for DataFrame loading, but that helper is not an agent-facing tool.

### 2. `calculate_win_rates`
Tool: `calculate_win_rates(csv_path: str, group_by_col: str, output_csv_path: str) -> str`

Input:
- `csv_path`: input data source
- `group_by_col`: usually `player1_civ`, `player2_civ`, `player`, or another categorical dimension
- `output_csv_path`: saved summary CSV path

Behavior:
- compute grouped wins, losses, total games, and win rate;
- write the summarized table to disk.

Success output:
- `Success: win rate summary saved to <output_csv_path>`

Error outputs:
- `Error: column '<group_by_col>' not found`
- `Error: required winner column not found`
- `Error: no rows available for win rate calculation`
- `Error: failed to write CSV to <output_csv_path>`

### 3. `generate_correlation_matrix`
Tool: `generate_correlation_matrix(csv_path: str, target_columns: list[str], output_png_path: str) -> str`

Input:
- `csv_path`: path to a clean analysis-ready CSV
- `target_columns`: list of numeric columns to correlate
- `output_png_path`: target path, normally under `assets/`

Behavior:
- validate every target column exists;
- validate every target column is numeric or safely castable;
- render a seaborn heatmap using a headless backend.

Success output:
- `Success: correlation_matrix.png saved to <output_png_path>`

Error outputs:
- `Error: column '<column_name>' not found`
- `Error: column '<column_name>' contains non-numeric data`
- `Error: fewer than 2 numeric columns available for correlation`
- `Error: failed to save plot to <output_png_path>`

### 4. `plot_civ_distributions`
Tool: `plot_civ_distributions(csv_path: str, category_col: str, value_col: str, output_png_path: str) -> str`

Input:
- `csv_path`
- `category_col`: categorical axis, usually civilization or map
- `value_col`: numeric axis, usually win rate, games, or duration
- `output_png_path`

Behavior:
- generate a high-density seaborn plot suitable for category comparison;
- support violin plot or box plot behavior depending on the data shape.

Success output:
- `Success: civ_distribution_plot.png saved to <output_png_path>`

Error outputs:
- `Error: column '<category_col>' not found`
- `Error: column '<value_col>' contains non-numeric data`
- `Error: dataset has no rows to plot`
- `Error: failed to save plot to <output_png_path>`

### 5. `detect_outliers`
Tool: `detect_outliers(csv_path: str, group_col: str, metric_col: str, output_csv_path: str, z_threshold: float = 2.0) -> str`

Input:
- `csv_path`
- `group_col`
- `metric_col`
- `output_csv_path`
- `z_threshold`: positive float

Behavior:
- validate group and metric columns;
- compute z-score or another explicit outlier rule;
- save only the flagged records or grouped entities.

Success output:
- `Success: outliers report saved to <output_csv_path>`

Error outputs:
- `Error: column '<group_col>' not found`
- `Error: column '<metric_col>' contains non-numeric data`
- `Error: invalid z_threshold '<value>'; expected positive float`
- `Error: insufficient rows for outlier detection`

### 6. `run_eda_pipeline`
Tool: `run_eda_pipeline(matches_csv_path: str, civ_drafts_csv_path: str, map_results_csv_path: str, assets_dir: str) -> str`

Input:
- the three cleaned CSVs plus the assets output directory

Behavior:
- validate the three core inputs;
- generate at minimum one win-rate summary, one correlation matrix, one civilization distribution plot, and one outlier report;
- stop at the first failure.

Success output:
- `Success: EDA pipeline completed; assets saved to <assets_dir>`

Error outputs:
- bubble up the first normalized error from any sub-step without adding extra formatting.

Note:
- like `run_etl_pipeline`, this function should only orchestrate atomic tools.

## Defensive Programming Prompt Strategy
When asking Composer to generate or revise a tool, use the contract file directly in the prompt.

Recommended prompt pattern:

```text
Read @SKILLS_PLAN.md and implement the `scrape_liquipedia_matches` tool in @src/scraper.py.

Requirements:
- Follow the exact tool contract from `SKILLS_PLAN.md`.
- Use strict type hinting.
- Validate every input before execution.
- If `season` is passed as a string, cast it safely if possible; otherwise return a clean type error string.
- Wrap the entire execution path in try/except.
- Catch specific exceptions before the general exception case.
- Do not use print() for data output.
- Return exactly one final status string.
- If detailed diagnostics are needed, write them to a log file instead of stdout.
- Do not implement extra features outside the contract.
```

Additional prompt constraints for every agent-safe tool:
- `Do not change the function name or argument order from SKILLS_PLAN.md.`
- `Do not read from or write to paths that are not passed in or explicitly defined by the contract.`
- `Do not return dictionaries, DataFrames, tuples, or booleans from the public tool function. Return one status string only.`
- `Use pandas and seaborn defensively around NaN values.`
- `For plotting code, force a headless backend before importing pyplot or rendering figures.`
- `Close figures after saving to avoid memory leaks in repeated agent runs.`
- `If a required column is missing, return a normalized error string instead of raising an uncaught exception.`
- `Prefer small internal helpers over one large function body.`

## Dry Run Test Plan
Before any tool is handed to another agent, create `test_skills.py` and run it locally.

The dry run suite should use:
- standard Python assertions;
- temporary directories or clearly named test artifacts;
- dummy CSV fixtures with a few rows each;
- a safe local HTML fixture instead of repeated live requests whenever possible.

### Test Coverage: `src/scraper.py`
Create fixture HTML files that cover:
- a valid match table page;
- a valid civ draft page;
- a valid map result page;
- a malformed page with no relevant tables.

Minimum assertions:
- `fetch_liquipedia_html` returns a success string when saving a fixture or mocked response.
- `scrape_liquipedia_matches` writes a non-empty CSV with the required columns.
- `extract_civ_drafts` writes `civ_drafts.csv` with expected columns.
- `extract_map_results` writes `map_results.csv` with expected columns.
- invalid `season` input returns a clean error string.
- missing HTML file returns a clean error string.
- malformed HTML returns a clean table-not-found error string.

### Test Coverage: `src/modeler.py`
Create dummy CSV fixtures for:
- normal numeric analysis data;
- a CSV with NaN values in numeric columns;
- a CSV with a non-numeric value in a required numeric column;
- a CSV missing one required column.

Minimum assertions:
- `load_clean_dataset` validates a well-formed CSV.
- `calculate_win_rates` writes a summary CSV with expected columns.
- `generate_correlation_matrix` saves a PNG into `/assets`.
- `plot_civ_distributions` saves a PNG into `/assets`.
- `detect_outliers` writes a CSV report.
- missing columns return normalized error strings.
- non-numeric target columns return normalized error strings.
- NaN values do not crash the tool when pandas can handle them safely.

### Headless Plotting Requirements
All plotting tests must confirm the code works without a GUI.

Implementation requirements:
- set matplotlib to `Agg` before `pyplot` usage;
- save figures directly to file;
- call `plt.close()` after each figure;
- do not call `plt.show()`.

Assertions:
- the PNG file exists after the tool runs;
- the PNG file size is greater than zero;
- the returned string is the expected success string.

### Local Test Execution
Run the suite with a direct command such as:

```text
python test_skills.py
```

The suite passes only if:
- every tool returns the exact expected success or error string pattern;
- every CSV artifact is created where expected;
- every PNG artifact renders successfully in headless mode;
- no uncaught exception escapes to the terminal.

## Expansion Rules
Keep future skills atomic.

Preferred next tools:
- `calculate_player_win_rates`
- `calculate_civ_win_rates`
- `plot_map_distributions`
- `detect_player_outliers`
- `generate_variance_summary`

Avoid these anti-patterns:
- one `analyze_data()` function with many unrelated flags;
- public tools with 10 to 15 parameters;
- public tools that both compute metrics and write multiple unrelated artifacts;
- public tools that mix fetching, parsing, cleaning, plotting, and reporting in one call.

The Principal Data Scientist agent should orchestrate a narrative from multiple small tool calls rather than depend on one monolithic script.
