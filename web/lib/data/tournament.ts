import fs from "fs";
import type { TournamentInfo } from "@/lib/types";
import { dataFilePath } from "./paths";

export function getTournamentInfo(): TournamentInfo {
  const raw = fs.readFileSync(dataFilePath("tournament_info.json"), "utf-8");
  const json = JSON.parse(raw);
  return {
    tournamentName: json.tournament_name,
    startDate: json.start_date,
    endDate: json.end_date,
    prizePool: json.prize_pool,
    currency: json.currency,
    location: json.location,
    game: json.game,
    format: json.format,
    totalPlayers: json.total_players,
    organizer: json.organizer,
    links: {
      liquipedia: json.links?.liquipedia ?? "",
      challonge: json.links?.challonge || null,
      youtube: json.links?.youtube || null,
    },
  };
}
