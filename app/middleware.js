import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect if not signed in
  if (!user) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Check if user is admin
  const { data: isAdmin, error } = await supabase
    .rpc('check_is_admin', { uid: user.id });

  if (error || !isAdmin) {
    return NextResponse.redirect(new URL('/admin/access-denied', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'], // Protect all admin routes
};
