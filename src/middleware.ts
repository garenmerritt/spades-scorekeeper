import { withAuth } from 'next-auth/middleware';

// Protect /history and all sub-routes.
// If unauthenticated, NextAuth redirects to /login?callbackUrl=/history
// and after sign-in automatically bounces back.
export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/history/:path*'],
};
