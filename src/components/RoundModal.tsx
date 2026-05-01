'use client';

import { useState, useMemo } from 'react';
import type { GameState, TeamEntryInput, NilType } from '@/types/game';
import { calcScore, formatPoints, scoreColorClass } from '@/lib/scoring';

interface Props {
  game: GameState;
  onSubmit: (entries: [TeamEntryInput, TeamEntryInput]) => void;
  onClose: () => void;
}

const mkEntry = (): TeamEntryInput => ({
  bid: '',
  nilType: 'none',
  nilMade: true,
  tricks: '',
});

const TEAM_BORDER = ['border-blue-500', 'border-rose-500'] as const;
const TEAM_TEXT = ['text-blue-400', 'text-rose-400'] as const;

const NIL_OPTIONS: Array<{ value: NilType; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'nil', label: 'Nil (+100)' },
  { value: 'blind', label: 'Blind nil (+200)' },
];

export default function RoundModal({ game, onSubmit, onClose }: Props) {
  const [entries, setEntries] = useState<[TeamEntryInput, TeamEntryInput]>([
    mkEntry(),
    mkEntry(),
  ]);

  const update = (i: 0 | 1, patch: Partial<TeamEntryInput>) => {
    setEntries((prev) => {
      const next: [TeamEntryInput, TeamEntryInput] = [
        { ...prev[0] },
        { ...prev[1] },
      ];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  };

  // Live score previews for each team
  const previews = entries.map((e, i) => {
    const t = parseInt(e.tricks);
    if (isNaN(t)) return null;
    return calcScore(
      parseInt(e.bid) || 0,
      t,
      e.nilType,
      e.nilMade,
      game.bagTotals[i],
      game.settings.bagsOn
    );
  });

  // Submit is allowed when all required fields are filled
  const canSubmit = entries.every(
    (e) =>
      e.tricks !== '' &&
      !isNaN(parseInt(e.tricks)) &&
      (e.nilType !== 'none' ||
        (e.bid !== '' && !isNaN(parseInt(e.bid))))
  );

  // Warn if the two teams' tricks don't add up to 13
  const trickSum = useMemo(() => {
    const t0 = parseInt(entries[0].tricks);
    const t1 = parseInt(entries[1].tricks);
    return !isNaN(t0) && !isNaN(t1) ? t0 + t1 : null;
  }, [entries]);

  const handleSubmit = () => {
    if (canSubmit) onSubmit(entries);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg mt-6 mb-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">
            Round {game.rounds.length + 1}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm px-2 py-1 rounded hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>

        <div className="p-5 space-y-5">
          {([0, 1] as const).map((i) => {
            const e = entries[i];
            const preview = previews[i];

            // Build score breakdown string for display
            const breakdown = (() => {
              if (!preview) return null;
              const parts: string[] = [];
              if (preview.nilPts !== 0)
                parts.push(`nil: ${formatPoints(preview.nilPts)}`);
              if (preview.mainPts !== 0)
                parts.push(`bid: ${formatPoints(preview.mainPts)}`);
              if (preview.bagPenalty > 0)
                parts.push(`bag penalty: −${preview.bagPenalty}`);
              return parts.length > 0 ? parts.join(' · ') : null;
            })();

            return (
              <div
                key={i}
                className={`border-l-2 ${TEAM_BORDER[i]} pl-4`}
              >
                {/* Team name + live score preview */}
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-sm font-medium ${TEAM_TEXT[i]}`}>
                    {game.names[i] || `Team ${i + 1}`}
                  </p>
                  {preview !== null && (
                    <span
                      className={`text-xl font-semibold font-mono ${scoreColorClass(preview.total)}`}
                    >
                      {formatPoints(preview.total)}
                    </span>
                  )}
                </div>

                {/* Nil bid toggle */}
                <div className="mb-3">
                  <p className="text-xs text-zinc-600 mb-2">Nil bid</p>
                  <div className="flex gap-2 flex-wrap">
                    {NIL_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => update(i, { nilType: value })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          e.nilType === value
                            ? 'bg-amber-500 text-zinc-950'
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bid + tricks + nil made */}
                <div className="flex gap-4 flex-wrap items-end">
                  <div>
                    <p className="text-xs text-zinc-600 mb-1.5">
                      {e.nilType !== 'none' ? 'Partner bid' : 'Bid'}
                    </p>
                    <input
                      type="number"
                      min={0}
                      max={13}
                      value={e.bid}
                      onChange={(ev) => update(i, { bid: ev.target.value })}
                      placeholder="0"
                      className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-2.5 text-center text-lg font-mono text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-zinc-600 mb-1.5">Tricks won</p>
                    <input
                      type="number"
                      min={0}
                      max={13}
                      value={e.tricks}
                      onChange={(ev) => update(i, { tricks: ev.target.value })}
                      placeholder="0"
                      className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-2.5 text-center text-lg font-mono text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>

                  {e.nilType !== 'none' && (
                    <div>
                      <p className="text-xs text-zinc-600 mb-1.5">Nil made?</p>
                      <div className="flex gap-2">
                        {([true, false] as const).map((v) => (
                          <button
                            key={String(v)}
                            onClick={() => update(i, { nilMade: v })}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                              e.nilMade === v
                                ? 'bg-amber-500 text-zinc-950'
                                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {v ? 'Yes' : 'No'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Score breakdown */}
                {breakdown && (
                  <p className="text-xs text-zinc-600 font-mono mt-2">
                    {breakdown}
                  </p>
                )}
              </div>
            );
          })}

          {/* Trick sum warning */}
          {trickSum !== null && trickSum !== 13 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
              <p className="text-xs text-amber-400">
                Tricks total {trickSum}/13 — double-check before recording
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="px-5 pb-5">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3 bg-zinc-100 text-zinc-950 rounded-xl font-semibold text-sm hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Record round
          </button>
        </div>
      </div>
    </div>
  );
}
