import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import WinsChart, { type TeamStat } from '@/components/WinsChart';
import ScoreLineChart, { type ScorePoint } from '@/components/ScoreLineChart';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const games = await prisma.game.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      team1Name: true,
      team2Name: true,
      team1Score: true,
      team2Score: true,
      winCondition: true,
      bagsOn: true,
      winner: true,
      totalRounds: true,
      createdAt: true,
    },
  });

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalGames = games.length;
  const totalRounds = games.reduce((s, g) => s + g.totalRounds, 0);
  const avgRounds = totalGames > 0 ? Math.round(totalRounds / totalGames) : 0;

  // Win/loss by team name
  const statsMap: Record<string, { wins: number; losses: number; ties: number }> = {};
  for (const game of games) {
    const names = [game.team1Name, game.team2Name] as const;
    for (let i = 0; i < 2; i++) {
      const name = names[i];
      if (!statsMap[name]) statsMap[name] = { wins: 0, losses: 0, ties: 0 };
      if (game.winner === String(i)) statsMap[name].wins++;
      else if (game.winner === 'tie') statsMap[name].ties++;
      else statsMap[name].losses++;
    }
  }

  const teamStats: TeamStat[] = Object.entries(statsMap)
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 10);

  // Score trend — most recent 15 games, oldest first for the chart
  const scoreData: ScorePoint[] = [...games]
    .slice(0, 15)
    .reverse()
    .map((game, idx) => ({
      label: `G${idx + 1}`,
      team1Score: game.team1Score,
      team2Score: game.team2Score,
      team1Name: game.team1Name,
      team2Name: game.team2Name,
    }));

  const winnerName = (game: typeof games[0]) => {
    if (game.winner === 'tie') return 'Tie';
    const idx = parseInt(game.winner) as 0 | 1;
    return [game.team1Name, game.team2Name][idx];
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-zinc-100">Game history</h1>
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600"
        >
          ♠ Play
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Games played', value: totalGames },
          { label: 'Total rounds', value: totalRounds },
          { label: 'Avg rounds/game', value: avgRounds },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-600 mb-1">{label}</p>
            <p className="text-2xl font-semibold font-mono text-zinc-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Win/loss chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
          Wins by team name
        </p>
        <WinsChart data={teamStats} />
      </div>

      {/* Score trend */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
          Score trend — last {Math.min(15, totalGames)} games
        </p>
        <p className="text-xs text-zinc-700 mb-4">Final score per game</p>
        <ScoreLineChart data={scoreData} />
      </div>

      {/* Games list */}
      <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">All games</p>

      {games.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-zinc-600 text-sm">No games saved yet.</p>
          <Link href="/" className="text-zinc-400 text-sm hover:text-zinc-200 transition-colors mt-2 inline-block">
            Play your first game →
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_80px_56px] px-4 py-2 bg-zinc-800/60 border-b border-zinc-800 text-xs text-zinc-500">
            <span>Teams</span>
            <span>Score</span>
            <span>Winner</span>
            <span>Rnds</span>
          </div>

          {games.map((game) => {
            const winner = winnerName(game);
            const winnerIsTeam1 = game.winner === '0';
            const winnerIsTeam2 = game.winner === '1';
            return (
              <Link
                key={game.id}
                href={`/history/${game.id}`}
                className="grid grid-cols-[1fr_1fr_80px_56px] px-4 py-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors items-center"
              >
                {/* Teams */}
                <div>
                  <p className={`text-sm ${winnerIsTeam1 ? 'text-zinc-100 font-medium' : 'text-zinc-400'}`}>
                    {game.team1Name}
                  </p>
                  <p className={`text-sm ${winnerIsTeam2 ? 'text-zinc-100 font-medium' : 'text-zinc-400'}`}>
                    {game.team2Name}
                  </p>
                </div>
                {/* Scores */}
                <div className="font-mono">
                  <p className={`text-sm ${winnerIsTeam1 ? 'text-zinc-100' : 'text-zinc-400'}`}>
                    {game.team1Score}
                  </p>
                  <p className={`text-sm ${winnerIsTeam2 ? 'text-zinc-100' : 'text-zinc-400'}`}>
                    {game.team2Score}
                  </p>
                </div>
                {/* Winner */}
                <p className="text-sm text-zinc-300 truncate">{winner}</p>
                {/* Rounds */}
                <p className="text-sm text-zinc-500 font-mono">{game.totalRounds}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
