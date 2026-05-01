'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface NavUser {
  name?: string | null;
  email?: string | null;
}

interface Props {
  user: NavUser | null;
}

export default function Nav({ user }: Props) {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      pathname === href
        ? 'text-zinc-100 font-medium'
        : 'text-zinc-500 hover:text-zinc-300'
    }`;

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Left — logo + nav links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-zinc-100 font-semibold text-sm select-none">
            ♠ Spades
          </Link>
          {user && (
            <Link href="/history" className={linkClass('/history')}>
              History
            </Link>
          )}
        </div>

        {/* Right — auth state */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-zinc-600 hidden sm:block truncate max-w-[160px]">
                {user.name || user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded hover:bg-zinc-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
