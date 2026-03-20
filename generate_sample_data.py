#!/usr/bin/env python3
"""
T90 Titans League Season 5 - Sample Data Generator
Generates realistic sample data for testing ETL pipeline
"""

import pandas as pd
import random
from datetime import datetime, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

PLAYERS = [
    "TheViper",
    "Hera",
    "Yo",
    "Liereyy",
    "Hearttt",
    "Daut",
    "MbL",
    "Villese",
    "Erik",
    "Capoch",
    "Nicov",
    "Tatoh",
    "LaaaN",
    "Barles",
    "JorDan",
    "slam",
    "BL4CKHAWK",
    "Sebastian",
    "Edie",
    "MrGreed",
]

CIVS = [
    "Aztecs",
    "Berbers",
    "Britons",
    "Burgundians",
    "Byzantines",
    "Celts",
    "Chinese",
    "Cumans",
    "Ethiopians",
    "Franks",
    "Goths",
    "Huns",
    "Indians",
    "Incas",
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
    "Portuguese",
    "Saracens",
    "Slavs",
    "Spanish",
    "Teutons",
    "Turks",
    "Vietnamese",
    "Vikings",
    "Bulgarians",
    "Burgundians",
    "Sicilians",
    "Poles",
    "Bohemians",
]

MAPS = [
    "Arabia",
    "Arena",
    "Coastal",
    "Hideout",
    "Runestones",
    "Hill Fort",
    "Mongolia",
    "Steppe",
    "Valley",
    "Acropolis",
    "Gold Rush",
    "Islands",
    "Nomad",
    "Atacama",
    "African Clearing",
    "Baltic",
    "Black Forest",
    "Continental",
    "Crater Lake",
    "Fortress",
]


def generate_match_id(round_num, match_num):
    return f"T90S5_R{round_num:02d}_M{match_num:02d}"


def generate_sample_data():
    print("Generating sample match data...")
    matches = []
    civ_drafts = []
    map_results = []
    players_data = []
    round_names = [
        "Group Stage - Week1",
        "Group Stage - Week 2",
        "Group Stage - Week 3",
        "Group Stage - Week4",
        "Round of 16",
        "Quarterfinals",
        "Semifinals",
        "Grand Final",
    ]
    match_counter = 0
    for round_idx, round_name in enumerate(round_names, 1):
        matches_in_round = 8 if round_idx <= 4 else (8 // (2 ** (round_idx - 5)))
        for match_in_round in range(1, matches_in_round + 1):
            match_counter += 1
            match_id = generate_match_id(round_idx, match_in_round)
            player1 = random.choice(PLAYERS)
            available_players = [p for p in PLAYERS if p != player1]
            player2 = random.choice(available_players)
            if player1 > player2:
                player1, player2 = player2, player1
            games_played = random.choice([3, 4, 5])
            if games_played == 3:
                p1_wins = 2
                p2_wins = random.choice([0, 1])
            elif games_played == 4:
                p1_wins = random.choice([3, 1])
                p2_wins = 1 if p1_wins == 3 else 3
            else:
                p1_wins = random.choice([3, 2])
                p2_wins = 5 - p1_wins
            winner = player1 if p1_wins > p2_wins else player2
            base_date = datetime(2024, 1, 1) + timedelta(days=round_idx * 7)
            match_date = base_date + timedelta(days=random.randint(0, 6))
            matches.append(
                {
                    "match_id": match_id,
                    "round": round_name,
                    "player1": player1,
                    "player2": player2,
                    "score": f"{max(p1_wins, p2_wins)}-{min(p1_wins, p2_wins)}",
                    "winner": winner,
                    "date": match_date.strftime("%Y-%m-%d"),
                    "best_of": 5,
                    "vod_url": f"https://youtube.com/watch?v=T90S5_{match_counter}",
                }
            )
            for game_num in range(1, games_played + 1):
                game_map = random.choice(MAPS)
                civ1 = random.choice(CIVS)
                civ2 = random.choice([c for c in CIVS if c != civ1])
                game_winner = player1 if game_num <= p1_wins else player2
                map_results.append(
                    {
                        "match_id": match_id,
                        "game_number": game_num,
                        "map": game_map,
                        "player1": player1,
                        "player2": player2,
                        "player1_civ": civ1,
                        "player2_civ": civ2,
                        "winner": game_winner,
                        "duration": f"{random.randint(20, 45)}:{random.randint(0, 59):02d}",
                        "player1_score": random.randint(1000, 5000),
                        "player2_score": random.randint(1000, 5000),
                    }
                )
            for draft_round in range(1, 4):
                civ_drafts.append(
                    {
                        "match_id": match_id,
                        "game_number": random.randint(1, games_played),
                        "map": random.choice(MAPS),
                        "player1_civ": random.choice(CIVS),
                        "player2_civ": random.choice(CIVS),
                        "player1_civ_draft_order": draft_round,
                        "player2_civ_draft_order": draft_round,
                        "winner_civ": random.choice([player1, player2]),
                        "winner": winner,
                    }
                )
    player_info = {
        "TheViper": ("NOR", "Team Name", 1),
        "Hera": ("CAN", "Hera", 2),
        "Yo": ("CHN", "Team Yo", 3),
        "Liereyy": ("AUT", "Team Liereyy", 4),
        "Hearttt": ("FIN", "Team Hearttt", 5),
    }
    for player in PLAYERS:
        country, team, seed = player_info.get(
            player, ("UNK", "Unknown", random.randint(6, 20))
        )
        players_data.append(
            {
                "player_id": f"P{PLAYERS.index(player) + 1:03d}",
                "player_name": player,
                "player_name_variants": player,
                "team": team,
                "country": country,
                "seed": seed,
            }
        )
    df_matches = pd.DataFrame(matches)
    df_matches.to_csv(DATA_DIR / "matches.csv", index=False)
    print(f"Saved {len(matches)} matches to matches.csv")
    df_civ_drafts = pd.DataFrame(civ_drafts)
    df_civ_drafts.to_csv(DATA_DIR / "civ_drafts.csv", index=False)
    print(f"Saved {len(civ_drafts)} civ drafts to civ_drafts.csv")
    df_map_results = pd.DataFrame(map_results)
    df_map_results.to_csv(DATA_DIR / "map_results.csv", index=False)
    print(f"Saved {len(map_results)} map results to map_results.csv")
    df_players = pd.DataFrame(players_data)
    df_players.to_csv(DATA_DIR / "players.csv", index=False)
    print(f"Saved {len(players_data)} players to players.csv")
    tournament_info = {
        "tournament_name": "T90 Titans League Season 5",
        "start_date": "2024-01-01",
        "end_date": "2024-03-31",
        "prize_pool": 50000,
        "currency": "USD",
        "location": "Online",
        "game": "Age of Empires II: Definitive Edition",
        "format": "Double elimination bracket with group stage",
        "total_players": 20,
        "organizer": "T90Official",
        "links": {
            "liquipedia": "https://liquipedia.net/ageofempires/T90_Titans_League/Season_5",
            "challonge": "",
            "youtube": "https://youtube.com/@T90Official",
        },
    }
    import json

    with open(DATA_DIR / "tournament_info.json", "w", encoding="utf-8") as f:
        json.dump(tournament_info, f, indent=2)
    print("Saved tournament info to tournament_info.json")


if __name__ == "__main__":
    print("=" * 60)
    print("T90 Titans League Season 5 - Sample Data Generator")
    print("=" * 60)
    generate_sample_data()
    print("\n" + "=" * 60)
    print("Sample data generation complete!")
    print("=" * 60)
