#!/usr/bin/env python3
"""
T90 Titans League Season 5 Data Scraper
Extracts match results, civ drafts, and map outcomes from Liquipedia
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re
import os
from pathlib import Path
from urllib.parse import urljoin
import json

BASE_URL = "https://liquipedia.net/ageofempires"
DATA_DIR = Path(__file__).parent / "data"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

session = requests.Session()
session.headers.update(HEADERS)


def clean_text(text):
    if text is None:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def normalize_player_name(name):
    if not name:
        return ""
    name = clean_text(name)
    name = re.sub(r"\[.*?\]", "", name)
    name = re.sub(r"\(.*?\)", "", name)
    return name.strip()


def fetch_page(url, retries=3, delay=2):
    for attempt in range(retries):
        try:
            print(f"Fetching: {url} (attempt {attempt + 1}/{retries})")
            time.sleep(delay)
            response = session.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {url}: {e}")
            if attempt < retries - 1:
                print(f"Retrying in {delay * 2} seconds...")
                time.sleep(delay * 2)
    return None


def parse_match_table(soup):
    matches = []
    try:
        tables = soup.find_all("table", class_=["match-table", "wikitable"])
        for table in tables:
            rows = table.find_all("tr")
            for row in rows[1:]:
                cells = row.find_all(["td", "th"])
                if len(cells) >= 3:
                    match_data = {
                        "player1": "",
                        "player2": "",
                        "score": "",
                        "winner": "",
                        "date": "",
                        "map": "",
                        "civ1": "",
                        "civ2": "",
                    }
                    match_data["player1"] = normalize_player_name(cells[0].get_text())
                    if len(cells) > 1:
                        match_data["score"] = cells[1].get_text().strip()
                    if len(cells) > 2:
                        match_data["player2"] = normalize_player_name(
                            cells[2].get_text()
                        )
                    for i, cell in enumerate(cells):
                        text = cell.get_text().lower()
                        if "win" in text or "winner" in text:
                            match_data["winner"] = "player1" if i == 0 else "player2"
                    matches.append(match_data)
    except Exception as e:
        print(f"Error parsing match table: {e}")
    return matches


def parse_brackets(soup):
    matches = []
    try:
        bracket_divs = soup.find_all("div", class_=["bracket", "bracket-wrapper"])
        for bracket in bracket_divs:
            match_divs = bracket.find_all("div", class_="match")
            for match in match_divs:
                match_data = {
                    "player1": "",
                    "player2": "",
                    "score": "",
                    "winner": "",
                    "date": "",
                    "map": "",
                    "civ1": "",
                    "civ2": "",
                }
                players = match.find_all("div", class_="player")
                if len(players) >= 2:
                    match_data["player1"] = normalize_player_name(players[0].get_text())
                    match_data["player2"] = normalize_player_name(players[1].get_text())
                scores = match.find_all("span", class_="score")
                if len(scores) >= 2:
                    match_data["score"] = (
                        f"{scores[0].get_text().strip()}-{scores[1].get_text().strip()}"
                    )
                matches.append(match_data)
    except Exception as e:
        print(f"Error parsing brackets: {e}")
    return matches


def parse_civ_drafts(soup):
    civ_drafts = []
    try:
        draft_sections = soup.find_all(
            ["div", "table"], class_=["civ-draft", "draft-table"]
        )
        for section in draft_sections:
            draft_data = {
                "player": "",
                "civ": "",
                "map": "",
                "result": "",
                "game_number": None,
            }
            draft_data["player"] = normalize_player_name(section.get("data-player", ""))
            draft_data["civ"] = clean_text(section.get("data-civ", ""))
            draft_data["map"] = clean_text(section.get("data-map", ""))
            civ_drafts.append(draft_data)
        draft_tables = soup.find_all("table", string=re.compile(r"civ|draft", re.I))
        for table in draft_tables:
            rows = table.find_all("tr")
            for row in rows[1:]:
                cells = row.find_all("td")
                if cells:
                    draft_data = {
                        "player": "",
                        "civ": "",
                        "map": "",
                        "result": "",
                        "game_number": None,
                    }
                    for i, cell in enumerate(cells):
                        text = clean_text(cell.get_text())
                        if i == 0:
                            draft_data["player"] = normalize_player_name(text)
                        elif i == 1 and "civ" in text.lower():
                            draft_data["civ"] = text
                        elif "map" in text.lower():
                            draft_data["map"] = text
                    if draft_data["player"] or draft_data["civ"]:
                        civ_drafts.append(draft_data)
    except Exception as e:
        print(f"Error parsing civ drafts: {e}")
    return civ_drafts


def parse_map_results(soup):
    map_results = []
    try:
        map_tables = soup.find_all("table", class_=["map-table", "wikitable"])
        for table in map_tables:
            headers = [clean_text(th.get_text()) for th in table.find_all("th")]
            if any("map" in h.lower() for h in headers):
                rows = table.find_all("tr")
                for row in rows[1:]:
                    cells = row.find_all("td")
                    if cells:
                        map_data = {
                            "map_name": "",
                            "player1": "",
                            "player2": "",
                            "winner": "",
                            "civ1": "",
                            "civ2": "",
                            "duration": "",
                        }
                        for i, cell in enumerate(cells):
                            text = clean_text(cell.get_text())
                            if i < len(headers):
                                header = headers[i].lower()
                                if "map" in header:
                                    map_data["map_name"] = text
                                elif "winner" in header:
                                    map_data["winner"] = normalize_player_name(text)
                                elif "player" in header and "1" in header:
                                    map_data["player1"] = normalize_player_name(text)
                                elif "player" in header and "2" in header:
                                    map_data["player2"] = normalize_player_name(text)
                                elif "civ" in header and "1" in header:
                                    map_data["civ1"] = text
                                elif "civ" in header and "2" in header:
                                    map_data["civ2"] = text
                                elif "duration" in header or "time" in header:
                                    map_data["duration"] = text
                        if map_data["map_name"]:
                            map_results.append(map_data)
    except Exception as e:
        print(f"Error parsing map results: {e}")
    return map_results


def parse_tournament_page(html):
    soup = BeautifulSoup(html, "html.parser")
    all_matches = []
    all_civ_drafts = []
    all_map_results = []
    print("Parsing match tables...")
    all_matches.extend(parse_match_table(soup))
    print("Parsing brackets...")
    all_matches.extend(parse_brackets(soup))
    print("Parsing civ drafts...")
    all_civ_drafts.extend(parse_civ_drafts(soup))
    print("Parsing map results...")
    all_map_results.extend(parse_map_results(soup))
    tournament_info = {}
    info_box = soup.find("div", class_=["infobox", "info-box"])
    if info_box:
        for row in info_box.find_all("tr"):
            cells = row.find_all(["th", "td"])
            if len(cells) >= 2:
                key = clean_text(cells[0].get_text())
                value = clean_text(cells[1].get_text())
                tournament_info[key] = value
    return {
        "matches": all_matches,
        "civ_drafts": all_civ_drafts,
        "map_results": all_map_results,
        "tournament_info": tournament_info,
    }


def save_data(data, output_dir):
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    if data["matches"]:
        df_matches = pd.DataFrame(data["matches"])
        df_matches = df_matches.dropna(how="all")
        df_matches.to_csv(output_dir / "matches.csv", index=False)
        print(f"Saved {len(df_matches)} matches to matches.csv")
    if data["civ_drafts"]:
        df_civs = pd.DataFrame(data["civ_drafts"])
        df_civs = df_civs.dropna(how="all")
        df_civs.to_csv(output_dir / "civ_drafts.csv", index=False)
        print(f"Saved {len(df_civs)} civ drafts to civ_drafts.csv")
    if data["map_results"]:
        df_maps = pd.DataFrame(data["map_results"])
        df_maps = df_maps.dropna(how="all")
        df_maps.to_csv(output_dir / "map_results.csv", index=False)
        print(f"Saved {len(df_maps)} map results to map_results.csv")
    if data["tournament_info"]:
        with open(output_dir / "tournament_info.json", "w") as f:
            json.dump(data["tournament_info"], f, indent=2)
        print(f"Saved tournament info to tournament_info.json")


def scrape_season_5():
    urls_to_try = [
        f"{BASE_URL}/T90_Titans_League/Season_5",
        f"{BASE_URL}/T90_Titans_League_Season_5",
        f"{BASE_URL}/T90_Titans_League",
    ]
    for url in urls_to_try:
        print(f"\nTrying URL: {url}")
        html = fetch_page(url)
        if html:
            with open("ttl_s5_raw_new.html", "w", encoding="utf-8") as f:
                f.write(html)
            print(f"Saved raw HTML to ttl_s5_raw_new.html")
            data = parse_tournament_page(html)
            if any([data["matches"], data["civ_drafts"], data["map_results"]]):
                save_data(data, DATA_DIR)
                return data
            else:
                print(f"No data found at {url}")
        else:
            print(f"Failed to fetch {url}")
    print("\nNo data could be extracted from any URL.")
    print("Creating empty data files as placeholders...")
    save_data(
        {"matches": [], "civ_drafts": [], "map_results": [], "tournament_info": {}},
        DATA_DIR,
    )
    return None


if __name__ == "__main__":
    print("=" * 60)
    print("T90 Titans League Season 5 Scraper")
    print("=" * 60)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    scrape_season_5()
    print("\n" + "=" * 60)
    print("Scraping complete!")
    print("=" * 60)
