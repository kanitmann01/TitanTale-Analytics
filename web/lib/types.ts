// Player types
export interface Player {
  player_id: string
  player_name: string
  player_name_variants: string
  team: string | null
  country: string | null
  seed: number | null
}

export interface PlayerStats {
  player: string
  total_games: number
  wins: number
  losses: number
  win_rate: number
  elo: number | null
  avg_game_duration: number
  unique_civs: number
  unique_maps: number
}

// player_civs.csv - civilization stats by player/league
export interface PlayerCivStats {
  league: string
  civilization: string
  wins: number
  losses: number
  winrate: string
  total_games: number
}

// Match/Game types - actual game-by-game data
export interface TTLMatch {
  match_id: number
  game_number: number
  player1: string
  player2: string
  winner: string
  loser: string
  player1_civ: string
  player2_civ: string
  map: string
  duration_minutes: number
  stage: string
  player1_elo: number
  player2_elo: number
}

// Group standings from matches.csv
export interface GroupStanding {
  league: string
  group: string
  player: string
  standings_snapshot: string
}

// Civilization types
export interface CivDraft {
  match_id: string
  game_number: number
  map: string
  player1_civ: string
  player2_civ: string
  player1_civ_draft_order: number | null
  player2_civ_draft_order: number | null
  winner_civ: string
  winner: string
}

export interface CivilizationStats {
  civilization: string
  games_played: number
  wins: number
  losses: number
  win_rate: number
  pick_rate: number
  avg_duration: number
}

// Map types
export interface MapResult {
  match_id: string
  game_number: number
  map: string
  player1: string
  player2: string
  player1_civ: string
  player2_civ: string
  winner: string
  duration: string
  player1_score: number | null
  player2_score: number | null
}

export interface MapStats {
  map: string
  total_games: number
  avg_duration: number
  most_common_civ: string
  balance_std: number
}

// map_outcomes.csv - map play rates by league
export interface MapOutcome {
  league: string
  map: string
  num_games: number
  play_rate: string
}

// Tournament metadata
export interface TournamentInfo {
  tournamentName: string
  startDate: string
  endDate: string
  prizePool: number
  currency: string
  location: string
  game: string
  format: string
  totalPlayers: number
  organizer: string
  links: {
    liquipedia: string
    challonge: string | null
    youtube: string | null
  }
}

// Enhanced Player Profile types
export interface PlayerMatchHistory {
  match_id: number
  game_number: number
  opponent: string
  player_civ: string
  opponent_civ: string
  map: string
  duration_minutes: number
  result: 'win' | 'loss'
  stage: string
  player_elo: number
  opponent_elo: number
}

export interface PlayerCivPreference {
  civilization: string
  games_played: number
  wins: number
  losses: number
  win_rate: number
}

export interface PlayerProfile {
  player_name: string
  total_games: number
  wins: number
  losses: number
  win_rate: number
  elo: number | null
  avg_game_duration: number
  unique_civs: number
  unique_maps: number
  match_history: PlayerMatchHistory[]
  civ_preferences: PlayerCivPreference[]
}

// Civ Matchup types
export interface CivMatchup {
  civilization1: string
  civilization2: string
  games_played: number
  civ1_wins: number
  civ2_wins: number
  civ1_win_rate: number
  avg_duration: number
}

// Spirit investigation types
export interface ClutchFactor {
  player: string;
  overall_wr: number;
  clutch_wr: number;
  clutch_n: number;
  delta: number;
  p_value: number;
}

export interface PlayerMapAffinity {
  player: string;
  map: string;
  map_wr: number;
  overall_wr: number;
  delta: number;
  map_n: number;
  p_value: number;
}

export interface SpiritCivMatchup {
  civ_a: string;
  civ_b: string;
  civ_a_wins: number;
  total: number;
  win_rate: number;
  p_value: number;
}

export interface UpsetProbability {
  elo_bin: string;
  n: number;
  actual_fav_wr: number;
  expected_fav_wr: number;
  actual_upset_rate: number;
  expected_upset_rate: number;
  volatility_factor: number;
}

// New export types
export interface PlayerH2H {
  player_a: string;
  player_b: string;
  series_winner: string;
  a_game_wins: number;
  b_game_wins: number;
  total_games: number;
  maps_played: string;
  a_civs: string;
  b_civs: string;
  avg_duration: number;
  elo_diff: number;
}

export interface PlayerAdvancedMetrics {
  player: string;
  elo: number;
  win_rate: number;
  total_games: number;
  duration_cv: number;
  position_bias: number;
  p1_win_rate: number;
  p2_win_rate: number;
  civ_diversity: number;
  unique_civs: number;
  consistency: number | null;
  expected_win_rate: number;
  performance_residual: number;
  performance_tier: string;
}

export interface ScoutingReport {
  player_a: string;
  player_b: string;
  a_best_maps: string;
  b_best_maps: string;
  contested_maps: string;
  a_weak_maps: string;
  a_signature_civs: string;
  b_signature_civs: string;
  civ_overlap: string;
  elo_edge: string;
  upset_probability: number;
}

export interface DraftPositionOutcome {
  draft_position: number;
  total_picks: number;
  unique_civs: number;
  top_civs: string;
  top_maps: string;
}

// Map Breakdown types
export interface MapCivPopularity {
  civilization: string
  games_played: number
  pick_rate: number
  win_rate: number
}

export interface MapDurationTrend {
  duration_bucket: string
  games_count: number
  avg_duration: number
}

export interface MapBreakdown {
  map: string
  total_games: number
  avg_duration: number
  most_common_civ: string
  balance_std: number
  civ_popularity: MapCivPopularity[]
  duration_trends: MapDurationTrend[]
}