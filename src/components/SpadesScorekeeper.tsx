'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { processRound, checkWinner } from '@/lib/scoring';
import type { GameState, TeamEntryInput } from '@/types/game';
import SetupScreen from './SetupScreen';
import GameScreen from './GameScreen';
import RoundModal from './RoundModal';
import GameOverScreen from './GameOverScreen';

const INITIAL_STATE: GameState = {
  phase: 'setup',
  names: ['Team 1', 'Team 2'],
  settings: { winCondition: 500, bagsOn: true },
  scores: [0, 0],
  bagTotals: [0, 0],
  rounds: [],
  winner: null,
};

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'unauthenticated';

export default function SpadesScorekeeper() {
  const { data: session } = useSession();
  const [game, setGame, isLoaded] = useLocalStorage<GameState>(
    'spades-game',
    INITIAL_STATE
  );
  const [showModal, setShowModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [savedGameId, setSavedGameId] = useState<string | null>(null);

  // ── Save a completed game to the database ─────────────────────────────────
  const saveGame = async (finishedGame: GameState) => {
    if (!session?.user?.id) {
      setSaveStatus('unauthenticated');
      return;
    }
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1Name: finishedGame.names[0],
          team2Name: finishedGame.names[1],
          team1Score: finishedGame.scores[0],
          team2Score: finishedGame.scores[1],
          winCondition: finishedGame.settings.winCondition,
          bagsOn: finishedGame.settings.bagsOn,
          winner: String(finishedGame.winner),
          rounds: finishedGame.rounds,
          totalRounds: finishedGame.rounds.length,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      setSavedGameId(saved.id);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStart = (
    names: [string, string],
    winCondition: number,
    bagsOn: boolean
  ) => {
    setSaveStatus('idle');
    setSavedGameId(null);
    setGame({
      phase: 'game',
      names,
      settings: { winCondition, bagsOn },
      scores: [0, 0],
      bagTotals: [0, 0],
      rounds: [],
      winner: null,
    });
  };

  const handleSubmitRound = (entries: [TeamEntryInput, TeamEntryInput]) => {
    const { teams, newScores, newBagTotals } = processRound(
      entries,
      game.scores,
      game.bagTotals,
      game.settings.bagsOn
    );
    const newRounds = [...game.rounds, { n: game.rounds.length + 1, teams }];
    const winner = checkWinner(newScores, game.settings.winCondition);

    const newState: GameState = {
      ...game,
      scores: newScores,
      bagTotals: newBagTotals,
      rounds: newRounds,
      winner,
      phase: winner !== null ? 'over' : 'game',
    };

    setGame(newState);
    setShowModal(false);

    if (winner !== null) {
      saveGame(newState);
    }
  };

  const handleUndo = () => {
    if (!game.rounds.length) return;
    const last = game.rounds[game.rounds.length - 1];
    setGame({
      ...game,
      scores: [
        last.teams[0].running - last.teams[0].total,
        last.teams[1].running - last.teams[1].total,
      ] as [number, number],
      bagTotals: [
        last.teams[0].bagsBefore,
        last.teams[1].bagsBefore,
      ] as [number, number],
      rounds: game.rounds.slice(0, -1),
    });
  };

  const handleToggleBags = () => {
    setGame({
      ...game,
      settings: { ...game.settings, bagsOn: !game.settings.bagsOn },
    });
  };

  const handleReset = () => {
    setGame(INITIAL_STATE);
    setShowModal(false);
    setSaveStatus('idle');
    setSavedGameId(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
        <span className="text-zinc-800 text-5xl select-none">♠</span>
      </div>
    );
  }

  if (game.phase === 'setup') {
    return <SetupScreen onStart={handleStart} />;
  }

  if (game.phase === 'over') {
    return (
      <GameOverScreen
        game={game}
        onNewGame={handleReset}
        saveStatus={saveStatus}
        savedGameId={savedGameId}
        onRetrySave={() => saveGame(game)}
      />
    );
  }

  return (
    <>
      <GameScreen
        game={game}
        onOpenModal={() => setShowModal(true)}
        onUndo={handleUndo}
        onToggleBags={handleToggleBags}
        onReset={handleReset}
      />
      {showModal && (
        <RoundModal
          game={game}
          onSubmit={handleSubmitRound}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
