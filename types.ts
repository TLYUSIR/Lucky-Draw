export interface Participant {
  id: string;
  name: string;
  className: string;
  roundId: number;
}

export interface Winner extends Participant {
  wonAt: string; // ISO Date string
}

export interface RoundConfig {
  id: number;
  title: string;
  className: string; // e.g., "初小 A"
  winnerCount: number;
  background: string;
  group: string; // e.g., "Primary", "Junior", "Senior"
}

export interface StageGroup {
  label: string;
  rounds: number[]; // Round IDs
  letters: string[];
}
