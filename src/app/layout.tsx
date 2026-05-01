import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Providers from '@/components/Providers';
import Nav from '@/components/Nav';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Spades Scorekeeper',
  description: 'Track your Spades games — Joker Joker Deuce Deuce rules.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-zinc-950 text-zinc-100`}>
        <Providers>
          <Nav user={session?.user ?? null} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
