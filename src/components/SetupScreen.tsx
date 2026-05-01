'use client';

import { useState } from 'react';

interface Props {
  onStart: (names: [string, string], winCondition: number, bagsOn: boolean) => void;
}

const WIN_OPTIONS = [250, 300, 500] as const;

// Tailwind classes for each team's color accent
const TEAM_BORDER = ['border-blue-600', 'border-rose-600'] as const;
const TEAM_TEXT = ['text-blue-400', 'text-rose-400'] as const;

export default function SetupScreen({ onStart }: Props) {
  const [names, setNames] = useState<[string, string]>(['Team 1', 'Team 2']);
  const [winChoice, setWinChoice] = useState<number | 'custom'>(500);
  const [customWin, setCustomWin] = useState('');
  const [bagsOn, setBagsOn] = useState(true);

  const handleStart = () => {
    const wc =
      winChoice === 'custom' ? parseInt(customWin) || 500 : winChoice;
    onStart(names, wc, bagsOn);
  };

  const updateName = (i: 0 | 1, val: string) => {
    const updated: [string, string] = [...names] as [string, string];
    updated[i] = val;
    setNames(updated);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-5xl mb-2 select-none">♠</p>
          <h1 className="text-2xl font-semibold tracking-wide text-zinc-100">
            Spades
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Scorekeeper</p>
          <p className="mt-3 text-xs text-zinc-600 font-mono">
            Big Joker › Little Joker › 2♠ › 2♦ › A♠ K♠ …
          </p>
        </div>

        {/* Team names */}
        <div className="mb-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
            Team names
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([0, 1] as const).map((i) => (
              <div key={i}>
                <label className={`text-xs font-medium mb-1 block ${TEAM_TEXT[i]}`}>
                  Team {i + 1}
                </label>
                <input
                  type="text"
                  value={names[i]}
                  maxLength={16}
                  onChange={(e) => updateName(i, e.target.value)}
                  placeholder={`Team ${i + 1}`}
                  className={`w-full bg-zinc-950 border-l-2 ${TEAM_BORDER[i]} border-y border-r border-zinc-800 rounded-r-lg px-3 py-2 text-sm font-medium text-zinc-100 outline-none focus:border-zinc-600 transition-colors`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Win condition */}
        <div className="mb-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
            Win condition
          </p>
          <div className="flex gap-2 flex-wrap">
            {WIN_OPTIONS.map((v) => (
              <button
                key={v}
                onClick={() => { setWinChoice(v); setCustomWin(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  winChoice === v
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                {v}
              </button>
            ))}
            <button
              onClick={() => setWinChoice('custom')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                winChoice === 'custom'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              Custom
            </button>
          </div>
          {winChoice === 'custom' && (
            <input
              type="number"
              value={customWin}
              onChange={(e) => setCustomWin(e.target.value)}
              placeholder="Enter points (e.g. 350)"
              className="mt-3 w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
            />
          )}
        </div>

        {/* Sandbag penalty toggle */}
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200">Sandbag penalty</p>
            <p className="text-xs text-zinc-500 mt-0.5">Every 10 bags −100 pts</p>
          </div>
          <button
            onClick={() => setBagsOn((p) => !p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              bagsOn
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {bagsOn ? 'On' : 'Off'}
          </button>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3 bg-zinc-100 text-zinc-950 rounded-xl font-semibold text-base hover:bg-white transition-colors"
        >
          Deal in
        </button>
      </div>
    </div>
  );
}
