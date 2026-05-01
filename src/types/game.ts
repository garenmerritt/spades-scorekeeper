export type NilType = 'none' | 'nil' | 'blind';
export type GamePhase = 'setup' | 'game' | 'over';
export type WinnerIndex = 0 | 1 | 'tie';

export interface TeamEntryInput {
  bid: string;
  nilType: NilType;
  nilMade: boolean;
  tricks: string;
}

export interface RoundTeamResult {
  bid: number;
  tricks: number;
  nilType: NilType;
  nilMade: boolean;
  nilPts: number;
  mainPts: number;
  bags: number;
  bagPenalty: number;
  total: number;
  bagsBefore: number;
  running: number;
}

export interface Round {
  n: number;
  teams: [RoundTeamResult, RoundTeamResult];
}

export interface GameSettings {
  winCondition: number;
  bagsOn: boolean;
}

export interface GameState {
  phase: GamePhase;
  names: [string, string];
  settings: GameSettings;
  scores: [number, number];
  bagTotals: [number, number];
  rounds: Round[];
  winner: WinnerIndex | null;
}
