'use client';

import Link from 'next/link';
import type { GameState } from '@/types/game';
import type { SaveStatus } from './SpadesScorekeeper';

interface Props {
  game: GameState;
  onNewGame: () => void;
  saveStatus: SaveStatus;
  savedGameId: string | null;
  onRetrySave: () => void;
}

const TEAM_LABEL = ['text-blue-400', 'text-rose-400'] as const;
const TEAM_BORDER = ['border-blue-800', 'border-rose-800'] as const;

function SaveStatusBadge({
  saveStatus,
  savedGameId,
  onRetrySave,
}: {
  saveStatus: SaveStatus;
  savedGameId: string | null;
  onRetrySave: () => void;
}) {
  if (saveStatus === 'saving') {
    return (
      <p className="text-xs text-zinc-500 animate-pulse">Saving game…</p>
    );
  }

  if (saveStatus === 'saved' && savedGameId) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-emerald-500">Game saved</span>
        <Link
          href={`/history/${savedGameId}`}
          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors underline underline-offset-2"
        >
          View details →
        </Link>
      </div>
    );
  }

  if (saveStatus === 'error') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400">Save failed</span>
        <button
          onClick={onRetrySave}
          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors underline underline-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  if (saveStatus === 'unauthenticated') {
    return (
      <Link
        href="/login"
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
      >
        Sign in to save game history
      </Link>
    );
  }

  return null;
}

export default function GameOverScreen({
  game,
  onNewGame,
  saveStatus,
  savedGameId,
  onRetrySave,
}: Props) {
  const { names, scores, rounds, settings, winner } = game;

  const winnerName =
    winner === 'tie'
      ? null
      : names[winner as 0 | 1] || `Team ${(winner as number) + 1}`;

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-5xl mb-4 select-none">♠</p>

        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">
          {winner === 'tie' ? 'Tie game' : `${winnerName} wins`}
        </h1>

        <p className="text-sm text-zinc-500 mb-2">
          {rounds.length} rounds · first to {settings.winCondition}
        </p>

        {/* Save status */}
        <div className="flex justify-center mb-6">
          <SaveStatusBadge
            saveStatus={saveStatus}
            savedGameId={savedGameId}
            onRetrySave={onRetrySave}
          />
        </div>

        {/* Final scores */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {([0, 1] as const).map((i) => (
            <div
              key={i}
              className={`bg-zinc-900 border rounded-xl p-4 ${
                winner === i ? TEAM_BORDER[i] : 'border-zinc-800'
              }`}
            >
              <p className={`text-sm font-medium mb-1 truncate ${TEAM_LABEL[i]}`}>
                {names[i] || `Team ${i + 1}`}
              </p>
              <p className="text-4xl font-semibold text-zinc-100 font-mono">
                {scores[i]}
              </p>
              {winner === i && (
                <p className="text-xs text-amber-500 mt-1 font-medium">Winner</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onNewGame}
            className="w-full py-3 bg-zinc-100 text-zinc-950 rounded-xl font-semibold hover:bg-white transition-colors"
          >
            New game
          </button>

          {saveStatus === 'saved' && (
            <Link
              href="/history"
              className="w-full py-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors text-center"
            >
              View history →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
