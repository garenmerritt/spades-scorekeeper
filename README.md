# Spades Scorekeeper

Digital scorekeeper for Spades with user accounts, game history, and stats.
Built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and Neon PostgreSQL.

## Trump order

```
Big Joker › Little Joker › 2♠ › 2♦ › A♠ K♠ Q♠ …
```

## Features

- Email + password authentication (NextAuth.js)
- Nil (+100) and Blind Nil (+200) bids
- Sandbag penalty — configurable per game, togglable mid-game
- Auto-saves completed games to database (when signed in)
- **History page**: win/loss chart by team name, score trend line chart, full game list
- **Game detail page**: round-by-round breakdown with bid, tricks, and point split
- Game state persists across refreshes (localStorage)

---

## Local setup

### 1 — Clone and install

```bash
git clone https://github.com/YOU/spades-scorekeeper
cd spades-scorekeeper
npm install
```

### 2 — Set up Neon database

1. Go to [neon.tech](https://neon.tech) → create a free account → **New Project**
2. Copy the **Connection string** (it looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)

### 3 — Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://..."   # from Neon

NEXTAUTH_SECRET="..."             # run: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 4 — Push the schema to Neon

```bash
npm run db:push
```

This creates the `User` and `Game` tables via Prisma.

### 5 — Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com) → New Project
3. Add environment variables in Vercel's dashboard:
   - `DATABASE_URL` — your Neon connection string
   - `NEXTAUTH_SECRET` — your secret
   - `NEXTAUTH_URL` — your Vercel deployment URL (e.g. `https://spades-xxx.vercel.app`)
4. Deploy

> **Tip:** After deploying, update `NEXTAUTH_URL` to your production URL if it wasn't set before the first deploy.

---

## Project structure

```
prisma/
  schema.prisma          User + Game models

src/
  app/
    api/
      auth/[...nextauth]/ NextAuth handler
      register/           POST — create account
      games/              GET list | POST save game
      games/[id]/         GET single game with rounds
    login/                Sign in page
    register/             Create account page
    history/              Stats + game list (protected)
    history/[id]/         Round-by-round game detail
    layout.tsx            Root layout with Nav
    page.tsx              Home / play page
  components/
    SpadesScorekeeper.tsx State orchestrator + auto-save
    SetupScreen.tsx       Game setup form
    GameScreen.tsx        Main game view
    RoundModal.tsx        Round entry modal
    GameOverScreen.tsx    Winner screen with save status
    Nav.tsx               Top nav with auth state
    Providers.tsx         SessionProvider wrapper
    WinsChart.tsx         Bar chart — wins by team name
    ScoreLineChart.tsx    Line chart — score trend over games
  lib/
    auth.ts               NextAuth config (Credentials)
    prisma.ts             Prisma singleton client
    scoring.ts            Pure scoring logic
    useLocalStorage.ts    SSR-safe localStorage hook
  types/
    game.ts               Game state TypeScript types
    next-auth.d.ts        Session type augmentation
  middleware.ts           Protect /history routes
```

## Scoring reference

| Situation | Points |
|-----------|--------|
| Made bid | bid × 10 |
| Overtrick (bag) | +1 each |
| Missed bid | −(bid × 10) |
| Nil — made | +100 |
| Nil — failed | −100 |
| Blind Nil — made | +200 |
| Blind Nil — failed | −200 |
| Every 10 bags (if on) | −100 |
