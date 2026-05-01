'use client';

import type { GameState } from '@/types/game';
import { formatPoints, scoreColorClass } from '@/lib/scoring';

interface Props {
  game: GameState;
  onOpenModal: () => void;
  onUndo: () => void;
  onToggleBags: () => void;
  onReset: () => void;
}

const TEAM_LABEL = ['text-blue-400', 'text-rose-400'] as const;
const TEAM_BAR = ['bg-blue-500', 'bg-rose-500'] as const;

export default function GameScreen({
  game,
  onOpenModal,
  onUndo,
  onToggleBags,
  onReset,
}: Props) {
  const { names, scores, bagTotals, rounds, settings } = game;
  const { winCondition, bagsOn } = settings;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5 pt-1">
          <span className="text-zinc-200 font-semibold">♠ Spades</span>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={onToggleBags}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                bagsOn
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Bags {bagsOn ? 'on' : 'off'}
            </button>
            <span className="text-xs text-zinc-600">to {winCondition}</span>
            {rounds.length > 0 && (
              <button
                onClick={onUndo}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
              >
                Undo
              </button>
            )}
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ── Score cards ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {([0, 1] as const).map((i) => {
            const pct = Math.min(
              100,
              Math.max(0, (scores[i] / winCondition) * 100)
            );
            const curBags = bagTotals[i] % 10;
            const bagPens = Math.floor(bagTotals[i] / 10);

            return (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 relative overflow-hidden"
              >
                {/* Watermark */}
                <span className="absolute right-1 bottom-0 text-8xl text-zinc-800/20 select-none pointer-events-none leading-none">
                  ♠
                </span>

                <p className={`text-sm font-medium ${TEAM_LABEL[i]} mb-1 truncate`}>
                  {names[i] || `Team ${i + 1}`}
                </p>

                <p className="text-5xl font-semibold font-mono text-zinc-100 leading-none mb-3">
                  {scores[i]}
                </p>

                {bagsOn && (
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        curBags >= 7
                          ? 'bg-red-500/20 text-red-400'
                          : curBags >= 5
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {curBags}/10 bags
                    </span>
                    {bagPens > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                        {bagPens}× penalty
                      </span>
                    )}
                  </div>
                )}

                {/* Progress toward win condition */}
                <div className="h-0.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${TEAM_BAR[i]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-700 mt-1.5">
                  {Math.max(0, winCondition - scores[i])} to go
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Score Round button ── */}
        <button
          onClick={onOpenModal}
          className="w-full py-3.5 bg-zinc-100 text-zinc-950 rounded-xl font-semibold text-base hover:bg-white transition-colors mb-6"
        >
          Score round {rounds.length + 1}
        </button>

        {/* ── Round history ── */}
        {rounds.length > 0 && (
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">
              Round history
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[32px_1fr_1fr] px-4 py-2 bg-zinc-800/60 border-b border-zinc-800">
                <span className="text-xs text-zinc-600">#</span>
                {([0, 1] as const).map((i) => (
                  <span key={i} className={`text-xs font-medium ${TEAM_LABEL[i]}`}>
                    {names[i] || `Team ${i + 1}`}
                  </span>
                ))}
              </div>

              {/* Rows — newest first */}
              {[...rounds].reverse().map((r) => (
                <div
                  key={r.n}
                  className="grid grid-cols-[32px_1fr_1fr] px-4 py-2.5 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors"
                >
                  <span className="text-xs text-zinc-700 font-mono self-center">
                    {r.n}
                  </span>
                  {r.teams.map((t, i) => {
                    const bidLabel =
                      t.nilType === 'blind'
                        ? `BN+${t.bid}`
                        : t.nilType === 'nil'
                        ? `Nil+${t.bid}`
                        : `${t.bid}`;
                    return (
                      <div key={i}>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs text-zinc-500 font-mono">
                            {bidLabel}/{t.tricks}
                          </span>
                          <span
                            className={`text-sm font-medium font-mono ${scoreColorClass(t.total)}`}
                          >
                            {formatPoints(t.total)}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-700 font-mono">
                          → {t.running}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
