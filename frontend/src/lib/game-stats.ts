const STORAGE_KEY = "animeguess-stats";

export interface GameStats {
  wins: number;
  losses: number;
  streak: number; // positive = win streak, negative = loss streak
}

export function getStats(): GameStats {
  if (typeof window === "undefined") return { wins: 0, losses: 0, streak: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { wins: 0, losses: 0, streak: 0 };
    return JSON.parse(raw) as GameStats;
  } catch {
    return { wins: 0, losses: 0, streak: 0 };
  }
}

export function recordWin(): GameStats {
  const stats = getStats();
  stats.wins++;
  stats.streak = stats.streak > 0 ? stats.streak + 1 : 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  return stats;
}

export function recordLoss(): GameStats {
  const stats = getStats();
  stats.losses++;
  stats.streak = stats.streak < 0 ? stats.streak - 1 : -1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  return stats;
}
