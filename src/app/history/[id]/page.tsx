import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Round } from '@/types/game';

export const dynamic = 'force-dynamic';

function formatPoints(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

export default async function GameDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const game = await prisma.game.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!game) notFound();

 const rounds = game.rounds as unknown as Round[];
  const names = [game.team1Name, game.team2Name] as const;
  const finalScores = [game.team1Score, game.team2Score] as const;

  const winnerName =
    game.winner === 'tie'
      ? 'Tie'
      : names[parseInt(game.winner) as 0 | 1];

  const TEAM_LABEL = ['text-blue-400', 'text-rose-400'] as const;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-16">
      {/* Back link */}
      <Link
        href="/history"
        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-flex items-center gap-1"
      >
        ← History
      </Link>

      {/* Game header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mt-4 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-zinc-600 mb-1">
              {new Date(game.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-zinc-400">
              First to {game.winCondition} · Bags {game.bagsOn ? 'on' : 'off'} · {game.totalRounds} rounds
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 font-medium">
            {winnerName} wins
          </span>
        </div>

        {/* Final scores */}
        <div className="grid grid-cols-2 gap-3">
          {([0, 1] as const).map((i) => (
            <div key={i} className={`p-3 rounded-lg border ${game.winner === String(i) ? 'border-zinc-600 bg-zinc-800' : 'border-zinc-800'}`}>
              <p className={`text-xs font-medium mb-1 ${TEAM_LABEL[i]}`}>{names[i]}</p>
              <p className="text-3xl font-semibold font-mono text-zinc-100">{finalScores[i]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Round-by-round breakdown */}
      <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">
        Round breakdown
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[32px_1fr_1fr] px-4 py-2 bg-zinc-800/60 border-b border-zinc-800">
          <span className="text-xs text-zinc-600">#</span>
          {([0, 1] as const).map((i) => (
            <span key={i} className={`text-xs font-medium ${TEAM_LABEL[i]}`}>
              {names[i]}
            </span>
          ))}
        </div>

        {rounds.map((r) => (
          <div
            key={r.n}
            className="grid grid-cols-[32px_1fr_1fr] px-4 py-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors"
          >
            <span className="text-xs text-zinc-600 font-mono self-center">{r.n}</span>
            {r.teams.map((t, i) => {
              const bidLabel =
                t.nilType === 'blind'
                  ? `BN+${t.bid}`
                  : t.nilType === 'nil'
                  ? `Nil+${t.bid}`
                  : `${t.bid}`;

              const ptColor =
                t.total > 0
                  ? 'text-emerald-400'
                  : t.total < 0
                  ? 'text-red-400'
                  : 'text-zinc-500';

              return (
                <div key={i}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-zinc-500 font-mono">
                      {bidLabel}/{t.tricks}
                    </span>
                    <span className={`text-sm font-medium font-mono ${ptColor}`}>
                      {formatPoints(t.total)}
                    </span>
                  </div>
                  {/* Bags earned this round */}
                  {t.bags > 0 && (
                    <span className="text-xs text-zinc-700 font-mono">
                      +{t.bags} bag{t.bags !== 1 ? 's' : ''}
                      {t.bagPenalty > 0 && `, −${t.bagPenalty} pen`}
                    </span>
                  )}
                  <div className="text-xs text-zinc-600 font-mono">→ {t.running}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
