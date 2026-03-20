import path from "path";
import fs from "fs";

function resolveDataDir(): string {
  // Allow override via environment variable
  if (process.env.DATA_DIR) {
    return process.env.DATA_DIR;
  }

  // In standalone mode, check if data is at the project root
  const projectRoot = path.resolve(process.cwd(), "..");
  const projectDataDir = path.join(projectRoot, "data");
  if (fs.existsSync(projectDataDir)) {
    return projectDataDir;
  }

  // Check if data is bundled in the standalone output
  const standaloneDataDir = path.join(process.cwd(), "data");
  if (fs.existsSync(standaloneDataDir)) {
    return standaloneDataDir;
  }

  // Default fallback for development
  return projectDataDir;
}

const DATA_DIR = resolveDataDir();

export function dataFilePath(filename: string): string {
  const full = path.join(DATA_DIR, filename);
  if (!fs.existsSync(full)) {
    throw new Error(`Data file not found: ${full}`);
  }
  return full;
}

export function getDataDir(): string {
  return DATA_DIR;
}
