import type { NilType, TeamEntryInput, RoundTeamResult, WinnerIndex } from '@/types/game';

export interface ScoreResult {
  nilPts: number;
  mainPts: number;
  bags: number;
  bagPenalty: number;
  total: number;
}

/**
 * Calculate the score for one team in a single round.
 * Pure function — no side effects.
 */
export function calcScore(
  bid: number,
  tricks: number,
  nilType: NilType,
  nilMade: boolean,
  bagsBefore: number,
  bagsOn: boolean
): ScoreResult {
  // Nil / blind nil points
  let nilPts = 0;
  if (nilType === 'nil') nilPts = nilMade ? 100 : -100;
  if (nilType === 'blind') nilPts = nilMade ? 200 : -200;

  // Standard bid points
  let mainPts = 0;
  let bags = 0;
  if (bid > 0) {
    if (tricks >= bid) {
      const over = tricks - bid;
      mainPts = bid * 10 + over; // 10 pts per trick bid + 1 pt per overtrick
      bags = over;
    } else {
      mainPts = -(bid * 10); // missed bid — lose 10 pts per trick bid
    }
  }

  // Sandbag penalty: every 10 cumulative bags = −100 pts
  let bagPenalty = 0;
  if (bagsOn && bags > 0) {
    const crossings =
      Math.floor((bagsBefore + bags) / 10) - Math.floor(bagsBefore / 10);
    bagPenalty = crossings * 100;
  }

  return { nilPts, mainPts, bags, bagPenalty, total: nilPts + mainPts - bagPenalty };
}

/**
 * Process a full round for both teams, returning updated state values.
 */
export function processRound(
  entries: [TeamEntryInput, TeamEntryInput],
  scores: [number, number],
  bagTotals: [number, number],
  bagsOn: boolean
): {
  teams: [RoundTeamResult, RoundTeamResult];
  newScores: [number, number];
  newBagTotals: [number, number];
} {
  const newScores: [number, number] = [scores[0], scores[1]];
  const newBagTotals: [number, number] = [bagTotals[0], bagTotals[1]];
  const teams: RoundTeamResult[] = [];

  for (let i = 0; i < 2; i++) {
    const e = entries[i];
    const bid = parseInt(e.bid) || 0;
    const tricks = parseInt(e.tricks) || 0;
    const r = calcScore(bid, tricks, e.nilType, e.nilMade, newBagTotals[i], bagsOn);
    teams.push({
      bid,
      tricks,
      nilType: e.nilType,
      nilMade: e.nilMade,
      bagsBefore: newBagTotals[i],
      ...r,
      running: newScores[i] + r.total,
    });
    newScores[i] += r.total;
    newBagTotals[i] += r.bags;
  }

  return {
    teams: teams as [RoundTeamResult, RoundTeamResult],
    newScores,
    newBagTotals,
  };
}

/**
 * Check if the game has been won. Returns the winner index, 'tie', or null.
 * If both teams cross the threshold in the same round, highest score wins.
 */
export function checkWinner(
  scores: [number, number],
  winCondition: number
): WinnerIndex | null {
  if (scores[0] >= winCondition || scores[1] >= winCondition) {
    if (scores[0] > scores[1]) return 0;
    if (scores[1] > scores[0]) return 1;
    return 'tie';
  }
  return null;
}

/** Format a score delta with a leading + or − sign. */
export function formatPoints(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

/** Return a Tailwind text-color class for a score delta. */
export function scoreColorClass(n: number): string {
  if (n > 0) return 'text-emerald-400';
  if (n < 0) return 'text-red-400';
  return 'text-zinc-500';
}
