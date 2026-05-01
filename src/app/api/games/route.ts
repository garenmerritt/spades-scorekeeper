import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/games — list all games for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
      // Omit `rounds` JSON from list — only fetch in detail view
    },
  });

  return NextResponse.json(games);
}

// POST /api/games — save a completed game
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const game = await prisma.game.create({
      data: {
        userId: session.user.id,
        team1Name: body.team1Name,
        team2Name: body.team2Name,
        team1Score: body.team1Score,
        team2Score: body.team2Score,
        winCondition: body.winCondition,
        bagsOn: body.bagsOn,
        winner: String(body.winner),
        rounds: body.rounds,
        totalRounds: body.totalRounds,
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save game.' },
      { status: 500 }
    );
  }
}
